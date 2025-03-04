from web3 import Web3
from decouple import config
import json
import base64
import time

TESTING = False

# Configure web3 provider for Ganache
ganache_url = "http://172.31.80.1:7545"

web3 = Web3(Web3.HTTPProvider(ganache_url,request_kwargs={'timeout': 600}))

compiled_contract_path = '../blockchain/build/contracts/ConfidentialContract.json'
deployed_contract_address = config('CONTRACT_ADDRESS_MARTSIA')

state_compiled_contract_path = '../blockchain/build/contracts/StateContract.json'
state_deployed_contract_address = config('CONTRACT_ADDRESS_CHORCHAIN')

verbose = False


def get_nonce(ETH_address):
    return web3.eth.get_transaction_count(ETH_address)


def activate_contract(attribute_certifier_address, private_key):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    tx = {
        'nonce': get_nonce(attribute_certifier_address),
        'gasPrice': web3.eth.gas_price,
        'from': attribute_certifier_address
    }
    message = contract.functions.updateMajorityCount().buildTransaction(tx)
    signed_transaction = web3.eth.account.sign_transaction(message, private_key)
    transaction_hash = __send_txt__(signed_transaction.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(transaction_hash, timeout=50000)
    if verbose:
        print(tx_receipt)


def __send_txt__(signed_transaction_type):
    try:
        transaction_hash = web3.eth.send_raw_transaction(signed_transaction_type)
        return transaction_hash
    except Exception as e:
        print(e)
        if input("Do you want to try again (y/n)?") == 'y':
            __send_txt__(signed_transaction_type)
        else:
            raise Exception("Transaction failed")


def send_authority_names(authority_address, private_key, process_instance_id, hash_file, authority_number):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message_bytes = hash_file.encode('ascii')
    base64_bytes = base64.b64encode(message_bytes)
    start = time.time()
    tx = {
        'nonce': get_nonce(authority_address),
        'gasPrice': web3.eth.gas_price,
        'from': authority_address,
        'gas': 3000000
    }
    message = contract.functions.setAuthoritiesNames(int(process_instance_id), base64_bytes[:32],
                                                     base64_bytes[32:]).buildTransaction(tx)
    signed_transaction = web3.eth.account.sign_transaction(message, private_key)
    transaction_hash = __send_txt__(signed_transaction.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(transaction_hash, timeout=50000)
    if verbose:
        print(tx_receipt)
    end = time.time()
    with open('removing_time_Auth'+ str(authority_number) +'.txt', 'w') as f:
        f.write(str(start*1000) + " " + str(end*1000) + "\n")


def retrieve_authority_names(authority_address, process_instance_id):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message = contract.functions.getAuthoritiesNames(authority_address, int(process_instance_id)).call()
    message_bytes = base64.b64decode(message)
    message = message_bytes.decode('ascii')
    return message


def get_stateContract_policies(process_instance_id):
    with open(state_compiled_contract_path) as file:
        contract_json = json.load(file)
        state_contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=state_deployed_contract_address, abi=state_contract_abi)
    policyLink = contract.functions.getInstancePolicy(process_instance_id).call()
    policy_bytes = base64.b64decode(policyLink)
    policy = policy_bytes.decode('ascii')
    return policy

def get_current_state(process_instance_id, message_id, user_address):
    with open(state_compiled_contract_path) as file:
        contract_json = json.load(file)
    state_contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=state_deployed_contract_address, abi=state_contract_abi)
    #instanceId - uint64, msgToExecute - uint64, user - address
    try:
        currentState = contract.functions.getMartsiaChecks(process_instance_id, message_id, user_address).call()
        #print("Function call result:", result)

    except Exception as e:
        currentState = false
        print("Revert occurred:", e)

    return currentState


def sendHashedElements(authority_address, private_key, process_instance_id, elements, authority_number):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    hashPart1 = elements[0].encode('utf-8')
    hashPart2 = elements[1].encode('utf-8')
    start = time.time()
    tx = {
        'nonce': get_nonce(authority_address),
        'gasPrice': web3.eth.gas_price,
        'from': authority_address,
        'gas': 3000000
    }
    message = contract.functions.setElementHashed(process_instance_id, hashPart1[:32], hashPart1[32:], hashPart2[:32],
                                                  hashPart2[32:]).buildTransaction(tx)
    signed_transaction = web3.eth.account.sign_transaction(message, private_key)
    transaction_hash = __send_txt__(signed_transaction.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(transaction_hash, timeout=50000)
    if verbose:
        print(tx_receipt)
    end = time.time()
    with open('removing_time_Auth'+ str(authority_number) +'.txt', 'a') as f:
        f.write(str(start*1000) + " " + str(end*1000)+ "\n")

    


def retrieveHashedElements(eth_address, process_instance_id):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message = contract.functions.getElementHashed(eth_address, process_instance_id).call()
    hashedg11 = message[0].decode('utf-8')
    hashedg21 = message[1].decode('utf-8')
    return hashedg11, hashedg21


def sendElements(authority_address, private_key, process_instance_id, elements, authority_number):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    hashPart1 = elements[0]
    hashPart2 = elements[1]
    # hashPart1 = hashPart1[64:] + b'000000'
    start = time.time()
    tx = {
        'nonce': get_nonce(authority_address),
        'gasPrice': web3.eth.gas_price,
        'from': authority_address,
        'gas': 3000000
    }
    message = contract.functions.setElement(process_instance_id, hashPart1[:32], hashPart1[32:64],
                                            hashPart1[64:] + b'000000', hashPart2[:32], hashPart2[32:64],
                                            hashPart2[64:] + b'000000').buildTransaction(tx)
    signed_transaction = web3.eth.account.sign_transaction(message, private_key)
    transaction_hash = __send_txt__(signed_transaction.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(transaction_hash, timeout=50000)
    if verbose:
        print(tx_receipt)
    end = time.time()
    with open('removing_time_Auth'+ str(authority_number) +'.txt', 'a') as f:
        f.write(str(start*1000) + " " + str(end*1000) + "\n")


def retrieveElements(eth_address, process_instance_id):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message = contract.functions.getElement(eth_address, process_instance_id).call()
    g11 = message[0] + message[1]
    g11 = g11[:90]
    g21 = message[2] + message[3]
    g21 = g21[:90]
    return g11, g21


def send_parameters_link(authority_address, private_key, process_instance_id, hash_file, authority_number):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message_bytes = hash_file.encode('ascii')
    base64_bytes = base64.b64encode(message_bytes)
    start = time.time()
    tx = {
        'nonce': get_nonce(authority_address),
        'gasPrice': web3.eth.gas_price,
        'from': authority_address,
        'gas': 3000000
    }
    message = contract.functions.setPublicParameters(int(process_instance_id), base64_bytes[:32],
                                                     base64_bytes[32:]).buildTransaction(tx)
    signed_transaction = web3.eth.account.sign_transaction(message, private_key)
    transaction_hash = __send_txt__(signed_transaction.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(transaction_hash, timeout=50000)
    if verbose:
        print(tx_receipt)
    end = time.time()
    with open('removing_time_Auth'+ str(authority_number) +'.txt', 'a') as f:
        f.write(str(start*1000) + " " + str(end*1000) + "\n")


def retrieve_parameters_link(authority_address, process_instance_id):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message = contract.functions.getPublicParameters(authority_address, int(process_instance_id)).call()
    message_bytes = base64.b64decode(message)
    message = message_bytes.decode('ascii')
    return message


def send_publicKey_link(authority_address, private_key, process_instance_id, hash_file, authority_number):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message_bytes = hash_file.encode('ascii')
    base64_bytes = base64.b64encode(message_bytes)
    start = time.time()
    tx = {
        'nonce': get_nonce(authority_address),
        'gasPrice': web3.eth.gas_price,
        'from': authority_address,
        'gas': 3000000
    }
    message = contract.functions.setPublicKey(int(process_instance_id), base64_bytes[:32],
                                              base64_bytes[32:]).buildTransaction(tx)
    signed_transaction = web3.eth.account.sign_transaction(message, private_key)
    transaction_hash = __send_txt__(signed_transaction.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(transaction_hash, timeout=50000)
    if verbose:
        print(tx_receipt)
    end = time.time()
    with open('removing_time_Auth'+ str(authority_number) +'.txt', 'a') as f:
        f.write(str(start*1000) + " " + str(end*1000) + "\n")


def retrieve_publicKey_link(eth_address, process_instance_id):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message = contract.functions.getPublicKey(eth_address, int(process_instance_id)).call()
    message_bytes = base64.b64decode(message)
    message1 = message_bytes.decode('ascii')
    return message1


def send_MessageIPFSLink(message_id, hash_file):
    # This "if" is done only for testing, here the INTERNATIONAL SUPPLIER ("0xa5B6B3729Cf8f377EF6F97d87C49661b36Ed02bB") saves the IPFS 
    # link of the encrypted message on the blockchain using his private key ("0x4f81120a31e3acb68d87b242dd0076247e83d08d85cc97b1b8c395ffda9bc43d"),
    # it should be done through front-end MetaMask interaction after the "else" statement
    if TESTING:
        with open(compiled_contract_path) as file:
            contract_json = json.load(file)
            contract_abi = contract_json['abi']
        contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
        tx = {
            'nonce': get_nonce("0xa5B6B3729Cf8f377EF6F97d87C49661b36Ed02bB"),
            'gasPrice': web3.eth.gas_price,
            'from': "0xa5B6B3729Cf8f377EF6F97d87C49661b36Ed02bB",
            'gas': 3000000
        }
        message_bytes = hash_file.encode('ascii')
        base64_bytes = base64.b64encode(message_bytes)
        message = contract.functions.setIPFSLink(int(message_id), base64_bytes[:32], base64_bytes[32:]).buildTransaction(tx)
        signed_transaction = web3.eth.account.sign_transaction(message, "0x4f81120a31e3acb68d87b242dd0076247e83d08d85cc97b1b8c395ffda9bc43d")
        transaction_hash = __send_txt__(signed_transaction.rawTransaction)
        tx_receipt = web3.eth.wait_for_transaction_receipt(transaction_hash, timeout=50000)
    else:
        message_bytes = hash_file.encode('ascii')
        base64_bytes = base64.b64encode(message_bytes)
    return {'method': 'setIPFSLink', 'data': [str(base64_bytes[:32]), str(base64_bytes[32:])]}


def retrieve_MessageIPFSLink(message_id):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message = contract.functions.getIPFSLink(int(message_id)).call()
    sender = message[0]
    message_bytes = base64.b64decode(message[1])
    ipfs_link = message_bytes.decode('ascii')
    return ipfs_link, sender


def send_users_attributes(attribute_certifier_address, private_key, process_instance_id, hash_file):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message_bytes = hash_file.encode('ascii')
    base64_bytes = base64.b64encode(message_bytes)
    start = time.time()
    tx = {
        'nonce': get_nonce(attribute_certifier_address),
        'gasPrice': web3.eth.gas_price,
        'from': attribute_certifier_address,
        'gas': 3000000
    }
    message = contract.functions.setUserAttributes(int(process_instance_id), base64_bytes[:32],
                                                   base64_bytes[32:]).buildTransaction(tx)
    signed_transaction = web3.eth.account.sign_transaction(message, private_key)
    transaction_hash = __send_txt__(signed_transaction.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(transaction_hash, timeout=50000)
    end = time.time()
    removing_Timing = (end - start) * 10 ** 3
    with open('removing_time.txt', 'w') as f:
        f.write(str(removing_Timing))


def retrieve_users_attributes(process_instance_id):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message = contract.functions.getUserAttributes(int(process_instance_id)).call()
    message_bytes = base64.b64decode(message)
    message = message_bytes.decode('ascii')
    return message


# It saves on the blockchain the RSA public key (IPFS link) of an actor! 
def send_publicKey_readers(hash_file, reader_address):

    message_bytes = hash_file.encode('ascii')
    base64_bytes = base64.b64encode(message_bytes)
    
    # This "if" should be deleted. It should be done later through MetaMask thanks to the return values front-end interaction! Now I simulate only the 
    # MANUFACTURER ("0x7364cc4E7F136a16a7c38DE7205B7A5b18f17258") blockchain interaction!
    if TESTING and reader_address == "0x7364cc4E7F136a16a7c38DE7205B7A5b18f17258":
        with open(compiled_contract_path) as file:
            contract_json = json.load(file)
            contract_abi = contract_json['abi']
        contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
        tx = {
            'nonce': get_nonce(reader_address),
            'gasPrice': web3.eth.gas_price,
            'from': reader_address,
            'gas': 3000000
        }
        message = contract.functions.setPublicKeyReaders(base64_bytes[:32], base64_bytes[32:]).buildTransaction(tx)
        # Here I sign with the MANUFACTURER private key!
        signed_transaction = web3.eth.account.sign_transaction(message, "7bef7c14014234a250ea896c28e9419e3197684e5f995e64546c03928c54d204")
        transaction_hash = __send_txt__(signed_transaction.rawTransaction)
        tx_receipt = web3.eth.wait_for_transaction_receipt(transaction_hash, timeout=50000)

    return {'method':'setPublicKeyReaders', 'data':[str(base64_bytes[:32]), str(base64_bytes[32:])]}


def retrieve_publicKey_readers(reader_address):
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    message = contract.functions.getPublicKeyReaders(reader_address).call()
    message_bytes = base64.b64decode(message)
    message1 = message_bytes.decode('ascii')
    return message1
    

# This function should be performed through MetaMask, for testing purposes now is set to "MANUFACTURER"
# ("0x7364cc4E7F136a16a7c38DE7205B7A5b18f17258") with private key
# "0x2e78ccaac0156ec23652b710c05e3076de558a12addbeb6949817b93c557e857"
def send_key_request(actor_address, process_id, list_auth):
    #if TESTING:
        with open(compiled_contract_path) as file:
            contract_json = json.load(file)
            contract_abi = contract_json['abi']
        contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
        
         # Get the nonce
        nonce = web3.eth.getTransactionCount(actor_address)
        
        # Prepare the transaction to call notifyAuthorities
        tx = contract.functions.notifyAuthorities(process_id, list_auth).buildTransaction({
            'chainId': 1337,  # Chain ID for Ganache
            'gasPrice': web3.eth.gasPrice,
            'nonce': nonce,
            'gas': 3000000
        })
        
        # Sign the transaction with the MANUFACTURER's private key
        signed_tx = web3.eth.account.sign_transaction(tx, "0x7bef7c14014234a250ea896c28e9419e3197684e5f995e64546c03928c54d204")
        
        # Send the transaction
        tx_hash = web3.eth.sendRawTransaction(signed_tx.rawTransaction)

        # Wait for the transaction receipt
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=600)

        # Get the block number of the transaction
        block = web3.eth.blockNumber #+ 1
        # It should return the block number so the actor know from which block he should wait for keys from the authorities
        return block