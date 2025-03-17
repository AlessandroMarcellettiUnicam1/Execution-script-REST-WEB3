const fs = require('fs');
const { hdkey } = require('ethereumjs-wallet');
const bip39 = require('bip39');
const Web3 = require('web3');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { MongoClient } = require('mongodb');

const argv = yargs(hideBin(process.argv))
    .option('e', {
        alias: 'encryptors',
        type: 'number',
        description: 'Number of encryptors',
        demandOption: false
    })
    .option('d', {
        alias: 'duplication',
        type: 'number',
        description: 'Number of times to duplicate the messages encrypted',
        demandOption: false
    })
    .option('l', {
        alias: 'loop',
        type: 'number',
        description: 'Number of times to loop the process',
        demandOption: false
    })
    .option('f', {
        alias: 'input',
        type: 'path',
        description: 'Input file to load',
        demandOption: false
    })
    .option('v', {
        alias: 'parallel1',
        type: 'number',
        description: 'First test for the parallel gateway',
        demandOption: false
    })
    .option('w', {
        alias: 'parallel2',
        type: 'number',
        description: 'Second test for the parallel gateway',
        demandOption: false
    })
    .option('x', {
        alias: 'exclusive1',
        type: 'number',
        description: 'First test for the exclusive gateway',
        demandOption: false
    })
    .option('y', {
        alias: 'exclusive2',
        type: 'number',
        description: 'Second test for the exclusive gateway',
        demandOption: false
    })
    .help()
    .argv;

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
    //console.log("Appended content to " + filePath);
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
function createInstanceGeneration(optional, mandatory, visibleAt) {
    const jsonObject = {
        method: "POST",
        endpoint: "http://localhost:8081/ChorChain/rest/createInstance/" + userID,
        data: {
            modelID: "",
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


// Function to inject a new message
function injectElement(data, insertAfter, newElement, requests_Roles) {
    const indexAfter = data.elements.indexOf(insertAfter);
    if (indexAfter === -1) {
        throw new Error("Insert position not found in elements array.");
    }
    // Determine the element that was originally next after insertAfter
    const originalNext = data.nextElements[indexAfter];
    // Append the new element
    data.elements.push(newElement);
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


// Function to generate addresses and private keys from a seed
function getUserWalletInfo(index) {
    const mnemonic = "control pulse code indoor off imitate uncover lesson fragile isolate fault blast";
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdWallet = hdkey.fromMasterSeed(seed);
    const derivationPath = `m/44'/60'/0'/0/${index + 5}`; // Adjusted index
    const wallet = hdWallet.derivePath(derivationPath).getWallet();
    return {
        address: Web3.utils.toChecksumAddress(wallet.getAddressString()),
        privateKey: wallet.getPrivateKeyString()
    };
}


// Function to randomly encrypt the messages
function modifyEncrypterRoles(roleMapping, encrypter, encryptors_Number) {
    delete roleMapping['0x0882271d553738aB2b238F7a95fa7Ce0DE171EF5'];
    if (encryptors_Number === 2) {
        delete roleMapping['0x7364cc4E7F136a16a7c38DE7205B7A5b18f17258'];
        encrypter = encrypter.map(role =>
            role === 'Ward' ? (Math.random() < 0.5 ? 'Patient' : 'Radiology') : role
        );
    }
    // Extract unique roles (case-insensitive)
    const roles = Object.values(roleMapping)
        .flat()
        .map(role => role.split('@')[0].toLowerCase());
    const uniqueRoles = [...new Set(roles)];
    // Identify non-internal positions and count them
    const nonInternalIndices = [];
    encrypter.forEach((role, index) => {
        if (role !== 'internal') nonInternalIndices.push(index);
    });
    const nonInternalCount = nonInternalIndices.length;
    // Generate role list in shuffled rounds
    const roleList = [];
    while (roleList.length < nonInternalCount) {
        const shuffled = [...uniqueRoles].sort(() => Math.random() - 0.5);
        for (const role of shuffled) {
            if (roleList.length >= nonInternalCount) break;
            roleList.push(role);
        }
    }
    // Assign roles to non-internal positions
    roleList.forEach((role, i) => {
        const index = nonInternalIndices[i];
        encrypter[index] = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    });
    if (encryptors_Number === 2) {
        roleMapping[getUserWalletInfo(0).address] = ["WARD@AUTH4"];
    }
    roleMapping[getUserWalletInfo(3).address] = ["INSURANCE@AUTH3"];
    return encrypter;
}


// Function to duplicate setInstanceConditions and instantiateProcess
function duplicateRequests(originalRequests1, count, from_where) {
    // Deep clone the original requests to avoid mutation
    let requests1 = JSON.parse(JSON.stringify(originalRequests1));
    // Precompute element type map for original requests1
    const originalElementTypes = {};
    const next_From_Where = originalRequests1.nextElements[originalRequests1.elements.indexOf(from_where)][0];
    const element_Type_2 = originalRequests1.elements[originalRequests1.types.indexOf(2)];
    requests1.elements.forEach((id, index) => {
        originalElementTypes[id] = requests1.types[index];
    });
    const originalElements = requests1.elements.slice(); // Create a static copy of original elements
    const copyStartElements = []; // Collect start elements of each copy (263543X)
    const copyResultIds = []; // Collect resultIds of each copy (371747X)
    for (let copyNumber = 1; copyNumber <= count; copyNumber++) {
        const suffix = '0'.repeat(copyNumber);
        const currentCopyIndex = copyNumber - 1;
        // Create a map from original ID to new ID for elements that are duplicated
        const idMap = new Map();
        // Process elements and build idMap
        const newElements = [];
        const newEncrypter = [];
        const newNextElements = [];
        const newPreviousElements = [];
        const newTypes = [];
        const newNameElements = [];
        const newMessageElements = [];
        for (let i = 0; i < originalElements.length; i++) {
            const originalId = originalElements[i];
            const type = requests1.types[i]; // Using original index since originalElements is static
            if (type === 2 || originalId === next_From_Where) { // Skip start (2) and specific finish element (229775)
                continue;
            }
            const newId = parseInt(originalId.toString() + suffix, 10);
            idMap.set(originalId, newId);
            newElements.push(newId);
            newEncrypter.push(requests1.encrypter[i]);
            // Process nextElements
            const originalNext = requests1.nextElements[i].map(refId => {
                if (originalElementTypes[refId] === 2 || refId === next_From_Where) {
                    return refId;
                } else {
                    return parseInt(refId.toString() + suffix, 10);
                }
            });
            newNextElements.push(originalNext);
            // Process PreviousElements
            const originalPrev = requests1.PreviousElements[i].map(refId => {
                if (originalElementTypes[refId] === 2 || refId === next_From_Where) {
                    return refId;
                } else {
                    return parseInt(refId.toString() + suffix, 10);
                }
            });
            newPreviousElements.push(originalPrev);
            newTypes.push(type);
            // Process nameElements
            const originalName = requests1.nameElements[i];
            newNameElements.push(originalName ? `${originalName}${currentCopyIndex}` : '');
            newMessageElements.push(requests1.messageElements[i]);
            // Update policy
            if (requests1.policy[originalId.toString()]) {
                requests1.policy[newId.toString()] = requests1.policy[originalId.toString()];
            }
        }
        // Add the new elements to requests1
        requests1.encrypter.push(...newEncrypter);
        requests1.elements.push(...newElements);
        requests1.nextElements.push(...newNextElements);
        requests1.PreviousElements.push(...newPreviousElements);
        requests1.types.push(...newTypes);
        requests1.nameElements.push(...newNameElements);
        requests1.messageElements.push(...newMessageElements);
        // Collect start elements and resultIds
        const startElementOriginal = originalRequests1.nextElements[originalRequests1.types.indexOf(2)][0];
        const resultIdOriginal = from_where;
        const startElementNew = idMap.get(startElementOriginal);
        const resultIdNew = idMap.get(resultIdOriginal);
        if (startElementNew) copyStartElements.push(startElementNew);
        if (resultIdNew) copyResultIds.push(resultIdNew);
        // Process requests1
        if (requests1.elementWithConditions) {
            const newElementWithConditions = originalRequests1.elementWithConditions.map(id => {
                if (originalElementTypes[id] !== 2 && id !== next_From_Where) {
                    return parseInt(id.toString() + suffix, 10);
                }
                return id;
            });
            requests1.elementWithConditions.push(...newElementWithConditions);
            const newElementWithPublicVar = originalRequests1.elementWithPublicVar.map(id => {
                if (originalElementTypes[id] !== 2 && id !== next_From_Where) {
                    return parseInt(id.toString() + suffix, 10);
                }
                return id;
            });
            requests1.elementWithPublicVar.push(...newElementWithPublicVar);
            requests1.publicVariables.push(...originalRequests1.publicVariables);
            requests1.operators.push(...originalRequests1.operators);
            requests1.values.push(...originalRequests1.values);
        }
    }
    // Update original resultId (371747) to point to first copy's start element
    const originalResultIdIndex = requests1.elements.indexOf(from_where);
    if (originalResultIdIndex !== -1 && copyStartElements.length > 0) {
        requests1.nextElements[originalResultIdIndex] = [copyStartElements[0]];
        const firstCopyStartIndex = requests1.elements.indexOf(copyStartElements[0]);
        if (firstCopyStartIndex !== -1) {
            requests1.PreviousElements[firstCopyStartIndex].push(from_where);
        }
    }
    // Update each copy's resultId to point to next start or finish
    for (let i = 0; i < copyResultIds.length; i++) {
        const resultId = copyResultIds[i];
        const resultIdIndex = requests1.elements.indexOf(resultId);
        if (resultIdIndex === -1) continue;
        if (i < copyResultIds.length - 1) {
            const nextStart = copyStartElements[i + 1];
            requests1.nextElements[resultIdIndex] = [nextStart];
            const nextStartIndex = requests1.elements.indexOf(nextStart);
            if (nextStartIndex !== -1) {
                requests1.PreviousElements[nextStartIndex].push(resultId);
            }
        } else {
            requests1.nextElements[resultIdIndex] = [next_From_Where];
            const finishIndex = requests1.elements.indexOf(next_From_Where);
            if (finishIndex !== -1) {
                requests1.PreviousElements[finishIndex] = [];
                requests1.PreviousElements[finishIndex].push(resultId);
            }
        }
    }
    requests1.PreviousElements.forEach((innerArray, idx) => {
        if (innerArray.length > 1) {
            requests1.PreviousElements[idx] = innerArray.filter(item => item !== element_Type_2);
        }
    });
    return requests1;
}


// Function to duplicate parallel test 1
function parallelTest1(originalData, n) {
    // Create a deep copy of the original data to avoid mutation
    const data = JSON.parse(JSON.stringify(originalData));
    for (let i = 0; i < n; i++) {
        const elements = data.elements;
        const currentLastValue = elements[elements.length - 1];
        const currentLastIndex = elements.length - 1;
        // Update the type of the current last element to 5
        data.types[currentLastIndex] = 5;
        // Create new element values
        const newElement1 = currentLastValue + 1;
        const newElement2 = currentLastValue + 2;
        // Add new elements to the elements array
        data.elements.push(newElement1, newElement2);
        // Update nextElements for the current last element
        data.nextElements[currentLastIndex] = [newElement1, newElement2];
        // Add new nextElements entries for the new elements
        data.nextElements.push([], []);
        // Add PreviousElements entries for the new elements
        data.PreviousElements.push([currentLastValue], [currentLastValue]);
        // Update other arrays
        data.encrypter.push("internal", "internal");
        data.nameElements.push("", "");
        data.messageElements.push("", "");
        data.types.push(8, 8);
    }
    return data;
}


// Function to duplicate parallel test 2
function parallelTest2(requests, value) {
    // Calculate new_Elements
    const originalElementsLength = requests.elements.length;
    const new_Elements = Array.from({ length: originalElementsLength + value * 2 }, (_, i) => i + 1);
    // Calculate new_Encrypter
    const new_Encrypter = [...requests.encrypter];
    for (let e = 0; e < value * 2; e++) {
        new_Encrypter.push("internal");
    }
    // Calculate new_nextElements
    const newNextElements = [];
    for (let e = 1; e < originalElementsLength + value * 2; e++) {
        newNextElements.push([e + 1]);
    }
    newNextElements.push([]);
    let toggle = 1;
    for (let e = 0; e < value; e++) {
        const index = toggle + 1;
        newNextElements[index].push(new_Elements.length - toggle);
        toggle += 1;
    }
    // Calculate new_PreviousElements
    const newPreviousElements = [];
    for (let e = 1; e < new_Elements.length; e++) {
        newPreviousElements.push([e]);
    }
    newPreviousElements.unshift([]);
    toggle = -2;
    let starting = 3;
    for (let e = 0; e < value; e++) {
        const index = newPreviousElements.length + toggle;
        newPreviousElements[index].unshift(starting);
        toggle -= 1;
        starting += 1;
    }
    // Calculate new_Types
    const new_Types = [...requests.types];
    for (let e = 0; e < value; e++) {
        new_Types.splice(2, 0, 5);
        new_Types.splice(new_Types.length - 1, 0, 6);
    }
    // Calculate new_NameElements
    const new_NameElements = [...requests.nameElements];
    for (let e = 0; e < value * 2; e++) {
        new_NameElements.push("");
    }
    // Calculate new_messageElements
    const new_messageElements = [...requests.messageElements];
    for (let e = 0; e < value * 2; e++) {
        new_messageElements.push("");
    }
    // Update requests object
    requests.encrypter = new_Encrypter;
    requests.elements = new_Elements;
    requests.nextElements = newNextElements;
    requests.PreviousElements = newPreviousElements;
    requests.types = new_Types;
    requests.nameElements = new_NameElements;
    requests.messageElements = new_messageElements;
    return requests;
}


// Function to duplicate exclusive test 1
function exclusiveTest1(requests, value) {
    // Create deep copies of arrays
    let new_Encrypter = [...requests.encrypter];
    for (let e = 0; e < value * 2; e++) {
        new_Encrypter.push("internal");
    }
    let new_Elements = [...requests.elements];
    for (let e = 0; e < value * 2; e++) {
        new_Elements.push(Math.max(...new_Elements) + 1);
    }
    let new_nextElements = requests.nextElements.map(arr => [...arr]);
    for (let e = 0; e < value * 2; e++) {
        new_nextElements.push([]);
    }
    let val = 2;
    for (let e = 0; e < value; e++) {
        new_nextElements[val + 2].push(4 + val);
        new_nextElements[val + 2].push(5 + val);
        val += 2;
    }
    let new_PreviousElements = requests.PreviousElements.map(arr => [...arr]);
    const originalMaxElement = Math.max(...requests.elements);
    let valPrev = 0;
    for (let e = 0; e < value; e++) {
        new_PreviousElements.push([originalMaxElement + valPrev]);
        new_PreviousElements.push([originalMaxElement + valPrev]);
        valPrev += 2;
    }
    let new_Types = [2, 1];
    for (let e = 0; e < value + 1; e++) {
        new_Types.push(3);
        new_Types.push(8);
    }
    new_Types.push(8);
    let new_NameElements = [...requests.nameElements];
    for (let e = 0; e < value * 2; e++) {
        new_NameElements.push("");
    }
    let new_MessageElements = [...requests.messageElements];
    for (let e = 0; e < value * 2; e++) {
        new_MessageElements.push("");
    }
    let new_ElementWithConditions = [...requests.elementWithConditions];
    let valCond = 6;
    for (let e = 0; e < value * 2; e++) {
        new_ElementWithConditions.push(valCond++);
    }
    let new_ElementWithPublicVar = [...requests.elementWithPublicVar];
    for (let e = 0; e < value * 2; e++) {
        new_ElementWithPublicVar.push(2);
    }
    let new_PublicVariables = [...requests.publicVariables];
    for (let e = 0; e < value * 2; e++) {
        new_PublicVariables.push("0x6100000000000000000000000000000000000000000000000000000000000000");
    }
    let new_Operators = [...requests.operators];
    for (let e = 0; e < value * 2; e++) {
        new_Operators.push(1);
    }
    let new_Values = [...requests.values];
    for (let e = 0; e < value; e++) {
        new_Values.push("0x3000000000000000000000000000000000000000000000000000000000000000");
        new_Values.push("0x3100000000000000000000000000000000000000000000000000000000000000");
    }
    // Update the requests object
    requests.encrypter = new_Encrypter;
    requests.elements = new_Elements;
    requests.nextElements = new_nextElements;
    requests.PreviousElements = new_PreviousElements;
    requests.types = new_Types;
    requests.nameElements = new_NameElements;
    requests.messageElements = new_MessageElements;
    requests.elementWithConditions = new_ElementWithConditions;
    requests.elementWithPublicVar = new_ElementWithPublicVar;
    requests.publicVariables = new_PublicVariables;
    requests.operators = new_Operators;
    requests.values = new_Values;
    return requests;
}


// Function to duplicate exclusive test 2
function exclusiveTest2(requests, value) {
    let new_Encrypter = [...requests.encrypter];
    for (let e = 0; e < value * 2; e++) {
        new_Encrypter.push("internal");
    }
    let new_Elements = [...requests.elements];
    for (let e = 0; e < value * 2; e++) {
        new_Elements.push(Math.max(...new_Elements) + 1);
    }
    let new_NextElements = [];
    for (let e = 2; e <= new_Elements.length; e++) {
        new_NextElements.push([e]);
    }
    new_NextElements.push([]);
    let val = 1;
    for (let e = 0; e < value; e++) {
        new_NextElements[val + 1].push(new_Elements.length - val);
        val += 1;
    }
    let new_PreviousElements = [];
    for (let e = 1; e < new_Elements.length; e++) {
        new_PreviousElements.push([e]);
    }
    new_PreviousElements.unshift([]);
    val = 3;
    for (let e = 0; e < value; e++) {
        const idx = new_PreviousElements.length - (val - 1);
        new_PreviousElements[idx].unshift(val);
        val += 1;
    }
    let new_Types = [2, 1];
    for (let e = 0; e < value + 1; e++) {
        new_Types.push(3);
    }
    for (let e = 0; e < value + 1; e++) {
        new_Types.push(4);
    }
    new_Types.push(8);
    let new_NameElements = [...requests.nameElements];
    for (let e = 0; e < value * 2; e++) {
        new_NameElements.push("");
    }
    let new_MessageElements = [...requests.messageElements];
    for (let e = 0; e < value * 2; e++) {
        new_MessageElements.push("");
    }
    let new_ElementWithConditions = [];
    let tempVal = 4;
    for (let e = 0; e < value; e++) {
        new_ElementWithConditions.push(tempVal);
        tempVal++;
    }
    for (let e = 0; e < 3; e++) {
        new_ElementWithConditions.push(tempVal);
    }
    tempVal++;
    let check = 0;
    for (let e = 0; e < value * 2; e++) {
        new_ElementWithConditions.push(tempVal);
        check++;
        if (check === 2) {
            check = 0;
            tempVal++;
        }
    }
    new_ElementWithConditions.reverse();
    let new_ElementWithPublicVar = new Array(new_ElementWithConditions.length).fill(2);
    let new_PublicVariables = new Array(new_ElementWithConditions.length).fill(
        "0x6100000000000000000000000000000000000000000000000000000000000000"
    );
    let new_Operators = new Array(new_ElementWithConditions.length).fill(1);
    let new_Values = [];
    for (let e = 0; e < value; e++) {
        new_Values.push("0x3100000000000000000000000000000000000000000000000000000000000000");
    }
    new_Values.push("0x3000000000000000000000000000000000000000000000000000000000000000");
    new_Values.push("0x3200000000000000000000000000000000000000000000000000000000000000");
    new_Values.push("0x3100000000000000000000000000000000000000000000000000000000000000");
    for (let e = 0; e < value; e++) {
        new_Values.push("0x3000000000000000000000000000000000000000000000000000000000000000");
        new_Values.push("0x3200000000000000000000000000000000000000000000000000000000000000");
    }
    new_Values.reverse();
    requests.encrypter = new_Encrypter;
    requests.elements = new_Elements;
    requests.nextElements = new_NextElements;
    requests.PreviousElements = new_PreviousElements;
    requests.types = new_Types;
    requests.nameElements = new_NameElements;
    requests.messageElements = new_MessageElements;
    requests.elementWithConditions = new_ElementWithConditions;
    requests.elementWithPublicVar = new_ElementWithPublicVar;
    requests.publicVariables = new_PublicVariables;
    requests.operators = new_Operators;
    requests.values = new_Values;
    return requests;
}


function fetchUserIdSync() {
    const deasync = require('deasync');
    let isDone = false;
    let userId;
    (async () => {
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        let userDocument = null;
        while (!userDocument) {
            userDocument = await client.db('ChorChain').collection('User').findOne({});
            if (!userDocument) {
                console.log('No user found, retrying...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        userId = userDocument._id.toString();
        await client.close();
        isDone = true;
    })();
    // Block the event loop until the async operation is finished
    while (!isDone) {
        deasync.runLoopOnce();
    }
    return userId;
}


function main() {




    // INPUT:
    const input_path = argv.f ?? './data/input/input_1_X-ray.json';                   // './data/input/input_1_X-ray.json' default
    const encryptors_Number = argv.e ?? 3;                                      // 3 default
    const message_Duplication = argv.d ?? 1;                                // 1 default
    const looping = argv.l ?? 0;                                            // 0 default
    const testParallel1 = argv.v ?? 0;                                      // 0 default
    const testParallel2 = argv.w ?? 0;                                      // 0 default
    const testExclusive1 = argv.x ?? 0;                                     // 0 default
    const testExclusive2 = argv.y ?? 0;                                     // 0 default



    const new_Model = './data/model.xml';
    fs.copyFileSync('./data/models/x-ray.xml', new_Model);
    if (input_path === './data/input/input_Parallel_Split.json') {
        fs.copyFileSync('./data/models/t4_0.xml', new_Model);
    }
    else if (input_path === './data/input/input_Parallel_Split_Join.json') {
        fs.copyFileSync('./data/models/t5_0.xml', new_Model);
    }
    else if (input_path === './data/input/input_Exclusive_Split.json') {
        fs.copyFileSync('./data/models/t6_0.xml', new_Model);
    }
    else if (input_path === './data/input/input_Exclusive_Split_Join.json') {
        fs.copyFileSync('./data/models/t7_0.xml', new_Model);
    }
    global.userID = fetchUserIdSync();
    createOrClearJson('data/rest_inputs.json');
    createOrClearJson('data/blockchain_inputs.json');
    createOrClearJson('data/messages_data.json');
    const data = fs.readFileSync(input_path, 'utf8');
    let requests = JSON.parse(data);
    saveModelGeneration(requests.name);
    let requests_Roles = {};
    requests.roles.forEach((role, index) => {
        const address = getUserWalletInfo(index).address;
        requests_Roles[address] = role;
    });

    if (encryptors_Number > 3) {
        for (let i = 0; i < encryptors_Number - 3; i++) {
            const userIndex = 4 + i; // Start from index 4
            const testUser = `TESTUSER${i + 1}`;
            const randomAuth = Math.floor(Math.random() * 4) + 1; // Random number between 1 and 4
            requests_Roles[getUserWalletInfo(userIndex).address] = [`${testUser}@AUTH${randomAuth}`];
        }
    }
    const mandatory_Extracted = Object.values(requests_Roles)
        .map(roleArray => roleArray[0].split('@')[0].toLowerCase())
        .map(role => role.charAt(0).toUpperCase() + role.slice(1));
    createInstanceGeneration(requests.optional, mandatory_Extracted, requests.visibleAt);
    const mandatoryToLower = mandatory_Extracted.map(str => str.toLowerCase());
    const optionaltoLower = requests.optional.map(str => str.toLowerCase());
    // Generation of private keys and addresses for every mandatory and optional actor.
    userInfoGeneration(mandatoryToLower, optionaltoLower);
    // It can also be called with keyPairGeneration, publicKeyReadersGeneration,
    // and subscribeGeneration for every single user or directly with subscribeGeneration.
    allSubscriptionsGeneration(mandatoryToLower, optionaltoLower);
    // It can also be called with translation1Generation and translation2Generation
    translationsGeneration();
    // last duplicateRequests input (from_where) is the last message with type 1 from where the new loop should start
    if (looping !== 0) {
        fs.copyFileSync('./data/models/t3_' + looping + '.xml', new_Model);
        requests = duplicateRequests(requests, looping, 371747)
    }
    if (testParallel1 !== 0) {
        fs.copyFileSync('./data/models/t4_' + testParallel1 + '.xml', new_Model);
        requests = parallelTest1(requests, testParallel1);
    }
    if (testParallel2 !== 0) {
        fs.copyFileSync('./data/models/t5_' + testParallel2 + '.xml', new_Model);
        requests = parallelTest2(requests, testParallel2);
    }
    if (testExclusive1 !== 0) {
        fs.copyFileSync('./data/models/t6_' + testExclusive1 + '.xml', new_Model);
        requests = exclusiveTest1(requests, testExclusive1);
    }
    if (testExclusive2 !== 0) {
        fs.copyFileSync('./data/models/t7_' + testExclusive2 + '.xml', new_Model);
        requests = exclusiveTest2(requests, testExclusive2);
    }
    requests.messageElements = requests.messageElements.map(item =>
        item !== "" ? item.repeat(message_Duplication) : item
    );
    injectElements(requests, 0, requests_Roles)
    if (encryptors_Number !== 3) {
        fs.copyFileSync('./data/models/t1_' + encryptors_Number + '.xml', new_Model);
        requests.encrypter = modifyEncrypterRoles(requests_Roles, requests.encrypter, encryptors_Number);
    }
    const addresses = transformEncrypterToAddresses(requests.encrypter, requests_Roles);
    instantiateProcessGeneration(requests.encrypter.map(stringToHex32), transformEncrypterToAddresses(requests.encrypter, requests_Roles), requests.elements, requests.nextElements, requests.PreviousElements, requests.types);
    // Generation of the JSON encryption objects
    for (let index = 0; index < requests.encrypter.length; index++) {
        if (requests.encrypter[index].toLowerCase() !== "internal") {
            encryptionsGeneration(addresses[index], requests.messageElements[index], requests.elements[index], require('./data/users_info.json').find(obj => obj.address === addresses[index])?.role, requests.nameElements[index]);
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
    // If there are exclusive gateways
    if (requests.elementWithConditions) {
        setInstanceConditionsGeneration(requests.elementWithConditions, requests.elementWithPublicVar, requests.publicVariables, requests.operators, requests.values);
        const jsonData = JSON.parse(fs.readFileSync('data/blockchain_inputs.json', 'utf8'));
        requests.operators.forEach((operator, index) => {
            const exists = jsonData.some(obj =>
                obj.name.includes("execute_message") && obj.params.message_id === requests.elementWithConditions[index]
            );
            if ((operator === 1 && exists) || (input_path === './data/input/input_Exclusive_Split.json') || (input_path === './data/input/input_Exclusive_Split_Join.json')) {
                const result = jsonData.find(obj => obj.name.includes("execute_message") && obj.params.message_id === requests.elementWithPublicVar[index]);
                result.params.publicVarNames = [requests.publicVariables[index]];
                result.params.publicValues = [requests.values[index]];
            } else if (operator !== 1) {
                throw new Error("OPERATOR IS NOT 1!");
            }
        });
        fs.writeFileSync('data/blockchain_inputs.json', JSON.stringify(jsonData, null, 2), 'utf8');
    }
    //console.log(requests)
    console.log(requests_Roles);
    for (let i = 0; i < requests.messageElements.length; i++) {
        if (requests.messageElements[i].length !== 0) {
            console.log(`${requests.nameElements[i]} length: ${requests.messageElements[i].length}`);
        }
    }
    console.log(requests.encrypter);
    console.log(requests.nextElements);
    const new_Ordering = './data/ordering.txt';
    if (input_path === './data/input/input_1_Incident.json') {
        fs.copyFileSync('./data/additional_Ordering/ordering_Incident.txt', new_Ordering);
        fs.copyFileSync('./data/models/incident.xml', new_Model);
    }
    else if (input_path === './data/input/input_1_Retail.json') {
        fs.copyFileSync('./data/additional_Ordering/ordering_Retail.txt', new_Ordering);
        fs.copyFileSync('./data/models/retail.xml', new_Model);
    }
}


const Authorities = extractAuthorities();
main();
