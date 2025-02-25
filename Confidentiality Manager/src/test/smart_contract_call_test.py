from web3 import Web3
import json
from decouple import config

ganache_url = "http://90.147.107.146:7545"
#ganache_url = "https://sepolia.infura.io/v3/080d5a8adcc244f4a289882d6063723c";
web3 = Web3(Web3.HTTPProvider(ganache_url,request_kwargs={'timeout': 600}))

compiled_contract_path = '../../blockchain/build/contracts/MARTSIAEth.json'
deployed_contract_address = config('CONTRACT_ADDRESS_MARTSIA')

process_id = 0

with open("process_id.txt", 'r') as file:
        content = file.read().strip()
        process_id = int(content)

list_auth = ["0x990B35b0946844c93A5cCdB2Cf2E1bCCE775b973","0xf7a75671d5c56e470Ef40306A0ca1E8dECd7FbF7","0x76Dd4d87d2147a076B065342D7610Fe3A55Cd248","0x3ca857e3e6C6d7F68944C6FE7EBa6fE28D5ba1aa"]

with open(compiled_contract_path) as file:
    contract_json = json.load(file)
    contract_abi = contract_json['abi']
contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)

 # Get the nonce
nonce = web3.eth.getTransactionCount("0x7364cc4E7F136a16a7c38DE7205B7A5b18f17258")

# Prepare the transaction to call notifyAuthorities
tx = contract.functions.notifyAuthorities(process_id, list_auth).buildTransaction({
    'chainId': 1337,  # Chain ID for Ganache
    'gas': 200000,    # Estimate or specify the gas limit
    'gasPrice': web3.eth.gasPrice,
    'nonce': nonce,
})

# Sign the transaction with the MANUFACTURER's private key
signed_tx = web3.eth.account.sign_transaction(tx, "0x2e78ccaac0156ec23652b710c05e3076de558a12addbeb6949817b93c557e857")

# Send the transaction
tx_hash = web3.eth.sendRawTransaction(signed_tx.rawTransaction)

# Wait for the transaction receipt
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=600)
print(tx_receipt)

# Get the block number of the transaction
block = web3.eth.blockNumber #+ 1
# It should return the block number so the actor know from which block he should wait for keys from the authorities
print(block)

with open("block.txt", 'w') as file:
        file.write(str(block))
