const {Web3} = require('web3');

// Replace with your Ethereum node provider, e.g., Infura or Alchemy URL
const providerUrl = 'https://eth-sepolia.g.alchemy.com/v2/aZ2f8OwVa3J2HcSEuQ2OncvsEiHQSNbW';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

// Replace with your contract address
const contractAddress = '0x0c8AbF34c4184d94e5CF5254D30Cf493501d5381';

const transactionHashes = [
    '0x99a8f7d38174e432526ee4fe0f4e33899cad9a254c71392c4cf709661ec13877',
    '0x55a5362f8c08753d1d751507537d0a48916d09608c88b68fc2c69798b57f675c',
    '0x6a9edf911a5098d7994598dceabd8e328b5db983519ca6870e0a3f5fe7262dfe',
    '0x65e8e7220aa64a6d201a464c889cb9bb1a2022eab95fdf0d2ca33a80cc98fa11',
    '0xb74a0359f94504fc35f28f5e469b07c16535c7342d7324c493bba36e444147c1',
    '0xdd273f2f928c6f12180c78652e94006d329a91eb8b6ed12a9489e05d00fc50c2',
    '0xd25885ba4a1010ac703b949260b3c2f9b1ed081b1462afa81a0f6598945b7432',
    '0x420e04a6a9aaaaca581ae70784f24b0ff5e10f3b8efefb08c9ccdeaf7f409e3d',
    '0x85b8597082b627912a9a880a25bf37b3b9fcce0a3df63ce2fa244316060d2e81',
    '0xf8a421c8ba330361c6712133c54b10f0d2d64b0cd4e2921cab8802fcdef654f9',
    '0x509dd45899df87ce626076d00df87fed7426580e4d45efcb32d52ee87880787e',
    '0xc79746772478bff82ecdac8b991c1036620ae42a399fe7938443f34bb6b71faf',
    '0xd1d111c2b5c48be9ed47cb94805941d4f4014f2a80a5805ddb1fac6b7a739726',
    '0xf2cf224db1e501e19dbad8b29e98215de8603b64a59e39ad3ce5c69b7d8d1dcd',
    '0x4912a391f3d403e41ef1eae5990198993abf7253ef6e7c93515535414f0b4e56',
    '0xb497a48f986fa4be58469e334e2e88a5980bf45e6c547d22ff6cc8d3738fb49c',
    '0xf58d94a44b904570d1b6b44c9b00f5f5d728ead464ea29e4b1ac031ae8550032',
    '0xabf3d3ad7a3268c55a7bee7a6ccb0d722c822c30609a7896cbbcbf3af033b478',
    '0x1c233b5063a45274abf9d6ccdd6ce6366107f040c73a161892c88c813e58a555',
    '0xb1e77b4ca2e26f64112506d7d70bce774c0e2b906943606fe26d273b1864136e',
    '0xc516e11f960491b9c1ee1ce331cd26bcdda4186e7295127cc5b34a7ae4ea6c38',
    '0x18819fcd3a1fcaa980db25c2b51c4b8292b9ab0c4af7f2bf5fcfa414cd78f03a',
    '0xed34741d33292c122d8d4088ea7cc8d94c2b4b50fbff5cd71d922689fd8e567b',
    '0x5a358368df9fdae72a35be5034586f00b738390233173617cc4e7ae5d0f144a3',
    '0x3aa67cccb9b7a2cbfa5825fda1ac88917ed1536622b04199f3c75bb2e98075b1',
    '0xc10c8a17d1420a283c6957e4270b7f4c0460e849f3958c634fc61febfd198229',
    '0x763ad800cfc9fc4c8d18db57d36b6b49db8ab4ceeb07be979a065286399108fa',
    '0xd3cd42e9ada631e66a07d81ad9fd00e113d3e1fcb4c347cf9af700dabee08341',
    '0x00d100c22e686846aafb79c13df594f7bbb6272faf9684c8fe01f1b378d5b52b',
    '0xce872ea66b327546ca80fee7d3adca0f87eae5deeaac1ae2c640ddceedcf4c32',
    '0x934d3db4c22eb67057c4783b384c48f45a2d8facf85fc5cc2b67d3a9a480994c',
    '0xa1165b27a8e2ae59fa920c7b93119d68bde27e5e10be8f1cb628a1cd4b96b47d',
    '0x8fc51f033b475addc1b250c8e8dae24b895f1da3951d4520cc0a100c0b5f6392',
    '0x1087ef90e087ad31c48697ff6393ebad1be9f6240ceeaa3e3c0bcd7387cc82a6',
    '0xe449a9b20d6d3d2aebc27bca7331a5f8ec7a7548fe009489a9a1fa32fc6ff973',
    '0xeaa59fa70bc576fa3be09a7ae67b938921d9b0b8d609f26b607804932e185db8',
    '0x43a9a1f48873a0acf730c570ee74ac71ac5e26b9a52e3675a62167fd73cdf362',
    '0xb6e40ddb1d4c6f87a9b7a623f5edee917b79e5be32f567d80cb7ae079399feb3'
];

// This function calculates the gas used for each transaction hash and sums them
async function calculateTotalGasUsed(txHashes) {
    let totalGasUsed = BigInt(0);  // Initialize as BigInt

    for (const txHash of txHashes) {
        try {
            // Get the transaction receipt to get the gas used
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            if (receipt) {
                const gasUsed = BigInt(receipt.gasUsed); // Convert to BigInt
                console.log(`Transaction: ${txHash} used: ${gasUsed}`);
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
