const {Web3} = require('web3');

class Node {
    constructor(rpcUrl, contractAddresses) {
        /**
         * Initializes the Node.
         *
         * @param {string} rpcUrl - The URL of the Ethereum node's RPC endpoint.
         * @param {Array} contractAddresses - An array of smart contract addresses to filter transactions for.
         */
        this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

        if (!this.web3.eth.net.isListening()) {
            throw new Error("Failed to connect to the Ethereum node.");
        }

        this.contractAddresses = contractAddresses.map(addr => addr.toLowerCase());
    }

    async fetchLatestTransactions(limit = 50) {
        /**
         * Fetches the latest transactions from the blockchain, filtering for specific smart contracts.
         *
         * @param {number} limit - The number of latest transactions to retrieve.
         */
        try {
            const latestBlockNumber = await this.web3.eth.getBlockNumber();
            let transactions = [];

            for (let i = latestBlockNumber; i >= 0 && transactions.length < limit; i--) {
                const block = await this.web3.eth.getBlock(i, true);
                if (block && block.transactions) {
                    const filteredTxs = block.transactions.filter(tx =>
                        tx.to && this.contractAddresses.includes(tx.to.toLowerCase())
                    );
                    filteredTxs.forEach(tx => tx.blockNumber = block.number); // Attach block number to each transaction
                    transactions.push(...filteredTxs);
                }
            }

            transactions = transactions.slice(0, limit);
            transactions.forEach(tx => {
                console.log(`Transaction Hash: ${tx.hash}`);
                console.log(`From: ${tx.from}`);
                console.log(`To: ${tx.to}`);
                console.log(`Value: ${this.web3.utils.fromWei(tx.value, 'ether')} ETH`);
                console.log(`Gas: ${tx.gas}`);
                console.log(`Gas Price: ${this.web3.utils.fromWei(tx.gasPrice, 'gwei')} Gwei`);
                console.log(`Block Number: ${tx.blockNumber}`);
                console.log("-".repeat(40));
            });

        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }
}

// Example usage:
(async () => {
    const RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL
    const CONTRACT_ADDRESSES = [
        "0x8c27b2cfe7Be4aa5b66704a13AB7Ceb9a9308349", // Replace with your first contract address
        "0x70f8265Ba40AEcA6Bc24A61C9F9e6df56b7De91f" // Replace with your second contract address
    ];

    const node = new Node(RPC_URL, CONTRACT_ADDRESSES);
    await node.fetchLatestTransactions(70); // Fetch the latest 50 transactions directed to the specified contracts
})();
