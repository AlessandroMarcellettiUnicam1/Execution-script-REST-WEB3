All the tests were executed in Windows 11 with WSL2 (for Ubuntu!).

Default startup:
	1. Start Ganache
	2. Start MongoDBCompass and connect
	3. Start IntelliJ IDEA server
	4. Login to the Website (the cached value ID should be right)
	5. ("ipconfig" and get the IPv4 address, change the "DEFAULT" values in "sh default.sh")
	5. In Ubuntu:
		5.1
			Below in "docker run", change the "/mnt" path with your CONFETTY path folder.
			Start the API:
				sudo chmod 666 /var/run/docker.sock && \
				docker ps -aq | xargs docker rm -f && \
				docker run -it --name martsia_ethereum_container --network host -v 											/mnt/c/Users/X/Desktop/CONFETTY-main/Confidentiality\ Manager:/MARTSIA-KoB-API 006be17f8d0c \
				bash -c "python3 -m pip install flask && \
				python3 -m pip install Flask_cors && \
				cd /MARTSIA-KoB-API/sh_files && \
				sh default.sh && \
				cd ../src && \
				python3 api.py; exec bash"
		5.2
			IPFS:
				docker exec -it martsia_ethereum_container bash -c "cd /MARTSIA-KoB-API/sh_files && sh db_and_IPFS.sh; exec bash"
			Smart contract deployment:
				docker exec -it martsia_ethereum_container bash -c "cd /MARTSIA-KoB-API/sh_files && sh deployment.sh; exec bash"
		

Normal Docker connection:
docker exec -it martsia_ethereum_container bash

Reset:
	1. Connect and drop all the databases in MongoDBCompass
	2. Start the server
	3. Register and login to the Website, copy the cached value from inspect element to "userID" in \Evaluation Tool\generateJSONs.js
	4. Start Ganache with:
		- Seed (ACCOUNTS & KEYS): "control pulse code indoor off imitate uncover lesson fragile isolate fault blast";
		- Hostname (SERVER): "0.0.0.0";
		- Total accounts to generate (ACCOUNT & KEYS): "20";
		- Gas limit (CHAIN): "35700000".
		The first address is the "default" and Attribute Certifier. The second, third, forth and fifth are the Authorities!
	5. ("ipconfig" and get the IPv4 address, change the "DEFAULT" values in "sh default.sh").
	6. Start the API (above) and IPFS (above)
	7. Run Smart contract deployment (above)
	8. Execucute generateJSONs.js and the main.js one time (there will be errors, it's okay). Following that, terminate the API with CTRL+C. Now, reload the databases in MongoDBCompass (View -> Reload data), copy the database model _id (ChorChain -> Model) into the "modelID" in generateJSONs.js
	9. Execute again the API with "python3 api.py". Run generateJSONs.js and the main.js. All bueno!

Python tests (tested in PowerShell):
	1. If you have the API opened, close it (CTRL+C).
	2. Inside \CONFETTY run:
		2.1 "python auto.py -t1"
		2.2 "python auto.py -t2"
		2.3 "python auto.py -t3"
	Following the execution of the scripts, PowerShell crashes:D
