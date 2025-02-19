const fs = require('fs');
const { hdkey } = require('ethereumjs-wallet');
const bip39 = require('bip39');
const Web3 = require('web3');


// Function to create or clear the file, initializing it as a JSON array
function createOrClearJson(filePath) {
    const initialContent = '[]'; // Represents an empty JSON array
    fs.writeFileSync(filePath, initialContent, 'utf-8'); // Clear and write '[]' to the file
}


// Function to append a new JSON object to a file
function appendToFile(filePath, content) {
    // First, read the current content of the file
    const fileData = fs.readFileSync(filePath, 'utf-8');
    let jsonArray = JSON.parse(fileData); // Parse the current content as an array
    // Append the new content to the array
    jsonArray.push(JSON.parse(content));
    // Write the updated array back to the file
    fs.writeFileSync(filePath, JSON.stringify(jsonArray, null, 2), 'utf-8');
    console.log("Appended content to " + filePath);
}


// Function to generate the saveModel JSON object
function saveModelGeneration(endpoint_spec) {
    const jsonObject = {
        method: "POST",
        endpoint: "http://localhost:8081/ChorChain/rest/saveModel/" + endpoint_spec + "/" + userID,
        data: "XML_CONTENT_PLACEHOLDER",
        name: "saveModel"
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the createInstance JSON object
function createInstanceGeneration(modelID, optional, mandatory, visibleAt) {
    const jsonObject = {
        method: "POST",
        endpoint: "http://localhost:8081/ChorChain/rest/createInstance/" + userID,
        data: {
            modelID: modelID,
            optional: optional,
            mandatory: mandatory,
            visibleAt: visibleAt
        },
        name: "createInstance"
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the ERC20 address and private key for each user
function userInfoGeneration(mandatory, optional) {
    const users = [];
    // Generate seed from the mnemonic
    const mnemonic = "control pulse code indoor off imitate uncover lesson fragile isolate fault blast";
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    // Generate the HD wallet from the seed
    const hdWallet = hdkey.fromMasterSeed(seed);
    // Function to generate an address and private key for each name
    function generateWalletForUser(role, index) {
        // +5 because index 0, 1, 2, 3, 4 are the Attribute Certifier and the Authorities!
        const derivationPath = `m/44'/60'/0'/0/${index+5}`; // Derivation path for Ethereum
        const wallet = hdWallet.derivePath(derivationPath).getWallet();
        return {
            role: role,
            // toChecksumAddress to have correct uppercases in ERC20 addresses
            address: Web3.utils.toChecksumAddress(wallet.getAddressString()),
            privateKey: wallet.getPrivateKeyString()
        };
    }
    // Combine mandatory and optional users
    const allUsers = [...mandatory, ...optional.filter(name => name !== "null")];
    // Generate the user info for each name
    allUsers.forEach((role, index) => {
        const userInfo = generateWalletForUser(role, index);
        users.push(userInfo);
    });
    // Save the user data to a JSON file
    fs.writeFileSync('data/users_info.json', JSON.stringify(users, null, 2), 'utf8');
}


// Function to generate the KeyPairGeneration JSON object
function generateKeyPairGeneration(role) {
    // Load the existing users_info.json file
    const usersInfo = JSON.parse(fs.readFileSync('data/users_info.json', 'utf8'));
    // Find the user in the users_info based on the userInput name
    const user = usersInfo.find(user => user.role === role);
    const jsonObject = {
        method: "POST",
        endpoint: "http://172.31.83.251:8888/certification/generate_rsa_key_pair",
        data: {
            actor: user.address
        },
        name: "generateKeyPair_" + role
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the PublicKeyReaders JSON object
function publicKeyReadersGeneration(role) {
    const jsonObject = {
        contractInfo: "confidentialContract",
        functionName: "setPublicKeyReaders",
        params: {
            ipfs_link_1: 0,
            ipfs_link_2: 0
        },
        role: role,
        name: "publicKeyReaders_" + role
    };
    appendToFile('data/blockchain_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the subscribe JSON object
function subscribeGeneration(role) {
    const jsonObject = {
        method: "POST",
        endpoint: "http://localhost:8081/ChorChain/rest/subscribe/" + role + "/" + userID + "/{instanceId}",
        name: "subscribe_" + role
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to perform the three subscription phases for a single user
function subscriptionsGeneration(role) {
    generateKeyPairGeneration(role);
    publicKeyReadersGeneration(role);
    subscribeGeneration(role);
}


// Function to perform the three subscription phases for every user
function allSubscriptionsGeneration(mandatory, optional) {
    const allUsers = [...mandatory, ...optional.filter(name => name !== "null")];
    allUsers.forEach(role => {
        subscriptionsGeneration(role);
    })
}


// Function to generate the Translation1 JSON object
function translation1Generation() {
    const jsonObject = {
        method: "POST",
        endpoint: "http://localhost:8081/ChorChain/rest/deploy/" + userID + "/{instanceId}",
        name: "translation1"
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the Translation2 JSON object
function translation2Generation() {
    const jsonObject = {
        method: "POST",
        endpoint: "http://localhost:8081/ChorChain/rest/generateMartsiaInstance/" + userID + "/{instanceId}",
        name: "translation2"
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate Translation1 and Translation2 JSON objects
function translationsGeneration() {
    translation1Generation();
    translation2Generation();
}


// Function to generate the attributesCertification JSON object
function attributesCertificationGeneration(roles, policy) {
    const jsonObject = {
        method: "POST",
        endpoint: "http://172.31.83.251:8888/certification/attributes_certification_and_authorities",
        data: {
            roles: roles,
            process_id: 0,
            policy: policy
        },
        name: "attributesCertification"
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the instantiateProcess JSON object
function instantiateProcessGeneration(roles, users, elements, nextElements, previousElements, types) {
    const jsonObject = {
        contractInfo: "stateContract",
        functionName: "instantiateProcess",
        params: {
            process_id: 0,
            roles: roles,
            users: users,
            elements: elements,
            nextElements: nextElements,
            PreviousElements: previousElements,
            types: types,
            hashLink1: 0,
            hashLink2: 0
        },
        role: "default",
        name: "instantiateProcess"
    };
    appendToFile('data/blockchain_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the setInstanceConditions JSON object
function setInstanceConditionsGeneration(elementWithConditions, elementWithPublicVar, publicVariables, operators, values) {
    const jsonObject = {
        contractInfo: "stateContract",
        functionName: "createConditions",
        params: {
            process_id: 0,
            elementWithConditions: elementWithConditions,
            elementWithPublicVar: elementWithPublicVar,
            publicVariables: publicVariables,
            operators: operators,
            values: values
        },
        role: "default",
        name: "setInstanceConditions"
    };
    appendToFile('data/blockchain_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the encrypt_message JSON object
function encrypt_messageGeneration(actor, message, message_id, name) {
    const jsonObject = {
        method: "POST",
        endpoint: "http://172.31.83.251:8888/encrypt/",
        data: {
            actor: actor,
            process_id: 0,
            message: message,
            message_id: message_id
        },
        name: "encrypt_message_" + name
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the execute_message JSON object
function execute_messageGeneration(message_id, role, name) {
    const jsonObject = {
        contractInfo: "confidentialContract",
        functionName: "setIPFSLink",
        params: {
            process_id: 0,
            message_id: message_id,
            ipfs_link_1: "",
            ipfs_link_2: "",
            publicVarNames: [],
            publicValues: []
        },
        role: role,
        name: "execute_message_" + name
    };
    appendToFile('data/blockchain_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate encrypt_message and execute_message JSON objects
function encryptionsGeneration(actor, message, message_id, role, name) {
    encrypt_messageGeneration(actor, message, message_id, name);
    execute_messageGeneration(message_id, role, name);
}


// Function to generate the decrypt_check JSON object
function decrypt_checkGeneration(message_id, actor, name) {
    const jsonObject = {
        method: "POST",
        endpoint: "http://172.31.83.251:8888/decrypt_check",
        data: {
            process_id: 0,
            message_id: Number(message_id),
            actor: actor
        },
        name: "decrypt_check_" + name
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the ask_auth_key JSON object
function ask_auth_keyGeneration(role) {
    const jsonObject = {
        contractInfo: "confidentialContract",
        functionName: "notifyAuthorities",
        params: {
            process_id: 0,
            list_auth: Authorities
        },
        role: role,
        name: "ask_auth_key_" + role
    };
    appendToFile('data/blockchain_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to generate the decrypt_wait JSON object
function decrypt_waitGeneration(message_id, actor, name) {
    const jsonObject = {
        method: "POST",
        endpoint: "http://172.31.83.251:8888/decrypt_wait",
        data: {
            process_id: 0,
            message_id: Number(message_id),
            actor: actor,
            list_auth: Authorities,
            starting_block: 0
        },
        name: "decrypt_wait_" + name
    };
    appendToFile('data/rest_inputs.json', JSON.stringify(jsonObject, null, 2));
}


// Function to extract all the Authorities' addresses
function extractAuthorities() {
    const filePath = '../Confidentiality\ Manager/src/.env';
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    // Regular expression to match AUTHORITYX_ADDRESS lines
    const regex = /^AUTHORITY\d+_ADDRESS="(0x[a-fA-F0-9]{40})"/gm;
    const matches = [];
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
        matches.push(match[1]);
    }
    return matches
}


// Function to extract via bfs the order of execution of the encryptions (based on nextElements from instantiateProcess)
function bfsShortestPath(root, targetTypes1, types, nameElements, nextElements, elements) {
    const queue = [[root, [root]]]; // (current_node, path_so_far)
    const visited = new Set([root]);
    let foundTypes1 = new Set();
    let totalPath = [];
    while (queue.length > 0) {
        const [node, path] = queue.shift();
        totalPath.push(node); // Add current node to the total path
        // If this node is of type 1, mark it as found
        if (types[node] === 1) {
            foundTypes1.add(node);
        }
        // If all target elements of type 1 are found, return the total path names of type 1
        if (targetTypes1.every(target => foundTypes1.has(target))) {
            return totalPath
                .map(i => nameElements[i])
                .filter(name => name !== "");
        }
        // Explore neighbors, add to path but preserve the original one
        for (const neighbor of nextElements[node]) {
            const neighborIndex = elements.indexOf(neighbor);
            if (!visited.has(neighborIndex)) {
                visited.add(neighborIndex);
                const newPath = [...path, neighborIndex];
                queue.push([neighborIndex, newPath]); // Queue the new path
            }
        }
    }
    return [];
}


// Function to convert string to hex with padding
function stringToHex32(str) {
    // Convert each character to its 2-digit hexadecimal representation
    let hexStr = "";
    for (let i = 0; i < str.length; i++) {
        hexStr += str.charCodeAt(i).toString(16).padStart(2, "0");
    }
    // Pad the hex string with trailing zeros until it's 64 hex digits (32 bytes)
    hexStr = hexStr.padEnd(64, "0");
    // Prepend "0x" to indicate hexadecimal format
    return "0x" + hexStr;
}


// Function to convert role names into addresses
function transformEncrypterToAddresses(encrypter, requests_Roles) {
    // Build a mapping from role name (uppercased) to its address
    const roleToAddress = {};
    for (const [address, roles] of Object.entries(requests_Roles)) {
        if (roles && roles.length > 0) {
            // Extract the role name (before the '@') and uppercase it
            const [roleName] = roles[0].split('@');
            roleToAddress[roleName.toUpperCase()] = address;
        }
    }
    // Transform each element in the encrypter array to its corresponding address
    return encrypter.map(role => {
        const upperRole = role.toUpperCase();
        if (upperRole === "INTERNAL") {
            return "0x0000000000000000000000000000000000000000";
        }
        // Return the corresponding address from the mapping, or null if not found
        return roleToAddress[upperRole] || null;
    });
}


// Function to inject new a message
function injectElement(data, insertAfter, newElement, requests_Roles) {
    const indexAfter = data.elements.indexOf(insertAfter);
    if (indexAfter === -1) {
        throw new Error("Insert position not found in elements array.");
    }
    // Determine the element that was originally next after insertAfter
    const originalNext = data.nextElements[indexAfter];
    // Append the new element
    data.elements.push(newElement);
    const newIndex = data.elements.length - 1;
    // Update nextElements
    data.nextElements[indexAfter] = [newElement]; // Modify insertAfter to point to newElement
    data.nextElements.push(originalNext); // Add newElement pointing to what insertAfter originally pointed to
    // Update PreviousElements
    if (originalNext.length > 0) {
        originalNext.forEach(nextElement => {
            const prevIndex = data.elements.indexOf(nextElement);
            if (prevIndex !== -1) {
                data.PreviousElements[prevIndex] = [newElement]; // Update previous of original next elements
            }
        });
    }
    data.PreviousElements.push([insertAfter]); // Add newElement pointing back to insertAfter
    // Append new type and nameElement
    data.types.push(1);
    data.nameElements.push("element"+ newElement);
    // Select a random non-"internal" value from encrypter
    const filteredEncrypter = [...new Set(data.encrypter.filter(value => value !== "internal"))];
    const randomEncrypter = filteredEncrypter[Math.floor(Math.random() * filteredEncrypter.length)];
    data.encrypter.push(randomEncrypter);
    // Select a random policy value from requests_Roles
    const roleKeys = Object.keys(requests_Roles);
    const randomKey = roleKeys[Math.floor(Math.random() * roleKeys.length)];
    const randomRole = requests_Roles[randomKey][0]; // Take the first role in the selected entry
    // Append the new policy
    data.policy[newElement] = `${randomRole}`;
    return data;
}


// Function to inject new messages
function injectElements(data, amount, requests_Roles) {
    let prev = 961687;
    for (let i = 0; i < amount; i++) {
        injectElement(data, prev, i+1, requests_Roles);
        prev = i+1;
    }
}

// The values to modify are the "requests" and the "userID" (cached value from frontend).
function main() {
    // Create or clear the files and initialize them as empty JSON arrays
    createOrClearJson('data/rest_inputs.json');
    createOrClearJson('data/blockchain_inputs.json');
    createOrClearJson('data/messages_data.json');
    let requests;
    let requests_Roles;

// #####################################################################################################################################################


    // 1.
    global.userID = "67abd73d603e7f33802360a8";
    requests = {
        name: "xRaysConfetty"
    }

    saveModelGeneration(requests.name);


// #####################################################################################################################################################


    // 2. THE ACTOR NAMES NEED TO BE UPPERCASE
    requests_Roles = {
            "0x7364cc4E7F136a16a7c38DE7205B7A5b18f17258": ["WARD@AUTH4"],
            "0xa5B6B3729Cf8f377EF6F97d87C49661b36Ed02bB": ["RADIOLOGY@AUTH1"],
            "0xb885E5701a3A4714799eE906f4Aa7C297f16D90a": ["PATIENT@AUTH2"]
        };
    requests = {
            modelID: "67abd840603e7f33802360ad",
            optional: ["null"],
            visibleAt: ["null"]
    };

    const mandatory_Extracted = Object.values(requests_Roles)
        .map(roleArray => roleArray[0].split('@')[0].toLowerCase())
        .map(role => role.charAt(0).toUpperCase() + role.slice(1));
    createInstanceGeneration(requests.modelID, requests.optional, mandatory_Extracted, requests.visibleAt);
    const mandatoryToLower = mandatory_Extracted.map(str => str.toLowerCase());
    const optionaltoLower = requests.optional.map(str => str.toLowerCase());
    // Generation of private keys and addresses for every mandatory and optional actor.
    userInfoGeneration(mandatoryToLower, optionaltoLower);
    // It can also be called with keyPairGeneration, publicKeyReadersGeneration,
    // and subscribeGeneration for every single user or directly with subscribeGeneration.
    allSubscriptionsGeneration(mandatoryToLower, optionaltoLower);
    // It can also be called with translation1Generation and translation2Generation
    translationsGeneration();


// #####################################################################################################################################################


    // 3.
    requests = {
        encrypter: [
            "Radiology",
            "internal",
            "Patient",
            "internal",
            "internal",
            "Ward",
            "internal",
            "Patient",
            "Patient",
            "Ward",
            "Radiology",
            "internal",
            "Radiology",
            "internal",
            "Patient",
            "Radiology",
            "internal",
            "internal",
        ],
        elements: [666, 332730, 263543, 860669, 13889, 550751, 441483, 715574, 437568, 371747, 961687, 229775, 128802, 755150, 149350, 169042, 879917, 68120],
        nextElements: [[441483], [263543], [860669], [128802], [666, 860669], [13889], [715574, 437568], [755150], [755150], [229775], [371747], [], [550751], [149350], [169042], [879917], [961687, 68120], []],
        PreviousElements: [[13889], [], [332730], [263543, 13889], [550751], [128802], [666], [441483], [441483], [961687], [879917], [371747], [860669], [715574, 437568], [755150], [149350], [169042], [879917]],
        types: [1, 2, 1, 4, 3, 1, 5, 1, 1, 1, 1, 8, 1, 6, 1, 1, 3, 8],
        nameElements : ["appointment", "", "type", "", "", "accepted", "", "certificationId", "temperature", "resultId", "report", "",
            "requestId", "", "appointmentId", "registration", "", ""],
        messageElements: ["MjUuMTAuMjAxNg", "", "MjUuMTAuMjAxNg", "", "","MjUuMTAuMjAxNg","",
            "MjUuMTAuMjAxNg","MjUuMTAuMjAxNg","MjUuMTAuMjAxNg","MjUuMTAuMjAxNg","", "MjUuMTAuMjAxNg","","MjUuMTAuMjAxNg",
            "MjUuMTAuMjAxNg","",""],
        // The actor names need to be UPPERCASE!
        policy: {
            "263543": "RADIOLOGY@AUTH1",
            "550751": "WARD@AUTH4",
            "961687": "WARD@AUTH4",
            "128802": "RADIOLOGY@AUTH1",
            "371747": "PATIENT@AUTH2",
            "715574": "RADIOLOGY@AUTH1",
            "437568": "RADIOLOGY@AUTH1",
            "169042": "PATIENT@AUTH2",
            "149350": "RADIOLOGY@AUTH1",
            "666": "PATIENT@AUTH2",
        }
    };

    injectElements(requests, 29, requests_Roles)
    console.log(requests);
    const addresses = transformEncrypterToAddresses(requests.encrypter, requests_Roles);
    instantiateProcessGeneration(requests.encrypter.map(stringToHex32), transformEncrypterToAddresses(requests.encrypter, requests_Roles), requests.elements, requests.nextElements, requests.PreviousElements, requests.types);
    // Generation of the JSON encryption objects
    for (let index = 0; index < requests.encrypter.length; index++) {
        if (requests.encrypter[index].toLowerCase() !== "internal") {
            encryptionsGeneration(addresses[index], requests.messageElements[0], requests.elements[index], require('./data/users_info.json').find(obj => obj.address === addresses[index])?.role, requests.nameElements[index]);
            appendToFile('data/messages_data.json', JSON.stringify({
                message_id: requests.elements[index],
                element: requests.nameElements[index]
            }));
        }
    }
    // Encryption ordering
    const root = requests.PreviousElements.findIndex(prev => prev.length === 0);
    const targetTypes1 = requests.types.reduce((acc, t, i) => {
        if (t === 1) acc.push(i);
        return acc;
    }, []);
    const shortestPath = bfsShortestPath(root, targetTypes1, requests.types, requests.nameElements, requests.nextElements, requests.elements);
    fs.writeFileSync('data/ordering.txt', shortestPath.join('\n'), 'utf8');
    attributesCertificationGeneration(requests_Roles, requests.policy);
    // Generation of the ask_auth_key_ for every user
    const extractedRoles = Object.values(requests_Roles).map(roleArray =>
        roleArray[0].split('@')[0]
    );
    for (const role of extractedRoles) {
        ask_auth_keyGeneration(role.toLocaleLowerCase());
    }
    // Decryption of all the elements
    for (const message_id in requests.policy) {
        const actor = requests.policy[message_id].split('@')[0];
        const element = require('./data/messages_data.json').find(obj => obj.message_id === Number(message_id))?.element;
        const address = require('./data/users_info.json').find(obj => obj.role === actor.toLocaleLowerCase())?.address;
        decrypt_checkGeneration(message_id, address, element);
        decrypt_waitGeneration(message_id, address, element)
    }


// #####################################################################################################################################################


    // 4.
    requests = {
        elementWithConditions: [666, 860669, 961687, 68120],
        elementWithPublicVar: [550751, 550751, 169042, 169042],
        publicVariables: ["0x6163636570746564000000000000000000000000000000000000000000000000", "0x6163636570746564000000000000000000000000000000000000000000000000", "0x726567697374726174696f6e0000000000000000000000000000000000000000", "0x726567697374726174696f6e0000000000000000000000000000000000000000"],
        operators: [1, 1, 1, 1],
        values: ["0x7472756500000000000000000000000000000000000000000000000000000000", "0x66616c7365000000000000000000000000000000000000000000000000000000", "0x7472756500000000000000000000000000000000000000000000000000000000", "0x66616c7365000000000000000000000000000000000000000000000000000000"]
    };

    setInstanceConditionsGeneration(requests.elementWithConditions, requests.elementWithPublicVar, requests.publicVariables, requests.operators, requests.values);
    const jsonData = JSON.parse(fs.readFileSync('data/blockchain_inputs.json', 'utf8'));
    requests.operators.forEach((operator, index) => {
        const exists = jsonData.some(obj =>
            obj.name.includes("execute_message") && obj.params.message_id === requests.elementWithConditions[index]
        );
        if (operator === 1 && exists) {
            const result = jsonData.find(obj => obj.name.includes("execute_message") && obj.params.message_id === requests.elementWithPublicVar[index]);
            result.params.publicVarNames = [requests.publicVariables[index]];
            result.params.publicValues = [requests.values[index]];
        }
        else if (operator !== 1) {
            throw new Error("OPERATOR IS NOT 1!");
        }
    });
    fs.writeFileSync('data/blockchain_inputs.json', JSON.stringify(jsonData, null, 2), 'utf8');


}


const Authorities = extractAuthorities();
main();
