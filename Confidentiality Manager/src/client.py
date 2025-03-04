import sqlite3
from env_manager import authorities_addresses_and_names_separated


def client_main(process_id, actor_address):
    # Connection to SQLite3 reader database
    conn = sqlite3.connect('../databases/reader/reader.db', timeout=10.0)
    x = conn.cursor()
    authorities_addresses, authorities_names = authorities_addresses_and_names_separated()
    list_auth = []
    for authority_address in authorities_addresses:
        x.execute("SELECT * FROM authorities_generated_decription_keys WHERE process_instance=? AND authority_address=? AND reader_address=?",
                  (str(process_id), authority_address, actor_address))
        result = x.fetchall()
        if not result:
            list_auth.append(authority_address)
        #else:
        #    print(f"Key already present for authority {authorities_names[authorities_addresses.index(authority_address)]}!")
    return list_auth
    '''
    if list_auth:
        earliest_block = block_int.send_key_request(actor_address, int(process_id), list_auth)
        print(f"Key request sent to the authorities!")
        list_auth_str = json.dumps(list_auth)
        os.system(f"python3 ../src/client2.py -r {actor_address} -a '{list_auth_str}' -e {earliest_block}")
    '''
