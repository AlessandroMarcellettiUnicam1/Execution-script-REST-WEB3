const fs = require('fs');
const { invokeContractFunction } = require('./lib/blockchain');
const { performRestCall } = require('./lib/rest');
const xlsx = require('xlsx');
const XLSX = require("xlsx");
const {Web3} = require("web3");
const web3 = new Web3('http://127.0.0.1:7545');
//const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/aZ2f8OwVa3J2HcSEuQ2OncvsEiHQSNbW');

// Load input data for web3 and rest calls
const blockchainInputs = JSON.parse(fs.readFileSync('./data/incident_blockchainInputs.json', 'utf8'));
//const blockchainInputs = JSON.parse(fs.readFileSync('./data/incident_blockchain_inputs.json', 'utf8'));
//const restInputs = JSON.parse(fs.readFileSync('./data/incident_rest_inputs.json', 'utf8'));
const restInputs = JSON.parse(fs.readFileSync('./data/incident_inputs.json', 'utf8'));
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
        console.log(call);
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
const customOrder_healthcare = [
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
    { type: 'web3', name: 'execute_message_type'}, // write

    //{ type: 'rest', name: 'encrypt_message_requestId1'}, // type, requestId
    //{ type: 'web3', name: 'execute_message_requestId1'}, //

    //{ type: 'rest', name: 'encrypt_message_accepted1'}, // accepted, date
    //{ type: 'web3', name: 'execute_message_accepted1'}, // write

    { type: 'rest', name: 'encrypt_message_requestId2'}, // type, requestId
    { type: 'web3', name: 'execute_message_requestId2'}, //

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
    { type: 'web3', name: 'execute_message_registration'}, // write*/

    { type: 'rest', name: 'encrypt_message_report'}, // report,ticketI
    { type: 'web3', name: 'execute_message_report'}, // write

    { type: 'rest', name: 'encrypt_message_resultId'}, // resultID
    { type: 'web3', name: 'execute_message_resultID'}, // write*/

    //---------------------
    //first invocations to obtain the key
    { type: 'rest', name: 'decrypt_check_type'},
    { type: 'web3', name: 'ask_auth_key_radiology'}, // write
    { type: 'rest', name: 'decrypt_wait_type'}, // type
    //{ type: 'rest', name: 'decrypt_check_type'} // type*/

    //{ type: 'rest', name: 'decrypt_check_requestId1'},
    { type: 'rest', name: 'decrypt_check_requestId2'},

    //{ type: 'rest', name: 'decrypt_check_accepted1'},
    { type: 'rest', name: 'decrypt_check_accepted2'},
    { type: 'web3', name: 'ask_auth_key_ward'},
    { type: 'rest', name: 'decrypt_wait_accepted'},

    //{ type: 'rest', name: 'decrypt_check_accepted2'},

    { type: 'rest', name: 'decrypt_check_appointment'},
    { type: 'web3', name: 'ask_auth_key_patient'},
    { type: 'rest', name: 'decrypt_wait_appointment'},

    { type: 'rest', name: 'decrypt_check_certificationId'},
    //{ type: 'web3', name: 'ask_auth_key_radiology'},
    //{ type: 'rest', name: 'decrypt_wait_certificationId'},

    { type: 'rest', name: 'decrypt_check_temperature'},
    { type: 'rest', name: 'decrypt_check_appointmentId'},
    { type: 'rest', name: 'decrypt_check_registration'},
    { type: 'rest', name: 'decrypt_check_ticketId'},
    { type: 'rest', name: 'decrypt_check_resultId'}
];

const customOrder = [
    { type: 'rest', name: 'saveModel' },
    // createInstance function
    { type: 'rest', name: 'createInstance' },  // REST call 2
    //subscribe1-3
    { type: 'rest', name: 'generateKeyPair_customer' },  //generateRSA user 1
    { type: 'web3', name: 'PublicKeyReaders_customer' },  // setPublicKeyReaders user 1 - DD9 CUSTOMER
    { type: 'rest', name: 'subscribe_customer' },  // subscribe user 1

    { type: 'rest', name: 'generateKeyPair_retailer' }, // generateRSA user 2
    { type: 'web3', name: 'PublicKeyReaders_retailer' },  // setPublicKeyReaders user 2 - FD43 BIKE CENTER
    { type: 'rest', name: 'subscribe_retailer' },  // subscribe user 2

    { type: 'rest', name: 'generateKeyPair_producer' },  // generateRSA user 3
    { type: 'web3', name: 'PublicKeyReaders_producer' },  // setPublicKeyReaders user 3 - 0121 INSURER
    { type: 'rest', name: 'subscribe_producer' }, // subscribe user 3

    { type: 'rest', name: 'translation1' }, // chorchain deploy
    { type: 'rest', name: 'translation2' }, // generateMartsiaInstance
    { type: 'rest', name: 'attributesCertification'}, // certify
    { type: 'web3', name: 'instantiateProcess' }, //instantiate process
    { type: 'web3', name: 'setInstanceConditions' },  //Set conditions

    //write for each message of the choreography
    { type: 'rest', name: 'encrypt_message_goodAmount'}, // type
    { type: 'web3', name: 'execute_message_goodAmount'}, // write

    { type: 'rest', name: 'encrypt_message_priceAv'}, // type
    { type: 'web3', name: 'execute_message_priceAv'}, // write

    { type: 'rest', name: 'encrypt_message_productQuantity'}, // type
    { type: 'web3', name: 'execute_message_productQuantity'}, // write

    { type: 'rest', name: 'encrypt_message_availabilityCost'}, // type
    { type: 'web3', name: 'execute_message_availabilityCost'}, // write

    { type: 'rest', name: 'encrypt_message_receipt1'}, // type
    { type: 'web3', name: 'execute_message_receipt1'}, // write

    { type: 'rest', name: 'encrypt_message_stringOrderID'}, // type
    { type: 'web3', name: 'execute_message_stringOrderID'}, // write

    { type: 'rest', name: 'encrypt_message_certificationId'}, // type
    { type: 'web3', name: 'execute_message_certificationId'}, // write

    { type: 'rest', name: 'encrypt_message_shipInfo'}, // type
    { type: 'web3', name: 'execute_message_shipInfo'}, // write

    { type: 'rest', name: 'encrypt_message_receipt2'}, // type
    { type: 'web3', name: 'execute_message_receipt2'}, // write

    { type: 'rest', name: 'encrypt_message_orderDetail'}, // type
    { type: 'web3', name: 'execute_message_orderDetail'}, // write

    { type: 'rest', name: 'encrypt_message_customerAddress'}, // type
    { type: 'web3', name: 'execute_message_customerAddress'}, // write

    { type: 'rest', name: 'encrypt_message_customerShipment'}, // type
    { type: 'web3', name: 'execute_message_customerShipment'}, // write*/

    { type: 'rest', name: 'decrypt_check_goodAmount'}, // type
    { type: 'web3', name: 'ask_auth_key_producer'}, // write
    { type: 'rest', name: 'decrypt_wait_goodAmount'}, // type

    { type: 'web3', name: 'ask_auth_key_producer'}, // write
    { type: 'rest', name: 'decrypt_wait_goodAmount'}, // type

    { type: 'web3', name: 'ask_auth_key_producer'}, // write
    { type: 'rest', name: 'decrypt_wait_goodAmount'}, // type

    //{ type: 'rest', name: 'decrypt_check_priceAv'}, // type
    //{ type: 'web3', name: 'ask_auth_key_customer'}, // write
    { type: 'rest', name: 'decrypt_check_priceAv'}, // type

    //{ type: 'web3', name: 'ask_auth_key_retailer'}, // write
    { type: 'rest', name: 'decrypt_check_productQuantity'}, // type

    { type: 'rest', name: 'decrypt_check_availabilityCost'}, // type
    { type: 'rest', name: 'decrypt_check_receipt1'}, // type
    { type: 'rest', name: 'decrypt_check_stringOrderID'}, // type
    { type: 'rest', name: 'decrypt_check_certificationId'}, // type
    { type: 'rest', name: 'decrypt_check_shipInfo'}, // type
    { type: 'rest', name: 'decrypt_check_receipt2'}, // type
    { type: 'rest', name: 'decrypt_check_orderDetail'}, // type
    { type: 'rest', name: 'decrypt_check_customerAddress'}, // type
    { type: 'rest', name: 'decrypt_check_customerShipment'}, // type



]

const customOrderIncident = [
    { type: 'rest', name: 'saveModel' },
    // createInstance function
    { type: 'rest', name: 'createInstance' },
    //subscribe1-3


    { type: 'rest', name: 'generateKeyPair_VIPCUSTOMER' },
    { type: 'web3', name: 'PublicKeyReaders_VIPCUSTOMER' },
    { type: 'rest', name: 'subscribe_VIPCUSTOMER' },

    { type: 'rest', name: 'generateKeyPair_SOFTWAREDEVELOPER' },
    { type: 'web3', name: 'PublicKeyReaders_SOFTWAREDEVELOPER' },
    { type: 'rest', name: 'subscribe_SOFTWAREDEVELOPER' },

    { type: 'rest', name: 'generateKeyPair_2NDLEVELSUPPORTAGENT' },
    { type: 'web3', name: 'PublicKeyReaders_2NDLEVELSUPPORTAGENT' },
    { type: 'rest', name: 'subscribe_2NDLEVELSUPPORTAGENT' },

    { type: 'rest', name: 'generateKeyPair_KEYACCOUNTMANAGER' },
    { type: 'web3', name: 'PublicKeyReaders_KEYACCOUNTMANAGER' },
    { type: 'rest', name: 'subscribe_KEYACCOUNTMANAGER' },

    { type: 'rest', name: 'generateKeyPair_1STLEVELSUPPORTAGENT' },
    { type: 'web3', name: 'PublicKeyReaders_1STLEVELSUPPORTAGENT' },
    { type: 'rest', name: 'subscribe_1STLEVELSUPPORTAGENT' },

    { type: 'rest', name: 'translation1' },
    { type: 'rest', name: 'translation2' },
    { type: 'rest', name: 'attributesCertification'},
    { type: 'web3', name: 'instantiateProcess' },
    { type: 'web3', name: 'setInstanceConditions' },

    { type: 'rest', name: 'encrypt_message_problem'},
    { type: 'web3', name: 'execute_message_problem'},

    { type: 'rest', name: 'encrypt_message_questions'},
    { type: 'web3', name: 'execute_message_questions'},

    { type: 'rest', name: 'encrypt_message_answer'},
    { type: 'web3', name: 'execute_message_answer'},

    { type: 'rest', name: 'encrypt_message_handle'},
    { type: 'web3', name: 'execute_message_handle'},

    { type: 'rest', name: 'encrypt_message_firstIssue'},
    { type: 'web3', name: 'execute_message_firstIssue'},

    { type: 'rest', name: 'encrypt_message_result'},
    { type: 'web3', name: 'execute_message_result'},

   // { type: 'rest', name: 'encrypt_message_secondIssue'},
    //{ type: 'web3', name: 'execute_message_secondIssue'},

    //{ type: 'rest', name: 'encrypt_message_resolved'},
    //{ type: 'web3', name: 'execute_message_resolved'},

    // { type: 'rest', name: 'encrypt_message_devIssue'},
    // { type: 'web3', name: 'execute_message_devIssue'},

    //{ type: 'rest', name: 'encrypt_message_secondFeedback'},
    //{ type: 'web3', name: 'execute_message_secondFeedback'},

    //{ type: 'rest', name: 'encrypt_message_firstFeedback'},
    //{ type: 'web3', name: 'execute_message_firstFeedback'},

    //{ type: 'rest', name: 'encrypt_message_finalFeedback'},
    //{ type: 'web3', name: 'execute_message_finalFeedback'},

    //{ type: 'rest', name: 'encrypt_message_solution'},
    //{ type: 'web3', name: 'execute_message_solution'},

    { type: 'web3', name: 'ask_auth_key_KEYACCOUNTMANAGER'}, // write
    { type: 'rest', name: 'decrypt_wait_problem'}, // type

    { type: 'web3', name: 'ask_auth_key_KEYACCOUNTMANAGER'}, // write
    { type: 'rest', name: 'decrypt_wait_questions'}, // type

    //{ type: 'web3', name: 'ask_auth_key_KEYACCOUNTMANAGER'}, // write
    // { type: 'rest', name: 'decrypt_wait_answer'}, // type

    //{ type: 'web3', name: 'ask_auth_key_KEYACCOUNTMANAGER'}, // write
    //{ type: 'rest', name: 'decrypt_wait_handle'}, // type

    //{ type: 'web3', name: 'ask_auth_key_KEYACCOUNTMANAGER'}, // write
    //{ type: 'rest', name: 'decrypt_wait_firstIssue'}, // type

    { type: 'rest', name: 'decrypt_check_result'},
    //{ type: 'rest', name: 'decrypt_check_secondIssue'},
    //{ type: 'rest', name: 'decrypt_check_resolved'},
    //{ type: 'rest', name: 'decrypt_check_devIssue'},
    //{ type: 'rest', name: 'decrypt_check_secondFeedback'},
    //{ type: 'rest', name: 'decrypt_check_firstFeedback'},
    //{ type: 'rest', name: 'decrypt_check_finalFeedback'},
    { type: 'rest', name: 'decrypt_check_solution'}
]

// Main function to iterate over the customOrder execution 5 times
async function main() {
    // Initialize the timing data map based on custom order
    initializeTimingDataMap(customOrderIncident);

    // Run the custom order 5 times
    for (let i = 1; i <= 1; i++) {
        console.log(`--- Starting iteration ${i} ---`);
        await processCustomOrder(customOrderIncident, i);
        console.log(`--- Completed iteration ${i} ---`);
    }

    // Save the accumulated timing data to an Excel file
    saveTimingDataToExcel(timingDataMap);
}

// Run the main function
main();
