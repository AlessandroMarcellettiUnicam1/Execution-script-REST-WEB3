import rsa  
import ipfshttpclient
import block_int
import sqlite3
import io

# It generates the RSA keys of an actor!
def generate_keys(reader_address):
    conn = sqlite3.connect('../databases/reader/reader.db', timeout=10.0)
    x = conn.cursor()
    x.execute("SELECT * FROM rsa_private_key WHERE reader_address=?", (reader_address,))
    result = x.fetchall()
    if not result:
        (publicKey, privateKey) = rsa.newkeys(1024)
        publicKey_store = publicKey.save_pkcs1().decode('utf-8')
        privateKey_store = privateKey.save_pkcs1().decode('utf-8')
        f = io.StringIO()
        f.write('reader_address: ' + reader_address + '###' + publicKey_store)
        f.seek(0)
        api = ipfshttpclient.connect('/ip4/127.0.0.1/tcp/5001')
        hash_file = api.add_json(f.read())
        conn = sqlite3.connect('..//databases//reader//reader.db', timeout=10.0)
        x = conn.cursor()
        x.execute("INSERT OR IGNORE INTO rsa_private_key VALUES (?,?)", (reader_address, privateKey_store))
        conn.commit()
        x.execute("INSERT OR IGNORE INTO rsa_public_key VALUES (?,?,?)", (reader_address, hash_file, publicKey_store))
        conn.commit()
        return block_int.send_publicKey_readers(hash_file, reader_address)
    else:
        #print(f"Key already present for reader {reader_address}")
        return {"keyPresent": True}