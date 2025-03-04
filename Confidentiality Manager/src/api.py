from flask import Flask, request, jsonify
from decouple import config
from hashlib import sha512
from flask_cors import CORS, cross_origin
import json
import base64
import block_int
from env_manager import authorities_count
import reader_public_key
import attribute_certifier
import data_owner
import client
import reader

import os
import subprocess
import signal
import atexit
import sys

import re


# Used to reset the local databases
os.system(f"sh ../sh_files/reset_db.sh")

app = Flask(__name__)
CORS(app)

#Retrieve the number of authorities from the ".env" file
numberOfAuthorities  = authorities_count()

# Store the subprocesses globally to access them in the signal handler
processes = []

def handle_exit(signum=None, frame=None):
    for p in processes:
        try:
            # Kill the entire process group for each subprocess
            os.killpg(os.getpgid(p.pid), signal.SIGTERM)
        except Exception as e:
            pass
    sys.exit(0)

# Register the cleanup function for normal exit and signals
atexit.register(handle_exit)
signal.signal(signal.SIGINT, handle_exit)  # Handle Ctrl+C
signal.signal(signal.SIGTERM, handle_exit)


# Check if a string is a valid ERC20 address
def is_valid_erc20_address(address):
    # Check if the address is a string
    if not isinstance(address, str):
        return True
    # Check length (42 characters: 2 for '0x' and 40 for the address)
    if len(address) != 42:
        return True
    # Check if it starts with '0x'
    if not address.startswith('0x'):
        return True
    # Check if the remaining 40 characters are hexadecimal
    if not re.match(r'^0x[a-fA-F0-9]{40}$', address):
        return True
    return False


def is_valid_erc20_address_list(address_list):
    """Check if the provided list is a valid list of ERC20 addresses."""
    if not isinstance(address_list, list):  # Ensure it's a list
        return True
    # Check each address in the list
    for address in address_list:
        if is_valid_erc20_address(address):
            return True
    return False


# Check if the process_id is valid
def is_process_id_valid(process_id):
    # Define the maximum value (2^64)
    max_value = 2**64
    # Check if the number is in the range 1 to 2^64
    if 1 <= int(process_id) <= max_value:
        return False
    else:
        return True

# Check if the message_id is valid
def is_message_id_valid(message_id):
    # Define the maximum value (2^64)
    max_value = 2**64
    # Check if the number is in the range 1 to 2^64
    if 1 <= int(message_id) <= max_value:
        return False
    else:
        return True


def block_number_check(value):
    return not (int(value) > 0)


@app.route('/certification/generate_rsa_key_pair/', methods=['POST'], strict_slashes=False)
def generate_rsa_key_pair():
    """ Generate the public and private RSA keys for an actor

    This function is used to generate the public and private keys RSA for an actor
    that is involved in a process
    
    Args:
        actor: actor address involved in the process

    Returns:
        The status of the request, 200 if the keys are generated correctly
    
    Example:
        An execution test is saved in /src/test/test1.py
        
    """

    actor = request.json.get('actor')
    
    if is_valid_erc20_address(actor):
        return f"Missing or wrong parameter 'actor'!", 400

    transaction_data = reader_public_key.generate_keys(actor)
    return transaction_data,  200
    

@app.route('/certification/attributes_certification_and_authorities/', methods=['POST'], strict_slashes=False)
def attributes_certification_and_authorities():
    """ Certificate the actors and start the authorities

    This function is used to certificate the actors
    that are involved in a given process id and to initialize and
    put on hold the authorities to answer for decryption keys
    
    Args:
        process_id: an integer from 1 to 2**64 to identify the process
        roles: a dictionary that contains for each actor address the list of roles associated
        
    Returns:
        200 if the certification is completed and the authorities are ready
        
    Example:
        An execution test is saved in /src/test/test2.py
    temporal = ""
    for authority_name, authority_address in authorities_names_and_addresses():
        temporal = temporal + str(process_instance_id) + '@' + authority_name + ' and '
    access_policy[file_name] = ('(' + temporal[:-5] + ') and ' + policy)
    """
    process_id = request.json.get('process_id')
    roles = request.json.get('roles')
    policies = request.json.get('policy')
    
    if is_process_id_valid(process_id):
        return f"Wrong parameter 'process_id'!", 400
    if roles is None or roles == "":
        return f"Wrong parameter 'roles'!", 400
    if policies is None or policies == "":
        return f"Wrong parameter 'policies'!", 400
    attribute_certifier.generate_attributes(roles, process_id)
    policies_hash_file = attribute_certifier.generate_policies(policies, process_id)
    message_bytes = policies_hash_file.encode('ascii')
    base64_bytes = base64.b64encode(message_bytes)
    response_data = {
        'hash1': base64_bytes[:32].decode('utf-8'),
        'hash2': base64_bytes[32:].decode('utf-8')
    }
    ## file hash da restituire a così ChorChain fa le sue cose
    # Initialization of the authorities through a subprocess in the same console of the API
    authority_processes = []
    for i in range(1, numberOfAuthorities + 1):
        cmd = f"python3 authority.py -p {process_id} -a {i}"
        # Use exec to replace the shell so that only the Python process remains
        p = subprocess.Popen(
            ["bash", "-c", "exec " + cmd],
            preexec_fn=os.setsid  # Start a new process group
        )
        authority_processes.append(p)
        processes.append(p)  # Track for cleanup
    # Wait for all authority processes to finish
    for p in authority_processes:
        p.wait()
    # Launch server_authority.py processes
    for i in range(1, numberOfAuthorities + 1):
        cmd = f"python3 server_authority.py -a {i}"
        p = subprocess.Popen(
            ["bash", "-c", "exec " + cmd],
            preexec_fn=os.setsid
        )
        processes.append(p)  # Track these as well for cleanup if needed
    #total_without_bc = total - blockchainTime
    return jsonify(response_data), 200


@app.route('/encrypt/', methods=['POST'], strict_slashes=False)
def encrypt():
    """ This function is used to encrypt a message, setting the policy
    of the decryption

    Args:
        actor: the actor address who is performing the encryption
        message: the message to encrypt (base64 format)
        message_id: integer from 1 to 2**64 to identify the message_id
        policy: dictionary name of the message with its policy
        process_id: integer from 1 to 2**64 to identify the process
        
    Returns:
        The status of the request, 200 if the encryption is completed
        
    Example:
        An execution test is saved in /src/test/test3.py
        
    """
    actor = request.json.get('actor')
    message = request.json.get('message')
    message_id = request.json.get('message_id')
    process_id = request.json.get('process_id')
    
    if is_valid_erc20_address(actor):
        return f"Wrong parameter 'actor'!", 400
    if message == None or message == "":
        return f"Wrong parameter 'message'!", 400
    if is_message_id_valid(message_id):
        return f"Wrong parameter 'message_id'!", 400
    if is_process_id_valid(process_id):
        return f"Wrong parameter 'process_id'!", 400
    if block_int.get_current_state == False:
        return f"Public state is not active!", 400

    # Encrypt the message
    message_id, transaction_data = data_owner.encrypt_data(actor, message, message_id, process_id)
    data = transaction_data
    data['message_id'] = message_id
    return jsonify(data), 200
    

@app.route('/decrypt_check/', methods=['POST'], strict_slashes=False)
def decrypt_check():
    """ This function is used to check if an actor has the decryption
        keys from the authorities
    
    Args:
        actor: the actor address who is performing the decryption
        message_id: the id of the message that the actor wants to decrypt
        process_id: integer from 1 to 2**64 to identify the process
    
    Returns:
        The status of the request, 200 and 202 if the request is completed.
        The output for 202 is a json with: "authorities_list" that contains
        the authorities addresses from which the user needs to receive
        the decryption keys and the "process_id". If the user has all
        the keys from the authorities the API returns directly the
        encrypted data with status 202
    
    Example:
        An execution test is saved in /src/test/test4.py
        
    """
    actor = request.json.get('actor')
    message_id = request.json.get('message_id')
    process_id = request.json.get('process_id')
    
    if is_valid_erc20_address(actor):
        return f"Wrong parameter 'actor'!", 400
    if is_message_id_valid(message_id):
        return f"Wrong parameter 'message_id'!", 400
    if is_process_id_valid(process_id):
        return f"Wrong parameter 'process_id'!", 400
    
    authorities_list = client.client_main(process_id, actor)
    response_data = {
        'authorities_list': authorities_list,
        'process_id': process_id
    }
    if authorities_list == []:
        base64_output = reader.start(process_id, message_id, None, actor)
        #print(base64_output)
        return base64_output, 202
    return jsonify(response_data), 200


@app.route('/decrypt_wait/', methods=['POST'], strict_slashes=False)
def decrypt_wait():
    """ This function is used by a user to wait for decryption keys
        from the authorities and decrypt the data
    
    Args:
        actor: the actor address who is performing the decryption
        list_auth: the addresses of the authorities for which the 
        user must wait for decryption keys
        message_id: the id of the message that the actor wants to decrypt
        process_id: integer from 1 to 2**64 to identify the process
        starting_block: integer indicating the block number of the call
        executed by the user to the smart contract after the decrypt_check
        output
    
    Returns:
        The status of the request, 200 if the decryption is completed.
        The output is in base64 format
    
    Example:
        An execution test is saved in /src/test/test5.py
        
    """
    actor = request.json.get('actor')
    list_auth = request.json.get('list_auth')
    message_id = request.json.get('message_id')
    process_id = request.json.get('process_id')
    starting_block = request.json.get('starting_block')
    
    if is_valid_erc20_address(actor):
        return f"Wrong parameter 'actor'!", 400
    if is_valid_erc20_address_list(list_auth):
        return f"Wrong parameter 'list_auth'!", 400
    if is_message_id_valid(message_id):
        return f"Wrong parameter 'message_id'!", 400
    if is_process_id_valid(process_id):
        return f"Wrong parameter 'process_id'!", 400
    if block_number_check(starting_block):
        return f"Wrong parameter 'starting_block'!", 400

    list_auth_str = json.dumps(list_auth)
    os.system(f"python3 client2.py -r {actor} -a '{list_auth_str}' -e {starting_block}")
    base64_output = reader.start(process_id, message_id, None, actor)
    #print("-----decrypted from wait:", base64_output)
    return base64_output, 200


if __name__ == '__main__':
    app.run(host="0.0.0.0", port="8888")
