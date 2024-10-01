const {Web3} = require('web3');

// Replace with your Ethereum node provider, e.g., Infura or Alchemy URL
const providerUrl = 'https://polygon-amoy.g.alchemy.com/v2/3d_iKpeXYvH7_kk1kfv5kvqxnsJgOCcZ';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

// Replace with your contract address
const contractAddress = '0x0c8AbF34c4184d94e5CF5254D30Cf493501d5381';

const transactionHashes = [
    '0x1bfd2718a30d8dd597eabf36c5a8b53983667566057fb88a26cac2b1b5a9b084'
];

// This function calculates the gas used for each transaction hash and sums them
async function calculateTotalGasUsed(txHashes) {
    let totalGasUsed = BigInt(0);  // Initialize as BigInt

    for (const txHash of txHashes) {
        try {
            // Get the transaction receipt to get the gas used
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            if (receipt) {
                console.log(receipt);
                const gasUsed = BigInt(receipt.gasUsed); // Convert to BigInt
                console.log(`Transaction: ${txHash} used ${gasUsed} gas`);
                totalGasUsed += gasUsed;  // Use BigInt addition
            } else {
                console.log(`No receipt found for transaction: ${txHash}`);
            }
        } catch (error) {
            console.error(`Error fetching receipt for transaction ${txHash}:`, error);
        }
    }

    console.log(`Total gas used for the provided transactions: ${totalGasUsed}`);
    return totalGasUsed;
}

// Main function to execute the process
(async () => {
    try {
        if (transactionHashes.length === 0) {
            console.log('No transaction hashes provided.');
            return;
        }

        console.log(`Calculating total gas used for ${transactionHashes.length} transactions...`);
        await calculateTotalGasUsed(transactionHashes);
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
