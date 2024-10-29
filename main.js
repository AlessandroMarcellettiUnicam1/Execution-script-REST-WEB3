const fs = require('fs');
const { invokeContractFunction } = require('./lib/blockchain');
const { performRestCall } = require('./lib/rest');
const xlsx = require('xlsx');
const XLSX = require("xlsx");
const {Web3} = require("web3"); // Install this with: npm install xlsx
const web3 = new Web3('http://127.0.0.1:7545');

// Load input data for web3 and rest calls
const blockchainInputs = JSON.parse(fs.readFileSync('./data/blockchain_inputs.json', 'utf8'));
const restInputs = JSON.parse(fs.readFileSync('./data/rest_inputs.json', 'utf8'));
let instanceId = "";
let martsiaId = 0;
let rsa_key = [];
let readingPolicies = [];
// A map to keep track of timing results with unique call identifiers
let timingDataMap = {};
let encryptedIpfsLinks = [];




// Initialize the structure of timing data map for all custom calls
const initializeTimingDataMap = (order) => {
    for (const call of order) {
        const identifier = `${call.type}_${call.name}`;
        const callDetail = call.type === 'web3'
            ? blockchainInputs.find(input => input.name === call.name).name
            : restInputs.find(input => input.name === call.name).name;

        // Initialize the row with the call type and endpoint/function name
        timingDataMap[identifier] = {
            type: call.type,
            detail: callDetail,
            iterations: [null, null, null, null, null] // One slot for each iteration
        };
    }
};
// Function to process web3 call with predefined params
async function processWeb3Call(name, iteration) {
    const inputs = blockchainInputs.find(input => input.name === name);
    const { contractInfoPath, functionName, params, role} = inputs;
    //const { contractInfoPath, functionName, params, role} = blockchainInputs.calls[index];  // Take data from the specific call
    if(params.hasOwnProperty("process_id") && params.process_id === 0){
        params.process_id = martsiaId;
    }
    if(functionName === "setPublicKeyReaders"){
        params.ipfs_link_1 = rsa_key[0];
        params.ipfs_link_2 = rsa_key[1];
    }else if(functionName === "instantiateProcess"){
        params.hashLink1 = readingPolicies[0];
        params.hashLink2 = readingPolicies[1];
    }else if(functionName === "setIPFSLink"){
        params.ipfs_link_1 = encryptedIpfsLinks[0];
        params.ipfs_link_2 = encryptedIpfsLinks[1];
    }

    const startTime = Date.now();  // Start the timer

    try {
        const result = await invokeContractFunction(contractInfoPath, functionName, params, role);  // Call the function with predefined params
        const elapsedTime = Date.now() - startTime;  // Calculate elapsed time
        console.log(`Successfully executed ${name} on contract at ${contractInfoPath} in ${elapsedTime} ms`);
        const identifier = `web3_${name}`;
        timingDataMap[identifier].iterations[iteration - 1] = elapsedTime;
        return result;  // Return the transaction result
    } catch (error) {
        console.error(`Failed to execute ${name} on contract at ${contractInfoPath}:`, error);
        throw error;  // Re-throw error if needed for further handling
    }
}

// Function to process REST call
async function processRestCall(name, iteration) {
    const input = restInputs.find(input => input.name === name);
    if (input) {
        const { method, data } = input;
        let { endpoint } = input;
        let response = {}
        // Now you can use method and data as needed

    /*const { method, data } = restInputs[index];
    let { endpoint } = restInputs[index];
    let response = {};*/
        const startTime = Date.now();  // Start the timer

    if (name === "createInstance") {
        response = await performRestCall(method, endpoint, data);
        instanceId = response.id;
        martsiaId = response.martsiaId;
        console.log("---Process instance id: " + martsiaId);
        //console.log(`Successfully executed ${method} with instance ${instanceId}`);
    } else if (endpoint.includes("{instanceId}")) {
        endpoint = endpoint.replace("{instanceId}", instanceId);
        response = await performRestCall(method, endpoint, data);
        //console.log(`Successfully executed ${method} with endpoint ${endpoint}`);
    } else if (data.hasOwnProperty("process_id") && data.process_id === 0){
        data.process_id = martsiaId
        if (name === "attributesCertification"){
            response = await performRestCall(method, endpoint, data);
            readingPolicies[0] = web3.utils.asciiToHex(response.hash1)
            readingPolicies[1] = web3.utils.asciiToHex(response.hash2)
        }else if(name.includes("encrypt_message")){
            response = await performRestCall(method, endpoint, data);
            encryptedIpfsLinks[0] = web3.utils.asciiToHex(response.data[0].replace("b'", "").replace("'", ""));
            encryptedIpfsLinks[1] = web3.utils.asciiToHex(response.data[1].replace("b'", "").replace("'", ""));
        } else{
            response = await performRestCall(method, endpoint, data);
        }//console.log(`Successfully executed ${method}`);
    } else if(name.includes("generateKeyPair")){
        response = await performRestCall(method, endpoint, data);
        //console.log(response);
        rsa_key[0] = web3.utils.asciiToHex(response.data[0].replace("b'", "").replace("'", ""));
        rsa_key[1] = web3.utils.asciiToHex(response.data[1].replace("b'", "").replace("'", ""));
    } else {
        response = await performRestCall(method, endpoint, data);
        //console.log(`Successfully executed ${method} `);
    }
    const elapsedTime = Date.now() - startTime;  // Calculate elapsed time
    console.log(`REST call ${endpoint} with name ${name} completed in ${elapsedTime} ms`);
    const identifier = `rest_${name}`;
    timingDataMap[identifier].iterations[iteration - 1] = elapsedTime;
    return response;
    } else {
        console.error(`No input found for name: ${nameToFind}`);
    }
}

// Function to execute all calls in custom order
async function processCustomOrder(order, iteration) {
    for (const call of order) {
        try {
            if (call.type === 'web3') {
                await processWeb3Call(call.name, iteration);
            } else if (call.type === 'rest') {
                await processRestCall(call.name, iteration);
            }
        } catch (error) {
            console.error(`Error processing ${call.type} call with name ${call.name}:`);
        }
    }

}

// Function to save timing data to Excel with each execution as a separate column
function saveTimingDataToExcel(timingData) {
    // Convert the timing data map to a 2D array format for Excel
    const headers = ['Type', 'Function/Endpoint', 'Iteration 1', 'Iteration 2', 'Iteration 3', 'Iteration 4', 'Iteration 5'];
    const rows = Object.values(timingData).map((data) => [
        data.type,
        data.detail,
        ...data.iterations
    ]);

    // Create the worksheet and workbook
    const worksheetData = [headers, ...rows];
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'TimingData');

    // Save the Excel file
    xlsx.writeFile(workbook, 'timing_data.xlsx');
}
// Define the order of calls (example: REST 1, REST 2, web3 1, REST 3, web3 2, web3 3)
const customOrder = [
    //saveModel function
    { type: 'rest', name: 'saveModel' },
    // createInstance function
    { type: 'rest', name: 'createInstance' },  // REST call 2
    //subscribe1-3
    { type: 'rest', name: 'generateKeyPair_ward' },  //generateRSA user 1
    { type: 'web3', name: 'PublicKeyReaders_ward' },  // setPublicKeyReaders user 1 - DD9 CUSTOMER
    { type: 'rest', name: 'subscribe_ward' },  // subscribe user 1

    { type: 'rest', name: 'generateKeyPair_radiology' }, // generateRSA user 2
    { type: 'web3', name: 'PublicKeyReaders_radiology' },  // setPublicKeyReaders user 2 - FD43 BIKE CENTER
    { type: 'rest', name: 'subscribe_radiology' },  // subscribe user 2

    { type: 'rest', name: 'generateKeyPair_patient' },  // generateRSA user 3
    { type: 'web3', name: 'PublicKeyReaders_patient' },  // setPublicKeyReaders user 3 - 0121 INSURER
    { type: 'rest', name: 'subscribe_patient' }, // subscribe user 3

    { type: 'rest', name: 'translation1' }, // chorchain deploy
    { type: 'rest', name: 'translation2' }, // generateMartsiaInstance
    { type: 'rest', name: 'attributesCertification'}, // certify
    { type: 'web3', name: 'instantiateProcess' }, //instantiate process
    { type: 'web3', name: 'setInstanceConditions' },  //Set conditions

    //write for each message of the choreography
    { type: 'rest', name: 'encrypt_message_type'}, // type
    { type: 'web3', name: 'execute_message_type'}, // write*/

    /*{ type: 'rest', name: 'encrypt_message_requestId'}, // type, requestId
    { type: 'web3', name: 'execute_message_requestId'}, //

    { type: 'rest', name: 'encrypt_message_accepted1'}, // accepted, date
    { type: 'web3', name: 'execute_message_accepted1'}, // write

    { type: 'rest', name: 'encrypt_message_requestId'}, // type, requestId
    { type: 'web3', name: 'execute_message_requestId'}, //

    { type: 'rest', name: 'encrypt_message_accepted2'}, // accepted, date
    { type: 'web3', name: 'execute_message_accepted2'}, // write

    { type: 'rest', name: 'encrypt_message_appointment'}, // accepted, date
    { type: 'web3', name: 'execute_message_appointment'}, // write

    { type: 'rest', name: 'encrypt_message_certificationId'}, // certificationID
    { type: 'web3', name: 'execute_message_certificationId'}, // write

    { type: 'rest', name: 'encrypt_message_temperature'}, // temperature
    { type: 'web3', name: 'execute_message_temperature'}, // write

    { type: 'rest', name: 'encrypt_message_appointmentId'}, // appointmentId
    { type: 'web3', name: 'execute_message_appointmentId'}, // write

    { type: 'rest', name: 'encrypt_message_registration'}, // registration
    { type: 'web3', name: 'execute_message_registration'}, // write

    { type: 'rest', name: 'encrypt_message_report'}, // report,ticketId
    { type: 'web3', name: 'execute_message_report'}, // write

    { type: 'rest', name: 'encrypt_message_resultId'}, // resultID
    { type: 'web3', name: 'execute_message_resultID'}, // write*/

    //---------------------
    //first invocations to obtain the key
    //{ type: 'rest', name: 'decrypt_check_type'},
    { type: 'web3', name: 'ask_auth_key_radiology'}, // write
    { type: 'rest', name: 'decrypt_wait_type'} // type
    //{ type: 'rest', name: 'decrypt_check_type'} // type*/

    //{ type: 'rest', name: 'decrypt_check_requestId'}, // type, requestId
    //{ type: 'web3', name: 'ask_auth_key_radiology'}, // type, requestId

    /*{ type: 'web3', name: 'ask_auth_key_ward'}, // write
    { type: 'rest', name: 'decrypt_wait_accepted'}, // type*/



    //

    /*{ type: 'rest', name: 'decrypt_certificationId'}, // certificationID
    { type: 'rest', name: 'decrypt_temperature'}, // temperature
    { type: 'rest', name: 'decrypt_appointmentId'}, // appointmentId
    { type: 'rest', name: 'decrypt_registration'}, // registration
    { type: 'rest', name: 'decrypt_report'}, // report,ticketId
    { type: 'rest', name: 'decrypt_resultId'}, // resultID*/

];
// Main function to iterate over the customOrder execution 5 times
async function main() {
    // Initialize the timing data map based on custom order
    initializeTimingDataMap(customOrder);

    // Run the custom order 5 times
    for (let i = 1; i <= 1; i++) {
        console.log(`--- Starting iteration ${i} ---`);
        await processCustomOrder(customOrder, i);
        console.log(`--- Completed iteration ${i} ---`);
    }

    // Save the accumulated timing data to an Excel file
    saveTimingDataToExcel(timingDataMap);
}

// Run the main function
main();
