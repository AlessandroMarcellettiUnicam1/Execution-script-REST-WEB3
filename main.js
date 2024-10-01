const fs = require('fs');
const {invokeContractFunction} = require('./lib/blockchain');
const { performRestCall } = require('./lib/rest');

// Load input data for web3 and rest calls
const blockchainInputs = JSON.parse(fs.readFileSync('./data/inputs.json', 'utf8'));
const restInputs = JSON.parse(fs.readFileSync('./data/rest_inputs.json', 'utf8'));

// Function to process web3 call with predefined params
async function processWeb3Call(index) {
    const { contractInfoPath, functionName, params } = blockchainInputs.calls[index];  // Take data from the specific call

    try {
        const result = await invokeContractFunction(contractInfoPath, functionName, params);  // Call the function with predefined params
        console.log(`Successfully executed ${functionName} on contract at ${contractInfoPath}:`, result);
        return result;  // Return the transaction result
    } catch (error) {
        console.error(`Failed to execute ${functionName} on contract at ${contractInfoPath}:`, error);
        throw error;  // Re-throw error if needed for further handling
    }
}



// Function to process REST call
async function processRestCall(index) {
    const { method, data } = restInputs[index];
    let { endpoint } = restInputs[index];
    let instanceId = "";
    let response = {};
    if (index === 1) {
        response = await performRestCall(method, endpoint, data);
        instanceId = response;
    } else if (index === 2 || index === 3 || index === 4) {
        endpoint = endpoint.replace("{instanceId}", instanceId);
        response = await performRestCall(method, endpoint, data);
    } else {
        response = await performRestCall(method, endpoint, data);
    }

    return response;
}

// Function to execute all calls in custom order
async function processCustomOrder(order) {
    for (const call of order) {
        try {
            if (call.type === 'web3') {
                await processWeb3Call(call.index);
            } else if (call.type === 'rest') {
                await processRestCall(call.index);
            }
        } catch (error) {
            console.error(`Error processing ${call.type} call at index ${call.index}:`, error);
        }
    }
}

// Define the order of calls (example: REST 1, REST 2, web3 1, REST 3, web3 2, web3 3)
const customOrder = [
    //todo add user registration and automatic id retrival
    //saveModel function
    //{ type: 'rest', index: 0 },
    // createInstance function
    { type: 'rest', index: 1 },  // REST call 2
    //subscribe1-3
    { type: 'rest', index: 2 },  //generateRSA user 1
    { type: 'web3', index: 0 },  // setPublicKeyReaders user 1 - DD9 CUSTOMER
    { type: 'rest', index: 3 },  // subscribe user 1

    { type: 'rest', index: 4 }, // generateRSA user 2
    { type: 'web3', index: 1 },  // setPublicKeyReaders user 2 - FD43 BIKE CENTER
    { type: 'rest', index: 5 },  // subscribe user 2

    { type: 'rest', index: 6 },  // generateRSA user 3
    { type: 'web3', index: 3 },  // setPublicKeyReaders user 3 - 0121 INSURER
    { type: 'rest', index: 7 }, // subscribe user 3
    //{ type: 'rest', index: 2 },  // REST call 3
    //{ type: 'web3', index: 1 },  // web3 call 2
    //{ type: 'web3', index: 2 }   // web3 call 3
];

// Run the process with custom order
processCustomOrder(customOrder);
