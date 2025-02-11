const { Web3 } = require('web3'); // Import the Web3 library
const fs = require('fs'); // Import the fs (file system) module for file operations


// Initialize the Web3 instance with the blockchain node URL (local Ganache)
const web3 = new Web3('http://127.0.0.1:7545');


/**
 * Function to invoke a smart contract function generically.
 *
 * @param {string} contractInfo - Contract's ABI and address.
 * @param {string} functionName - The name of the function to invoke in the smart contract.
 * @param {object} params - Parameters to pass to the smart contract function.
 * @param {string} role - The role of the invoker, determining which account and private key to use.
 * @returns {object} - The transaction receipt.
 */
async function invokeContractFunction(contractInfo, functionName, params, role) {
    let abi;
    let address;
    // Load the contract's ABI and address from the specified file
    if (contractInfo === "stateContract") {
        abi = JSON.parse(fs.readFileSync("../Confidentiality\ Manager/blockchain/build/contracts/StateContract.json", 'utf8')).abi;
        address = fs.readFileSync("../Confidentiality\ Manager/src/.env", 'utf8').match(/CONTRACT_ADDRESS_CHORCHAIN="(0x[a-fA-F0-9]{40})"/)?.[1] || 'Not found';
    } else {
        abi = JSON.parse(fs.readFileSync("../Confidentiality\ Manager/blockchain/build/contracts/ConfidentialContract.json", 'utf8')).abi;
        address = fs.readFileSync("../Confidentiality\ Manager/src/.env", 'utf8').match(/CONTRACT_ADDRESS_MARTSIA="(0x[a-fA-F0-9]{40})"/)?.[1] || 'Not found';
    }
    let fromAddress;
    // Determine the sender's address based on their role
    if (role === "default") {
        fromAddress = "0x4f21892f99a0bEC105A6c130c7B0D5613C117A11";
    } else {
        fromAddress = JSON.parse(require('fs').readFileSync('./data/users_info.json', 'utf-8')).find(item => item.role === role)?.address;
    }
    // Create a contract instance
    const contract = new web3.eth.Contract(abi, address);
    // Prepare the transaction data by encoding the contract function and its parameters
    const txData = contract.methods[functionName](...Object.values(params)).encodeABI();
    // Get the transaction nonce for the sender's address
    const nonce = await web3.eth.getTransactionCount(fromAddress);
    // Estimate the gas required for the transaction
    const gasEstimate = await contract.methods[functionName](...Object.values(params)).estimateGas({ from: fromAddress });
    // Get the current gas price from the blockchain
    const gasPrice = await web3.eth.getGasPrice();
    // Construct the transaction object
    const tx = {
        from: fromAddress,       // Sender's address
        to: address,             // Contract's address
        gas: gasEstimate,        // Estimated gas limit
        gasPrice: gasPrice,      // Gas price in wei
        data: txData,            // Encoded function call data
        nonce                    // Transaction nonce
    };
    let signedTx;
    // Sign the transaction based on the role's private key
    if (role === "default") {
        signedTx = await web3.eth.accounts.signTransaction(tx, "0x0118552def9b0b3b1963d644bf7dd57456f9ae9597c227de2e1d3ba1a3fd2e74");
    } else {
        signedTx = await web3.eth.accounts.signTransaction(tx, JSON.parse(require('fs').readFileSync('./data/users_info.json', 'utf-8')).find(item => item.role === role)?.privateKey);
    }
    // Send the signed transaction and get the receipt
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    //console.log('Transaction Hash:', receipt.transactionHash);
    //console.log("GAS USED:" + receipt.gasUsed); // Log the gas used for debugging
    return receipt; // Return the transaction receipt
}


module.exports = { invokeContractFunction }; // Export the function for external usage
