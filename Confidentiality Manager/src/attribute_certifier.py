import json
import block_int
from decouple import config
import io
import sqlite3
import ipfshttpclient
import time
from env_manager import authorities_names, authorities_names_and_addresses


# The Attribute Certifier saves on the blockchain the IPFS link containing the actors' attributes
def generate_attributes(roles, process_instance_id):
    api = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
    authorities_names_value = authorities_names()
    dict_users = {}
    for actor, list_roles in roles.items():
            dict_users[actor] = [str(process_instance_id)+'@'+ name for name in authorities_names_value] + [role for role in list_roles]
    
    f = io.StringIO()
    dict_users_dumped = json.dumps(dict_users)
    #print("Roles:", dict_users_dumped)
    
    f.write('"process_instance_id": ' + str(process_instance_id) + '####')
    f.write(dict_users_dumped)
    f.seek(0)
    file_to_str = f.read()
    
    hash_file = api.add_json(file_to_str)

    # Connection to SQLite3 attribute_certifier database
    conn = sqlite3.connect('../databases/attribute_certifier/attribute_certifier.db')
    x = conn.cursor()
    x.execute("INSERT OR IGNORE INTO user_attributes VALUES (?,?,?)",
              (str(process_instance_id), hash_file, file_to_str))
    conn.commit()
    
    attribute_certifier_address = config('CERTIFIER_ADDRESS')
    private_key = config('CERTIFIER_PRIVATEKEY')
    start = time.time()
    block_int.send_users_attributes(attribute_certifier_address, private_key, process_instance_id, hash_file)
    end = time.time()
    total = (end - start) * 10 ** 3
    #print("----sottrarre attributes:", int(total))


def generate_policies(policies, process_instance_id):
    api = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')

    access_policy = {}
    for policy in policies:
        temporal = ""
        for authority_name, authority_address in authorities_names_and_addresses():
            temporal = temporal + str(process_instance_id) + '@' + authority_name + ' and '
        access_policy[policy] = ('(' + temporal[:-5] + ') and (' + policies[policy] + ')')

    f = io.StringIO()
    dict_policies_dumped = json.dumps(access_policy)
    #print("Policies:", dict_policies_dumped)

    f.write('"process_instance_id": ' + str(process_instance_id) + '####')
    f.write(dict_policies_dumped)
    f.seek(0)
    file_to_str = f.read()

    hash_file = api.add_json(file_to_str)

    return hash_file
