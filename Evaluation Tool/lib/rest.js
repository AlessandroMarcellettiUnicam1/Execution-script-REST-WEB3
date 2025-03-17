const axios = require('axios'); // For making HTTP requests
const fs = require('fs'); // For file system operations (reading files)
const { Web3 } = require("web3"); // For interacting with Ethereum blockchain
const { MongoClient } = require('mongodb');


// Function to read XML from a file asynchronously
async function readXMLFile(filePath) {
    // Reads the content of the XML file as a string
    const xmlContent = await fs.promises.readFile(filePath, 'utf-8');
    return xmlContent; // Returns the XML content
}


// Configuration object for common HTTP headers, used in axios requests
const config = {
    headers: {
        'Content-Type': 'application/json', // Default content type for JSON
    }
};


// Function to perform a REST API call
async function performRestCall(method, endpoint, data = null) {
    let response; // Variable to store the response
    // If the HTTP method is GET
    if (method === 'GET') {
        // Perform a GET request with parameters (data is passed as query parameters)
        response = await axios.get(endpoint, { params: data });
    }
    // If the HTTP method is POST and the data is a placeholder for XML content
    else if (method === 'POST' && data === "XML_CONTENT_PLACEHOLDER") {
        // Read the XML content from a file and assign it to 'data'
        data = await readXMLFile('./data/model.xml');
        // Perform a POST request with the XML content
        response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/xml', // Set the content type to XML
            }
        });
    }
    // If the HTTP method is POST and the data contains 'starting_block' set to 0
    else if (method === 'POST' && data != null && data.hasOwnProperty("starting_block") && data.starting_block === 0) {
        // Initialize Web3 to interact with Ganache
        const web3 = new Web3('http://0.0.0.0:7545');
        // Get the latest block number from the blockchain and set it as the starting block
        data.starting_block = Number(await web3.eth.getBlockNumber());
        // Perform a POST request with the updated data
        response = await axios.post(endpoint, data, config);
    }
    // If the HTTP method is POST and none of the previous conditions were met
    else if (method === 'POST') {
        // Perform a POST request with the provided data (or an empty object if no data is provided)
        if (data) {
            response = await axios.post(endpoint, data, config);
        } else {
            response = await axios.post(endpoint, {}, config);
        }
    }
    // If the HTTP method is PUT
    else if (method === 'PUT') {
        // Perform a PUT request with the provided data
        response = await axios.put(endpoint, data);
    }
    // If the HTTP method is DELETE
    else if (method === 'DELETE') {
        // Perform a DELETE request with the provided data
        response = await axios.delete(endpoint, { data });
    }
    // Return the response data from the API call
    return response.data;
}


// Export the performRestCall function for use in other files
module.exports = { performRestCall };
