const fs = require('fs');
const { Web3 } = require("web3");
const { invokeContractFunction } = require('./lib/blockchain');
const { performRestCall } = require('./lib/rest');
const ExcelJS = require('exceljs');
const yargs = require('yargs/yargs');
const {hideBin} = require("yargs/helpers");
const path = require('path');
const {MongoClient} = require("mongodb");

const argv = yargs(hideBin(process.argv))
    .option('t', {
        alias: 'Test executed',
        type: 'string',
        description: 'Test executed',
        demandOption: false
    })
    .option('n', {
        alias: 'execution number',
        type: 'number',
        description: 'Execution number',
        demandOption: false
    })
    .help()
    .argv;

// Initialize Web3 with the local node URL (Ganache)
const web3 = new Web3('http://127.0.0.1:7545');
// Load input data (generated from generateJSONs.js) for Web3 and REST calls
const blockchainInputs = JSON.parse(fs.readFileSync('./data/blockchain_inputs.json', 'utf8'));
const restInputs = JSON.parse(fs.readFileSync('./data/rest_inputs.json', 'utf8'));
// Declare global variables to store dynamic data during execution
let instanceId = "";
let martsiaId = 0;
let rsaKey = [];
let readingPolicies = [];
let encryptedIpfsLinks = [];
// ABIs of the two contracts
const contractABI1 = JSON.parse(fs.readFileSync("../Confidentiality\ Manager/blockchain/build/contracts/StateContract.json", 'utf8')).abi;
const contractABI2 = JSON.parse(fs.readFileSync("../Confidentiality\ Manager/blockchain/build/contracts/ConfidentialContract.json", 'utf8')).abi;
// Addresses of the two contracts
const contractAddress1 = fs.readFileSync("../Confidentiality\ Manager/src/.env", 'utf8').match(/CONTRACT_ADDRESS_CHORCHAIN="(0x[a-fA-F0-9]{40})"/)?.[1] || 'Not found';
const contractAddress2 = fs.readFileSync("../Confidentiality\ Manager/src/.env", 'utf8').match(/CONTRACT_ADDRESS_MARTSIA="(0x[a-fA-F0-9]{40})"/)?.[1] || 'Not found';

// Create contract instances for both contracts
const contract1 = new web3.eth.Contract(contractABI1, contractAddress1);
const contract2 = new web3.eth.Contract(contractABI2, contractAddress2);

function columnNumberToLetter(columnNumber) {
    let columnLetter = '';
    while (columnNumber > 0) {
        let remainder = (columnNumber - 1) % 26;
        columnLetter = String.fromCharCode(remainder + 65) + columnLetter;
        columnNumber = Math.floor((columnNumber - 1) / 26);
    }
    return columnLetter;
}


function adjustNumber(n) {
    if (n <= 5) return n;  // Do nothing if n is ≤ 5
    return n + Math.floor((n - 1) / 5);
}


function adjustNumber2(n) {
    if (n <= 5) return n;  // Keep values 1-5 unchanged
    let quotient = Math.floor(n / 5) -1;
    if (n % 5 !== 0) {
        quotient += 1; // Increment by 1 if there's a remainder
    }
    return n + quotient + Math.floor((n - 1) / 5) * 2;
}


async function fetchId() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    let document;
    // Wait until at least one document exists in the collection
    while (!document) {
        document = await client.db('ChorChain').collection('Model').findOne({});
        // Wait for 1 second before checking again to avoid overloading the database
        if (!document) {
            console.log('No document found, retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Retry after 1 second
        }
    }
    await client.close();
    return document._id.toString();
}


async function dropAllCollectionsExceptUser() {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('ChorChain');
    const collections = await db.listCollections().toArray();
    await Promise.all(collections
        .filter(col => col.name !== 'User')
        .map(col => db.collection(col.name).drop())
    );
    await client.close();
}


/**
 * Processes a Web3 call using predefined parameters.
 * Modifies parameters based on the specific Web3 function requirements.
 * @param {string} name - The name of the Web3 call.
 * @returns {Promise<Object>} - The result of the Web3 call.
 */
async function processWeb3Call(name) {
    // Find the relevant input data for the Web3 call from blockchainInputs
    const inputs = blockchainInputs.find(input => input.name === name);
    const { contractInfo, functionName, params, role } = inputs;
    // Modify parameters based on function type
    if (params.hasOwnProperty("process_id") && params.process_id === 0) {
        params.process_id = martsiaId;
    }
    // Modify parameters based on specific function names
    if (functionName === "setPublicKeyReaders") {
        params.ipfs_link_1 = rsaKey[0];
        params.ipfs_link_2 = rsaKey[1];
    } else if (functionName === "instantiateProcess") {
        params.hashLink1 = readingPolicies[0];
        params.hashLink2 = readingPolicies[1];
    } else if (functionName === "setIPFSLink") {
        params.ipfs_link_1 = encryptedIpfsLinks[0];
        params.ipfs_link_2 = encryptedIpfsLinks[1];
    }
    // Execute the Web3 contract function and handle result
    try {
        const startTime = Date.now();  // Start the timer
        const result = await invokeContractFunction(contractInfo, functionName, params, role);
        const elapsedTime = Date.now() - startTime;  // Calculate elapsed time
        if ((testType === "t1" || testType === "t3" || testType === "t8") && (executionNumber === 1 || (executionNumber > 5 && executionNumber % 5 === 1))) {
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(adjustNumber2(executionNumber)), 'Web3');
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(adjustNumber2(executionNumber)+1), name);
        }
        else if (testType !== 0 && executionNumber === 1) {
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(1), 'Web3');
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(2), name);
        }
        if (testType === "t1" || testType === "t3" || testType === "t8") {
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(adjustNumber2(executionNumber) + 2 ), elapsedTime);
        }
        else if (testType !== 0) {
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(adjustNumber(executionNumber) + 2 ), elapsedTime);
        }
        console.log(`Successfully executed ${name} on contract at ${contractInfo}`);
        console.log(name, elapsedTime);
        return result;
    } catch (error) {
        console.error(`Failed to execute ${name} on contract at ${contractInfo}:`, "No blockchain");
        console.log(error);
    }
}


/**
 * Processes a REST call based on input data.
 * Dynamically adjusts parameters based on the call name.
 * @param {string} name - The name of the REST call.
 * @returns {Promise<Object>} - The response from the REST call.
 */
async function processRestCall(name) {
    try {
        // Retrieve input data for the REST call
        const input = restInputs.find(input => input.name === name);
        if (!input) {
            console.error(`No input found for name: ${name}`);
            return;
        }
        const { method, data } = input;
        let { endpoint } = input;
        let response;
        if (name === "createInstance") {
            const modell = await fetchId();
            data.modelID = modell;
        }
        else if (name === "saveModel") {
            await dropAllCollectionsExceptUser();
        }
        const startTime = Date.now();  // Start the timer
        // Handle different types of REST calls with specific logic
        if (name === "createInstance") {
            response = await performRestCall(method, endpoint, data);
            instanceId = response.id;
            martsiaId = response.martsiaId;
            console.log("--- Process instance id: " + martsiaId);
        } else if (endpoint.includes("{instanceId}")) {
            // Replace instanceId in the endpoint if it's a placeholder
            endpoint = endpoint.replace("{instanceId}", instanceId);
            response = await performRestCall(method, endpoint, data);
        } else if (data.hasOwnProperty("process_id") && data.process_id === 0) {
            // Modify data for specific calls that require process_id modification
            data.process_id = martsiaId;
            // Handle specific cases based on the call name
            if (name === "attributesCertification") {
                response = await performRestCall(method, endpoint, data);
                readingPolicies[0] = web3.utils.asciiToHex(response.hash1);
                readingPolicies[1] = web3.utils.asciiToHex(response.hash2);
            } else if (name.includes("encrypt_message")) {
                response = await performRestCall(method, endpoint, data);
                encryptedIpfsLinks[0] = web3.utils.asciiToHex(response.data[0].replace("b'", "").replace("'", ""));
                encryptedIpfsLinks[1] = web3.utils.asciiToHex(response.data[1].replace("b'", "").replace("'", ""));
            } else {
                response = await performRestCall(method, endpoint, data);
            }
        } else if (name.includes("generateKeyPair")) {
            response = await performRestCall(method, endpoint, data);
            rsaKey[0] = web3.utils.asciiToHex(response.data[0].replace("b'", "").replace("'", ""));
            rsaKey[1] = web3.utils.asciiToHex(response.data[1].replace("b'", "").replace("'", ""));
        } else {
            // Default behavior for other REST calls
            response = await performRestCall(method, endpoint, data);
        }
        let elapsedTime = Date.now() - startTime;  // Calculate elapsed time
        if ((testType === "t1" || testType === "t3" || testType === "t8") && (executionNumber === 1 || (executionNumber > 5 && executionNumber % 5 === 1))) {
            if (executionNumber !== 1) {
                const greenStyle = {
                    fill: {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {argb: '90EE90'} // Light green color
                    },
                    border: {
                        top: {style: 'thin', color: {argb: '000000'}},
                        left: {style: 'thin', color: {argb: '000000'}},
                        bottom: {style: 'thin', color: {argb: '000000'}},
                        right: {style: 'thin', color: {argb: '000000'}}
                    }
                };
                const cell = columnNumberToLetter(adjustNumber2(executionNumber)) + "1";
                const cell2 = columnNumberToLetter(adjustNumber2(executionNumber)+1) + "1";
                worksheet.getCell(cell).value = `Type`;
                worksheet.getCell(cell).style = greenStyle;
                worksheet.getCell(cell2).value = `Function/Endpoint`;
                worksheet.getCell(cell2).style = greenStyle;
            }
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(adjustNumber2(executionNumber)), 'Rest');
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(adjustNumber2(executionNumber)+1), name);
        }
        else if (testType !== 0 && executionNumber === 1) {
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(1), 'Rest');
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(2), name);
        }
        if (name === "attributesCertification") {
            const removingTimePath = path.join(__dirname, '..', 'Confidentiality Manager', 'src', 'removing_time.txt');
            const auth_File_Paths = [
                path.join(__dirname, '..', 'Confidentiality Manager', 'src', 'removing_time_Auth1.txt'),
                path.join(__dirname, '..', 'Confidentiality Manager', 'src', 'removing_time_Auth2.txt'),
                path.join(__dirname, '..', 'Confidentiality Manager', 'src', 'removing_time_Auth3.txt'),
                path.join(__dirname, '..', 'Confidentiality Manager', 'src', 'removing_time_Auth4.txt')
            ];
            const loading = fs.readFileSync(removingTimePath, 'utf8');
            elapsedTime = elapsedTime - Math.round(Number(loading))
            const allData = auth_File_Paths.map(filePath =>
                fs.readFileSync(filePath, 'utf8')
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => line.split(' ').map(Number))
            );
            const numLines = Math.min(...allData.map(arr => arr.length));
            let totalLatency = 0;
            for (let i = 0; i < numLines; i++) {
                let minStart = Infinity;
                let maxEnd = -Infinity;
                for (const fileData of allData) {
                    const [start, end] = fileData[i];
                    minStart = Math.min(minStart, start);
                    maxEnd = Math.max(maxEnd, end);
                }
                totalLatency += (maxEnd - minStart);
            }
            elapsedTime = elapsedTime - Math.round(Number(totalLatency));
            // Function to delete files synchronously
            const deleteFiles = (files) => {
                files.forEach(file => {
                    fs.unlinkSync(file);  // Deletes file synchronously
                });
            };
            deleteFiles([removingTimePath, ...auth_File_Paths]);
        }

        if (name.includes("decrypt_wait_")) {
            const auth_File_Paths = [
                path.join(__dirname, '..', 'Confidentiality Manager', 'src', 'removing_time_Auth1.txt'),
                path.join(__dirname, '..', 'Confidentiality Manager', 'src', 'removing_time_Auth2.txt'),
                path.join(__dirname, '..', 'Confidentiality Manager', 'src', 'removing_time_Auth3.txt'),
                path.join(__dirname, '..', 'Confidentiality Manager', 'src', 'removing_time_Auth4.txt')
            ];

            // Read each file and parse the float values
            const allData = auth_File_Paths.map(file => {
                const data = fs.readFileSync(file, 'utf8').trim().split(/\s+/).map(Number);
                return data;
            });

            // Initialize total latency
            let totalLatency = 0;
            let minStart = Infinity;
            let maxEnd = -Infinity;

            // Iterate over the data from each file and calculate min start and max end
            allData.forEach(data => {
                const [start, end] = data;
                minStart = Math.min(minStart, start);
                maxEnd = Math.max(maxEnd, end);
            });

            // Calculate the total latency
            totalLatency += (maxEnd - minStart);
            elapsedTime = elapsedTime - Math.round(Number(totalLatency));
            // Function to delete files synchronously
            const deleteFiles = (files) => {
                files.forEach(file => {
                    fs.unlinkSync(file);  // Deletes file synchronously
                });
            };
            deleteFiles(auth_File_Paths);
        }


        if (testType === "t1" || testType === "t3" || testType === "t8") {
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(adjustNumber2(executionNumber) + 2 ), elapsedTime);
        }
        else if (testType !== 0) {
            writeToFirstEmptyCell(worksheet, columnNumberToLetter(adjustNumber(executionNumber) + 2), elapsedTime);
        }
        console.log(`REST call ${endpoint} with name ${name} completed`);
        console.log(name, elapsedTime);
        return response;
    } catch (error) {
        console.error(`Failed to execute ${name}: No server`);
        console.log(error)
    }
}


/**
 * Executes a sequence of Web3 and REST calls in a specific order.
 * @param {Array<Object>} order - The custom order of calls to execute.
 */
async function Execute(order) {
    const greenStyle = {
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: '90EE90'} // Light green color
        },
        border: {
            top: {style: 'thin', color: {argb: '000000'}},
            left: {style: 'thin', color: {argb: '000000'}},
            bottom: {style: 'thin', color: {argb: '000000'}},
            right: {style: 'thin', color: {argb: '000000'}}
        }
    };
    if (testType === "t1" || testType === "t3" || testType === "t8") {
        const cell = columnNumberToLetter(adjustNumber2(executionNumber) + 2) + "1";
        worksheet.getCell(cell).value = `Iteration ${executionNumber}`;
        worksheet.getCell(cell).style = greenStyle;
    }
    else if (testType !== 0) {
        const cell = columnNumberToLetter(adjustNumber(executionNumber) + 2) + "1";
        worksheet.getCell(cell).value = `Iteration ${executionNumber}`;
        worksheet.getCell(cell).style = greenStyle;
    }
    for (const call of order) {
        try {
            if (call.type === 'web3') {
                if (call.name.includes("ask_auth_key_")) {
                    if (!global.askDone.has(call.name.split("ask_auth_key_")[1])) {
                        global.askDone.add(call.name.split("ask_auth_key_")[1]);
                        await processWeb3Call(call.name);
                    }
                } else {
                    await processWeb3Call(call.name);
                }
            } else if (call.type === 'rest') {
                await processRestCall(call.name);
            } else if (call.type === 'init') {
                await processRestCall("saveModel");
                await processRestCall("createInstance");
            } else if (call.type === 'sub' && 'role' in call) {
                await processRestCall("generateKeyPair_" + call.role);
                await processWeb3Call("publicKeyReaders_" + call.role);
                await processRestCall("subscribe_" + call.role);
            } else if (call.type === 'sub') {
                const data = JSON.parse(fs.readFileSync('data/users_info.json', 'utf8'));
                for (const role of data.map(role => role.role)) {
                    await processRestCall("generateKeyPair_" + role);
                    await processWeb3Call("publicKeyReaders_" + role);
                    await processRestCall("subscribe_" + role);
                }
            } else if (call.type === 'inst') {
                await processRestCall("translation1");
                await processRestCall("translation2");
                await processRestCall('attributesCertification');
                await processWeb3Call('instantiateProcess');
                await processWeb3Call('setInstanceConditions');
            } else if (call.type === 'enc' && 'element' in call) {
                await processRestCall("encrypt_message_" + call.element);
                await processWeb3Call("execute_message_" + call.element);
            } else if (call.type === 'enc' && 'role' in call) {
                const allExe = require('./data/blockchain_inputs.json').filter(obj => obj.name.startsWith("execute_message_") && obj.role === call.role).map(obj => obj.name.split("execute_message_")[1]);
                for (const exe of allExe) {
                    await processRestCall("encrypt_message_" + exe);
                    await processWeb3Call("execute_message_" + exe);
                }
            } else if (call.type === 'enc') {
                const order= fs.readFileSync('data/ordering.txt', 'utf8').split('\n');
                for (const element of order) {
                    await processRestCall("encrypt_message_" + element);
                    await processWeb3Call("execute_message_" + element);
                }
            } else if (call.type === 'check_ask_wait') {
                await processRestCall("decrypt_check_" + call.element);
                if (!global.askDone.has(call.role)) {
                    global.askDone.add(call.role);
                    await processWeb3Call("ask_auth_key_" + call.role);
                    await processRestCall("decrypt_wait_" + call.element);
                }
            } else if (call.type === 'ask_wait') {
                if (!global.askDone.has(call.role)) {
                    global.askDone.add(call.role);
                    await processWeb3Call("ask_auth_key_" + call.role);
                    await processRestCall("decrypt_wait_" + call.element);
                }
            } else if (call.type === 'check') {
                await processRestCall("decrypt_check_" + call.element);
            } else if (call.type === 'ask') {
                if (!global.askDone.has(call.role)) {
                    global.askDone.add(call.role);
                    await processWeb3Call("ask_auth_key_" + call.role);
                }
            } else if (call.type === 'wait') {
                await processRestCall("decrypt_wait_" + call.element);
            } else if (call.type === 'dec' && 'element' in call ) {
                await processRestCall("decrypt_check_" + call.element);
                if (!global.askDone.has(call.role)) {
                    global.askDone.add(call.role);
                    await processWeb3Call("ask_auth_key_" + call.role);
                    await processRestCall("decrypt_wait_" + call.element);
                }
            } else if (call.type === 'dec' && 'role' in call ) {
                const address = require('./data/users_info.json').find(obj => obj.role === call.role)?.address;
                const allChecks = require('./data/rest_inputs.json').filter(obj => obj.name.startsWith("decrypt_check_") && obj.data?.actor === address).map(obj => obj.name.split("decrypt_check_")[1]);
                for (const check of allChecks) {
                    await processRestCall("decrypt_check_" + check);
                    if (!global.askDone.has(call.role)) {
                        global.askDone.add(call.role);
                        await processWeb3Call("ask_auth_key_" + call.role);
                        await processRestCall("decrypt_wait_" + check);
                    }
                }
            } else if (call.type === 'dec') {
                const addresses = require('./data/users_info.json').map(obj => obj.address);
                for (const address of addresses) {
                    const role = require('./data/users_info.json').find(obj => obj.address === address)?.role;
                    const allChecks = require('./data/rest_inputs.json').filter(obj => obj.name.startsWith("decrypt_check_") && obj.data?.actor === address).map(obj => obj.name.split("decrypt_check_")[1]);
                    for (const check of allChecks) {
                        await processRestCall("decrypt_check_" + check);
                        if (!global.askDone.has(role)) {
                            global.askDone.add(role);
                            await processWeb3Call("ask_auth_key_" + role);
                            await processRestCall("decrypt_wait_" + check);
                        }
                    }
                }
            }
        } catch (error) {
            // Error handling for each call
        }
    }
}


/*
GRAMMAR:

Old:

{type: 'rest', name: 'x'}:
            'x' JSON rest object to execute.
            Example: {type: 'rest', name: 'decrypt_check_accepted'}

{type: 'web3', name: 'x'}:
            'x' JSON web3 object to execute.
            Example: {type: 'web3', name: 'publicKeyReaders_patient'}


New:

{type: 'init'}:
            {type: 'rest', name: 'saveModel'} and {type: 'rest', name: 'createInstance'}.

{type: 'sub', role: 'x'}:
            {type: 'rest', name: 'generateKeyPair_x'}, {type: 'web3', name: 'publicKeyReaders_x'}
            and {type: 'rest', name: 'subscribe_x'} for the 'x' role.
            Example: {type: 'sub', role: 'patient'}

{type: 'sub'}:
            {type: 'sub', role: 'x'} for all 'x'.

{type: 'inst'}:
            {type: 'rest', name: 'translation1'}, {type: 'rest', name: 'translation2'}, {type: 'rest', name: 'attributesCertification'},
            {type: 'web3', name: 'instantiateProcess'} and {type: 'web3', name: 'setInstanceConditions'}

{type: 'enc', element: 'x'}:
            {type: 'rest', name: 'encrypt_message_x'} and {type: 'web3', name: 'execute_message_x'} for the 'x' element.
            Example: {type: 'enc', element: 'appointmentId'}

{type: 'enc', role: 'x'}:
            {type: 'rest', name: 'encrypt_message_z'} and {type: 'web3', name: 'execute_message_z'} for 'x''s elements.
            Example: {type: 'enc', role: 'patient'}

{type: 'enc'}:
            {type: 'enc', element: 'x'} for all 'x'.

{type: 'dec', role: 'x', element: 'y'}:
            The role 'x' decrypts the element 'y'.
            Example: {type: 'dec', role: 'patient', element: 'resultId'}

{type: 'dec', role: 'x'}:
            {type: 'dec', role: 'x', element: 'y'} for all 'y'.
            Example: {type: 'dec', role: 'patient'}

{type: 'dec'}:
            {type: 'dec', role: 'x'} for all 'x'.


In addition:

{type: 'check_ask_wait', role: 'x', element: 'y'}:
            {type: 'rest', name: 'decrypt_check_y'}, {type: 'web3', name: 'ask_auth_key_x'} and {type: 'rest', name: 'decrypt_wait_y'}
            for the specified 'x' role and 'y' element.
            Example: {type: 'check_ask_wait', role: 'patient', element: 'resultId'}

{type: 'ask_wait', role: 'x', element: 'y'}:
            {type: 'web3', name: 'ask_auth_key_x'} and {type: 'rest', name: 'decrypt_wait_y'} for the specified 'x' role and 'y' element.
            Example: {type: 'ask_wait', role: 'patient', element: 'resultId'}

{type: 'check', role: 'x', element: 'y'}:
            {type: 'rest', name: 'decrypt_check_y'} for the specified 'x' role and 'y' element.
            Example: {type: 'check', role: 'patient', element: 'resultId'}

{type: 'ask', role: 'x'}:
            {type: 'web3', name: 'ask_auth_key_x'} for the specified 'x' role.
            Example: {type: 'ask', role: 'patient'}

{type: 'wait', role: 'x', element: 'y'}:
            {type: 'rest', name: 'decrypt_wait_y'} for the specified 'x' role and 'y' element.
            Example: {type: 'wait', role: 'patient', element: 'resultId'}
*/


async function ensureExcelFileAndSheet(filePath, sheetName) {
    const workbook = new ExcelJS.Workbook();
    // Check if the file exists
    if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);  // Reads the file if it exists
        console.log(`${filePath} exists.`);
    } else {
        console.log(`${filePath} does not exist. Creating it...`);
    }
    // Check if the worksheet exists and reset it
    let worksheet = workbook.getWorksheet(sheetName);
    if (worksheet) {
        console.log(`Worksheet "${sheetName}" exists. Resetting it...`);
        workbook.removeWorksheet(sheetName);
    } else {
        console.log(`Worksheet "${sheetName}" does not exist. Creating it...`);
    }
    // Create a new worksheet
    worksheet = workbook.addWorksheet(sheetName);
    // Define the green style
    const greenStyle = {
        fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '90EE90' } // Light green color
        },
        border: {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } }
        }
    };
    let cellValues;
    if (filePath === "./table_Output/timings.xlsx") {
        // Initialize header values
        cellValues = {
            'A1': 'Type',
            'B1': 'Function/Endpoint',
        };
    }
    else {
        // Initialize header values
        cellValues = {
            'A1': 'From',
            'B1': 'To',
            'C1': 'Function',
            'D1': 'Gas'
        };
    }
    // Apply values and styles
    Object.keys(cellValues).forEach(cell => {
        worksheet.getCell(cell).value = cellValues[cell];
        worksheet.getCell(cell).style = greenStyle;
    });
    return { workbook, worksheet };
}


function writeToFirstEmptyCell(worksheet, column, value) {
    let firstEmptyRow = 1;
    let lastRow = 0; // Track the last row encountered

    worksheet.eachRow((row, rowNumber) => {
        lastRow = rowNumber; // Update lastRow for each row
        const cell = row.getCell(column);
        if (!cell.value) {
            if (firstEmptyRow === 1) { // Only update if not found yet
                firstEmptyRow = rowNumber;
                return false; // Break loop after first empty
            }
        }
    });
    // If no empty found, use next after lastRow (or 1 if sheet is empty)
    if (firstEmptyRow === 1) {
        firstEmptyRow = lastRow === 0 ? 1 : lastRow + 1;
    }
    worksheet.getCell(`${column}${firstEmptyRow}`).value = value;
    //console.log(`Written '${value}' to ${column}${firstEmptyRow}`);
}


// Define the custom order of the incident-related Web3 and REST calls
const Order = [
    {type: 'init'},
    {type: 'sub'},
    {type: 'inst'},
    {type: 'enc'},
    {type: 'dec'}
];


async function checkTransactionsFromBlock(startBlockNumber) {
    const users = JSON.parse(fs.readFileSync('./data/users_info.json', 'utf8'));
    const addressMapping = users.reduce((acc, { address, role }) => ({ ...acc, [address.toLowerCase()]: role.toUpperCase() }), {
        "0x990b35b0946844c93a5ccdb2cf2e1bcce775b973": "AUTHORITY1",
        "0xf7a75671d5c56e470ef40306a0ca1e8decd7fbf7": "AUTHORITY2",
        "0x76dd4d87d2147a076b065342d7610fe3a55cd248": "AUTHORITY3",
        "0x3ca857e3e6c6d7f68944c6fe7eba6fe28d5ba1aa": "AUTHORITY4",
        "0x4f21892f99a0bec105a6c130c7b0d5613c117a11": "CERTIFIER"
    });
    addressMapping[contractAddress1.toLowerCase()] = "StateContract";
    addressMapping[contractAddress2.toLowerCase()] = "ConfidentialContract";
    // Helper function to generate function selector map from ABI
    const createFunctionMap = (abi) => {
        const map = {};
        abi.forEach(item => {
            if (item.type === 'function') {
                const signature = `${item.name}(${item.inputs.map(i => i.type).join(',')})`;
                const selector = web3.utils.sha3(signature).slice(0, 10);
                map[selector] = item;
            }
        });
        return map;
    };
    try {
        const latestBlock = await web3.eth.getBlockNumber();
        // Initialize function maps for both contracts
        const contract1Map = createFunctionMap(contract1.options.jsonInterface);
        const contract2Map = createFunctionMap(contract2.options.jsonInterface);
        for (let blockNumber = startBlockNumber; blockNumber <= latestBlock; blockNumber++) {
            const block = await web3.eth.getBlock(blockNumber, true);
            if (!block.transactions) continue;
            for (const tx of block.transactions) {
                const receipt = await web3.eth.getTransactionReceipt(tx.hash);
                console.log(`From: ${addressMapping[tx.from]}`);
                const from = addressMapping[tx.from];
                console.log(`To: ${addressMapping[tx.to]}`);
                const to = addressMapping[tx.to];
                console.log(`Gas Used: ${receipt.gasUsed}`);
                const gas = receipt.gasUsed;
                let function0 = "-"
                if (!tx.to) continue;
                const contractMap = tx.to.toLowerCase() === contractAddress1.toLowerCase() ? contract1Map
                    : tx.to.toLowerCase() === contractAddress2.toLowerCase() ? contract2Map
                        : null;
                if (!contractMap || tx.input.length < 10) {
                    console.log('--------------------------');
                } else {
                    const selector = tx.input.slice(0, 10);
                    const func = contractMap[selector];
                    if (!func) {
                        console.log('Unknown function selector:', selector);
                        console.log('--------------------------');
                        continue;
                    }
                    try {
                        // Use decodeParameters for older web3 versions
                        const decoded = web3.eth.abi.decodeParameters(
                            func.inputs,
                            '0x' + tx.input.slice(10) // Remove selector from input data
                        );
                        console.log(`Function: ${func.name}`);
                        function0 = func.name;
                    } catch (e) {
                        console.log('Decoding error:', e.message);
                    }
                }
                console.log('--------------------------');
                if (executionNumber !== 1) {
                    const greenStyle = {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: '90EE90' } // Light green color
                        },
                        border: ['top', 'left', 'bottom', 'right'].reduce((acc, side) => {
                            acc[side] = { style: 'thin', color: { argb: '000000' } };
                            return acc;
                        }, {})
                    };
                    // Define headers and their corresponding columns
                    const headers = ['From', 'To', 'Function', 'Gas'];
                    headers.forEach((header, index) => {
                        const cell = columnNumberToLetter(executionNumber + index) + "1";
                        worksheet2.getCell(cell).value = header;
                        worksheet2.getCell(cell).style = greenStyle;
                    });
                }
                writeToFirstEmptyCell(worksheet2, columnNumberToLetter(executionNumber), from);
                writeToFirstEmptyCell(worksheet2, columnNumberToLetter(executionNumber+1), to);
                writeToFirstEmptyCell(worksheet2, columnNumberToLetter(executionNumber+2), function0);
                writeToFirstEmptyCell(worksheet2, columnNumberToLetter(executionNumber+3), Number(gas));
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


// Main function to execute all calls in custom order for 1 iteration
async function main() {
    global.testType = argv.t ?? 0;
    global.executionNumber = argv.n ?? 0;
    global.worksheet = "";
    global.worksheet2 = "";
    let workbook;
    let workbook2;
    if (testType !== 0 && executionNumber === 1) {
        const result_Time = await ensureExcelFileAndSheet('./table_Output/timings.xlsx', testType).catch(err => console.error(err));
        const result_Cost = await ensureExcelFileAndSheet('./table_Output/costs.xlsx', testType).catch(err => console.error(err));
        workbook = result_Time.workbook;
        workbook2 = result_Cost.workbook;
        global.worksheet = result_Time.worksheet;
        global.worksheet2 = result_Cost.worksheet;
    } else if (testType !== 0) {
        const wb = await new ExcelJS.Workbook().xlsx.readFile('./table_Output/timings.xlsx');
        const wb2 = await new ExcelJS.Workbook().xlsx.readFile('./table_Output/costs.xlsx');
        workbook = wb;
        workbook2 = wb2;
        global.worksheet = wb.getWorksheet(testType);
        global.worksheet2 = wb2.getWorksheet(testType);
    }
    global.askDone = new Set();
    console.log(`--- Starting ---`);
    const blockNumber = await web3.eth.getBlockNumber();
    await Execute(Order);
    if (testType !== 0 && executionNumber % 5 === 1) {
        await checkTransactionsFromBlock(blockNumber + BigInt(1));
    }
    console.log(`--- Finished ---`);
    if (global.worksheet !== "") {
        await workbook.xlsx.writeFile('./table_Output/timings.xlsx');  // Save the modified workbook
        await workbook2.xlsx.writeFile('./table_Output/costs.xlsx');  // Save the modified workbook
    }
}


// Execute the main function
main();
