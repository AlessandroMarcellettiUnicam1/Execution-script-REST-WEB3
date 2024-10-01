const { Web3 } = require('web3');
const fs = require('fs');

const web3 = new Web3('http://127.0.0.1:7545');

// Load the input data from inputs.json
const inputData = JSON.parse(fs.readFileSync('./data/inputs.json', 'utf8'));

// Function to invoke a contract method generically
async function invokeContractFunction(contractInfoPath, functionName, params) {
    // Load the contract ABI and address from the specified contract info file
    const contractData = JSON.parse(fs.readFileSync(contractInfoPath, 'utf8'));
    const { abi, address } = contractData;

    // Load the account (use your private key or account setup here)
    //const account = web3.eth.accounts.privateKeyToAccount("0x7bef7c14014234a250ea896c28e9419e3197684e5f995e64546c03928c54d204");
    //web3.eth.accounts.wallet.add(account);
    const fromAddress = "0xf90495686167301B110133f75A51D6AE729f3269";

    // Create a contract instance
    const contract = new web3.eth.Contract(abi, address);
    const txData = contract.methods[functionName](...Object.values(params)).encodeABI();
    const nonce = await web3.eth.getTransactionCount(fromAddress);
   // const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await contract.methods[functionName](...Object.values(params)).estimateGas({ from: fromAddress });

    // Call the contract function
    // const result = await contract.methods[functionName](...Object.values(params)).send({ from: fromAddress });
    // Create the raw transaction object
    const tx = {
        from: fromAddress,
        to: address,
        gas: gasEstimate,
        gasPrice: web3.utils.toWei('1', 'gwei'),
        data: txData,
        nonce
    };

    // Sign the transaction with the private key
    const signedTx = await web3.eth.accounts.signTransaction(tx, "0x7caeec038877fecbc8582fecfc79abb007d7c8160ca02df5d33a4b10a6256a4c");

    // Send the signed transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return receipt; // return transaction result or receipt
}

module.exports = { invokeContractFunction };
