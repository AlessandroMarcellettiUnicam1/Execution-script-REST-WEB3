const axios = require('axios');
const fs = require('fs');

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


    if (method === 'GET') {
        response = await axios.get(endpoint, { params: data });
    } else if (method === 'POST' && data === "XML_CONTENT_PLACEHOLDER") {
        data = await readXMLFile('./data/x-rays.xml');
        response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/xml', // Adjust if necessary
            }
        });

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
