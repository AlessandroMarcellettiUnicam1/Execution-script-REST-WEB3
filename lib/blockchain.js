const { Web3 } = require('web3');
const fs = require('fs');

//const web3 = new Web3('http://127.0.0.1:7545');
const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/aZ2f8OwVa3J2HcSEuQ2OncvsEiHQSNbW');

// Load the input data from inputs.json
const inputData = JSON.parse(fs.readFileSync('./data/blockchain_inputs.json', 'utf8'));

// Function to invoke a contract method generically
async function invokeContractFunction(contractInfoPath, functionName, params, role) {
    // Load the contract ABI and address from the specified contract info file
    const contractData = JSON.parse(fs.readFileSync(contractInfoPath, 'utf8'));
    const { abi, address } = contractData;

    /*if(params.hasOwnProperty("process_id") && params.process_id == 0){
        params.process_id = 519542;
        console.log("current process instance: ", params.process_id);
    }*/
    let fromAddress = "";
    if(role === "default"){
        fromAddress = "0x6ffFB32dbA2170DA32f819295C746688B37Af5ec";
    }else if(role === "patient"){
        //PATIENT ADDRESS
        fromAddress = "0x62AbA4475128080Dd4B59FA5D7E2fAEb2B720A21";
    }else if(role == "radiology"){
        //RADIOLOGY address
        fromAddress = "0xc58A17120480496809797520150f4aA43c24Fd43";
    }else if(role == "ward"){
        //WARD address
        fromAddress = "0x2eDFDA2154998dfe682996ff43DE98323de86dd9";
    }


    // Create a contract instance
    const contract = new web3.eth.Contract(abi, address);
    const txData = contract.methods[functionName](...Object.values(params)).encodeABI();
    const nonce = await web3.eth.getTransactionCount(fromAddress);
   // const gasPrice = await web3.eth.getGasPrice();
   /*if(functionName == "setIPFSLink"){
        const publicContract = new web3.eth.Contract(publicAbi, publicAddress);
        const messageState = await publicContract.methods.getInstanceElement(params.process_id, params.message_id).call()
        console.log("---Element state---");
        console.log(messageState);
    }*/
    const gasEstimate = await contract.methods[functionName](...Object.values(params)).estimateGas({ from: fromAddress });
    const gasPrice = await web3.eth.getGasPrice();
    // Call the contract function
    // const result = await contract.methods[functionName](...Object.values(params)).send({ from: fromAddress });
    // Create the raw transaction object
    const tx = {
        from: fromAddress,
        to: address,
        gas: gasEstimate,
        gasPrice: gasPrice, //web3.utils.toWei('1', 'gwei'),
        data: txData,
        nonce
    };
    let signedTx = {};
    if(role === "default"){
        signedTx = await web3.eth.accounts.signTransaction(tx, "0x5a12a0bd1916334e7ffaada022ef9e07418c51fd823017f96b5126002dc28850");
    }if(role === "patient"){
        //Sign the transaction with the private key of the PATIENT
        signedTx = await web3.eth.accounts.signTransaction(tx, "0x7bcc561ab9d013d18d904b9af1c59439eabc5df6c6f8cb76365e016b6508a906");
    }else if(role == "radiology"){
        //Sign the transaction with the private key of the RADIOLOGY
        signedTx = await web3.eth.accounts.signTransaction(tx, "0xf9efe77f9cf756314ad3fd145786253c8519e5980e37527bfccd31e26808588b");
    }else if(role == "ward"){
        // Sign the transaction with the private key of the WARD
        signedTx = await web3.eth.accounts.signTransaction(tx, "0x7bef7c14014234a250ea896c28e9419e3197684e5f995e64546c03928c54d204");
    }


    // Send the signed transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    //console.log(receipt);
    return receipt; // return transaction result or receipt
}

module.exports = { invokeContractFunction };
