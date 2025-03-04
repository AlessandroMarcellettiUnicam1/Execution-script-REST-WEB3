import time
import argparse
from decouple import config
import authority_key_generation
import rsa
import block_int
from web3 import Web3
import ipfshttpclient
import io
import json
import base64
from web3.exceptions import BlockNotFound


def send_ipfs_link(web3, reader_address, process_instance_id, hash_file):
    nonce = web3.eth.getTransactionCount(authority_address)
    tx = {
        'chainId': 1337,  # Chain ID for Ganache
        'nonce': nonce,
        'to': reader_address,
        'value': 0,
        'gas': 40000,
        'gasPrice': web3.eth.gasPrice,
        'data': web3.toHex(hash_file.encode() + b',' + str(process_instance_id).encode())
    }
    signed_tx = web3.eth.account.sign_transaction(tx, authority_private_key)
    tx_hash = web3.eth.sendRawTransaction(signed_tx.rawTransaction)
    #print(f'tx_hash: {web3.toHex(tx_hash)}  Authority {authority_number}')
    tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=600)


def generate_key(process_instance_id, reader_address):
    key = authority_key_generation.generate_user_key(authority_number, reader_address, process_instance_id, reader_address)
    cipher_generated_key(reader_address, process_instance_id, key)


def cipher_generated_key(reader_address, process_instance_id, generated_ma_key):
    # Connect to IPFS
    api = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
    public_key_ipfs_link = block_int.retrieve_publicKey_readers(reader_address)
    getfile = api.cat(public_key_ipfs_link)
    getfile = getfile.split(b'###')
    if getfile[0].split(b': ')[1].decode('utf-8') == reader_address:
        publicKey_usable = rsa.PublicKey.load_pkcs1(getfile[1].rstrip(b'"').replace(b'\\n', b'\n'))

        info = [generated_ma_key[i:i + 117] for i in range(0, len(generated_ma_key), 117)]
        #print(info)
        f = io.BytesIO()
        for part in info:
            crypto = rsa.encrypt(part, publicKey_usable)
            f.write(crypto)
        f.seek(0)

        file_to_str = f.read()
        j = base64.b64encode(file_to_str).decode('ascii')
        s = json.dumps(j)
        hash_file = api.add_json(s)
        start = time.time()
        send_ipfs_link(web3, reader_address, process_instance_id, hash_file)
        end = time.time()
        with open('removing_time_Auth'+ str(authority_number) +'.txt', 'w') as f:
            f.write(str(start*1000) + " " + str(end*1000) + "\n")


def check_block_exists(web3, block_number):
    try:
        block = web3.eth.getBlock(block_number, full_transactions=False)
        if block is None:
            return False
        return True
    except BlockNotFound:
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False
        

def transactions_monitoring(web3):
    compiled_contract_path = '../blockchain/build/contracts/ConfidentialContract.json'
    deployed_contract_address = config('CONTRACT_ADDRESS_MARTSIA')
    with open(compiled_contract_path) as file:
        contract_json = json.load(file)
        contract_abi = contract_json['abi']
    contract = web3.eth.contract(address=deployed_contract_address, abi=contract_abi)
    # Get the latest block number

    latest_block = web3.eth.blockNumber + 1
    event_filter = contract.events.AuthoritiesNotified.createFilter(
        fromBlock='latest'
    )
    first = False
    while True:
        if not check_block_exists(web3, latest_block):
            if not first:
                #print(f"Waiting for new blocks: Retrying every 1 second... Authority {authority_number}")
                first = True
            # Wait for 1 second before retrying
            #print("----levare 5:", 5)
            time.sleep(0.1)
        else:
            #print("sono qui")
            # Get new events
            events = event_filter.get_new_entries()
            #print("eventi riga 105:", events)

            for event in events:
                #print("ecco evento riga 103:", event)
                authorities_list = event['args']['authorities']
                # Check if the authority's address is in the list
                if authority_address in authorities_list:
                    #print("ecco if riga 106:", authority_address)
                    process_id = event['args']['process_id']
                    sender = event['args']['user']
                    generate_key(process_id, sender)
            # Update the block range for the next iteration
            latest_block = latest_block + 1
            #event_filter = contract.events.AuthoritiesNotified.createFilter(
            #    fromBlock=latest_block
            #)
            #print("creato secondo filtro su blocco:",latest_block)
            first = False


if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Run authority script for specified authority number.')
    parser.add_argument('-a', '--authority', type=int, required=True, help='Authority number')
    args = parser.parse_args()
    # Get authority configuration
    authority_number = args.authority
    authority_address = config(f'AUTHORITY{authority_number}_ADDRESS')
    authority_private_key = config(f'AUTHORITY{authority_number}_PRIVATEKEY')
    # Configure web3 provider for Ganache
    ganache_url = "http://172.31.80.1:7545"


    web3 = Web3(Web3.HTTPProvider(ganache_url,request_kwargs={'timeout': 600}))
    transactions_monitoring(web3)
