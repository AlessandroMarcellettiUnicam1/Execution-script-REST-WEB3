const fs = require('fs');
const { Web3 } = require("web3");
const { invokeContractFunction } = require('./lib/blockchain');
const { performRestCall } = require('./lib/rest');


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


/**
 * Processes a Web3 call using predefined parameters.
 * Modifies parameters based on the specific Web3 function requirements.
 * @param {string} name - The name of the Web3 call.
 * @returns {Promise<Object>} - The result of the Web3 call.
 */
async function processWeb3Call(name) {
    console.log(name);
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
        const result = await invokeContractFunction(contractInfo, functionName, params, role);
        console.log(`Successfully executed ${name} on contract at ${contractInfo}`);
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
        console.log(name);
        // Retrieve input data for the REST call
        const input = restInputs.find(input => input.name === name);
        if (!input) {
            console.error(`No input found for name: ${name}`);
            return;
        }
        const { method, data } = input;
        let { endpoint } = input;
        let response;
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
        console.log(`REST call ${endpoint} with name ${name} completed`);
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


// Define the custom order of the incident-related Web3 and REST calls
const Order = [
    {type: 'init'},
    {type: 'sub'},
    {type: 'inst'},
    {type: 'enc'},
    {type: 'dec'},
    {type: 'dec'}
];


// Main function to execute all calls in custom order for 1 iteration
async function main() {
    global.askDone = new Set();
    console.log(`--- Starting ---`);
    await Execute(Order);
    console.log(`--- Finished ---`);
}


// Execute the main function
main();
