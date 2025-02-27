## Test Execution Instructions

All the tests were executed in **Windows 11 with WSL2** (for Ubuntu!).

### Default Startup

1. **Start Ganache**
2. **Start MongoDBCompass** and connect.
3. **Start IntelliJ IDEA server.**
4. **Login to the Website** (ensure the cached value ID is correct).
5. (Run `ipconfig` to get the IPv4 address, and change the "DEFAULT" values in the `sh default.sh` file.)
6. **In Ubuntu:**
   1. **Start the API:**
      - In the `docker run` command below, update the `/mnt` path with your CONFETTY folder path.
      - Run the following command:
        ```bash
        sudo chmod 666 /var/run/docker.sock && \
        docker ps -aq | xargs docker rm -f && \
        docker run -it --name martsia_ethereum_container --network host -v /mnt/c/Users/X/Desktop/CONFETTY-main/Confidentiality\ Manager:/MARTSIA-KoB-API 006be17f8d0c \
        bash -c "python3 -m pip install flask && \
        python3 -m pip install Flask_cors && \
        cd /MARTSIA-KoB-API/sh_files && \
        sh default.sh && \
        cd ../src && \
        python3 api.py; exec bash"
        ```
   2. **Start IPFS and Deploy Smart Contracts:**
      - **IPFS:**
        ```bash
        docker exec -it martsia_ethereum_container bash -c "cd /MARTSIA-KoB-API/sh_files && sh db_and_IPFS.sh; exec bash"
        ```
      - **Smart Contract Deployment:**
        ```bash
        docker exec -it martsia_ethereum_container bash -c "cd /MARTSIA-KoB-API/sh_files && sh deployment.sh; exec bash"
        ```

### Normal Docker Connection

To open an interactive session in the running Docker container, run:

```bash
docker exec -it martsia_ethereum_container bash
```

### Reset Instructions

1. **Drop all the databases** in MongoDBCompass.
2. **Start the server.**
3. **Register and login** to the Website, then copy the cached value from inspect element into `global.userID` in `\Evaluation Tool\generateJSONs.js`.
4. **Start Ganache** with the following settings:
   - **Seed (ACCOUNTS & KEYS):**  
     `"control pulse code indoor off imitate uncover lesson fragile isolate fault blast"`
   - **Hostname (SERVER):**  
     `"0.0.0.0"`
   - **Total accounts to generate (ACCOUNT & KEYS):**  
     `"20"`
   - **Gas limit (CHAIN):**  
     `"35700000"`

   > **Note:**  
   > The first address is the default and Attribute Certifier.  
   > The second, third, fourth, and fifth addresses are the Authorities.
   
5. (Run `ipconfig` to get the IPv4 address and update the "DEFAULT" values in `sh default.sh`.)
6. **Start the API** (as described above) and **IPFS** (as described above).
7. **Run Smart Contract Deployment** (as described above).
8. **Execute `generateJSONs.js` and `main.js`** once (errors may occur; this is expected).  
   Then, terminate the API with `CTRL+c`.  
   Reload the databases in MongoDBCompass (via **View → Reload data**) and copy the database model `_id` (from **ChorChain → Model**) into `const modelID` in `\Evaluation Tool\generateJSONs.js`.
9. **Restart the API** with:
   ```bash
   python3 api.py
   ```
   Then, run `\Evaluation Tool\generateJSONs.js` and `\Evaluation Tool\main.js`. Everything should be working as expected!

### Python Tests (Tested in PowerShell)
> **Note:** These scripts should be executed after the Reset Instructions!
1. **Ensure the API is closed** (if it's running, terminate with `CTRL+c`).
2. **Inside the `\CONFETTY` directory, execute the following commands:**
   1. `python auto.py -t1`
   2. `python auto.py -t2`
   3. `python auto.py -t3`
   4. `python auto.py -t4`
   5. `python auto.py -t5`
   6. `python auto.py -t6`
   7. `python auto.py -t7`

> **Note:** After running these scripts, PowerShell might crash. This is a known issue.
