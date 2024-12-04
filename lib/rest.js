const axios = require('axios');
const fs = require('fs');
const {Web3} = require("web3");

// Function to read XML from a file
async function readXMLFile(filePath) {
    const xmlContent = await fs.promises.readFile(filePath, 'utf-8');
    return xmlContent;
}

const config = {
    headers: {
        'Content-Type': 'application/json',
    }
};

// Function to perform REST API call
async function performRestCall(method, endpoint, data = null) {
    let response;
//     "starting_block": 0
    if (method === 'GET') {
        response = await axios.get(endpoint, { params: data });
    } else if (method === 'POST' && data === "XML_CONTENT_PLACEHOLDER") {
        data = await readXMLFile('./data/x-rays.xml');
        response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/xml', // Adjust if necessary
            }
        });

    } else if (method === 'POST' && data != null && data.hasOwnProperty("starting_block") && data.starting_block === 0) {
        //const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/aZ2f8OwVa3J2HcSEuQ2OncvsEiHQSNbW');
        const web3 = new Web3('http://127.0.0.1:7545');
        data.starting_block = Number(await web3.eth.getBlockNumber());
        response = await axios.post(endpoint, data, config);
    } else if(method === 'POST'){
        if(data){
            response = await axios.post(endpoint, data, config);
        }else{
            response = await axios.post(endpoint, {}, config);
        }
    } else if (method === 'PUT') {
        response = await axios.put(endpoint, data);
    } else if (method === 'DELETE') {
        response = await axios.delete(endpoint, { data });
    }

    return response.data;
}

module.exports = { performRestCall };
