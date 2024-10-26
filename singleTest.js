const fs = require('fs');
const {invokeContractFunction} = require('./lib/blockchain');
const { performRestCall } = require('./lib/rest');
const XLSX = require('xlsx'); // Import the xlsx library

// Load input data for web3 and rest calls
const blockchainInputs = JSON.parse(fs.readFileSync('./data/inputs.json', 'utf8'));
const restInputs = JSON.parse(fs.readFileSync('./data/rest_inputs.json', 'utf8'));
let instanceId = "";
let martsiaId = 0;

// Data for Excel report
let excelData = [];
let totalExecutionTime = 0;

// Function to process web3 call with predefined params
async function processWeb3Call(index) {
    const { contractInfoPath, functionName, params, role} = blockchainInputs.calls[index];  // Take data from the specific call
    if(params.hasOwnProperty("process_id") && params.process_id === 0){
        params.process_id = martsiaId;
    }
    const startTime = Date.now();  // Start the timer

    try {
        const result = await invokeContractFunction(contractInfoPath, functionName, params, role);  // Call the function with predefined params
        const elapsedTime = Date.now() - startTime;  // Calculate elapsed time
        totalExecutionTime += elapsedTime; // Add to total time

        console.log(`Successfully executed ${functionName} on contract at ${contractInfoPath} in ${elapsedTime} ms`);
        // Record data for Excel
        excelData.push({
            'Type': 'web3',
            'Name': functionName,
            'Duration (ms)': elapsedTime
        });
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
    let response = {};

    const startTime = Date.now();  // Start the timer

    if (index === 1) {
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
        response = await performRestCall(method, endpoint, data);
        //console.log(`Successfully executed ${method}`);
    } else {
        response = await performRestCall(method, endpoint, data);
        //console.log(`Successfully executed ${method} `);
    }
    const elapsedTime = Date.now() - startTime;  // Calculate elapsed time
    totalExecutionTime += elapsedTime; // Add to total time

    console.log(`REST call ${endpoint} at index ${index} completed in ${elapsedTime} ms`);

    // Record data for Excel
    excelData.push({
        'Type': 'REST',
        'Name': endpoint,
        'Duration (ms)': elapsedTime
    });

    //console.log(response);
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
            console.error(`Error processing ${call.type} call at index ${call.index}:`,error);
        }
    }
    saveToExcel();
}
// Function to save results to Excel
function saveToExcel() {
    // Add the total execution time to the data
    excelData.push({
        'Type': 'Total',
        'Name': 'All Calls',
        'Duration (ms)': totalExecutionTime
    });

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Execution Times');

    // Write the workbook to a file
    XLSX.writeFile(workbook, './execution_times.xlsx');

    console.log('Excel report generated: execution_times.xlsx');
}
// Define the order of calls (example: REST 1, REST 2, web3 1, REST 3, web3 2, web3 3)
const customOrder = [
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
    { type: 'web3', index: 2 },  // setPublicKeyReaders user 3 - 0121 INSURER
    { type: 'rest', index: 7 }, // subscribe user 3

    { type: 'rest', index: 8 }, // chorchain deploy
    { type: 'rest', index: 9 }, // generateMartsiaInstance
    { type: 'rest', index: 10}, // certify
    { type: 'web3', index: 3 }, //instantiate process
    { type: 'web3', index: 4 },  //Set conditions*/

    //write for each message of the choreography
    { type: 'rest', index: 11}, // type
    { type: 'web3', index: 5}, // write

    { type: 'rest', index: 12}, // type, requestId
    { type: 'web3', index: 6}, //

    { type: 'rest', index: 13}, // accepted, date
    { type: 'web3', index: 7}, // write

    { type: 'rest', index: 14}, // certificationID
    { type: 'web3', index: 8}, // write

    { type: 'rest', index: 15}, // temperature
    { type: 'web3', index: 9}, // write

    { type: 'rest', index: 16}, // appointmentId
    { type: 'web3', index: 10}, // write

    { type: 'rest', index: 17}, // registration
    { type: 'web3', index: 11}, // write

    { type: 'rest', index: 18}, // report,ticketId
    { type: 'web3', index: 12}, // write

    { type: 'rest', index: 19}, // resultID
    { type: 'web3', index: 13}, // write



];



// Run the process with custom order
processCustomOrder(customOrder);
