// SPDX-License-Identifier: CC-BY-SA-4.0

pragma solidity >= 0.5.0 < 0.9.0;
import "./StateContract.sol";

contract ConfidentialContract {

  event functionDone(uint64, uint64);
  // Event to notify authorities to send their portion of the decryption key
  event AuthoritiesNotified(uint64 indexed process_id, address indexed user, address[] authorities);
  address stateAddress;
  StateContract stateContract;
  struct authoritiesNames {
    bytes32 hashPart1;
    bytes32 hashPart2;
  }
  mapping (uint64 => mapping (address => authoritiesNames)) authoritiesName;

  struct firstElementHashed {
    bytes32 hashPart1;
    bytes32 hashPart2;
  }
  mapping (uint64 => mapping (address => firstElementHashed)) firstGHashed;

  struct secondElementHashed {
    bytes32 hashPart1;
    bytes32 hashPart2;
  }
  mapping (uint64 => mapping (address => secondElementHashed)) secondGHashed;

  struct firstElement {
    bytes32 hashPart1;
    bytes32 hashPart2;
    bytes32 hashPart3;
  }
  mapping (uint64 => mapping (address => firstElement)) firstG;

  struct secondElement {
    bytes32 hashPart1;
    bytes32 hashPart2;
    bytes32 hashPart3;
  }
  mapping (uint64 => mapping (address => secondElement)) secondG;

  struct publicParameters {
    bytes32 hashPart1;
    bytes32 hashPart2;
  }
  mapping (uint64 => mapping (address => publicParameters)) parameters;

  struct publicKey {
    bytes32 hashPart1;
    bytes32 hashPart2;
  }
  mapping (uint64 => mapping (address =>  publicKey)) publicKeys;

  struct publicKeyReaders {
    bytes32 hashPart1;
    bytes32 hashPart2;
  }
  mapping (address =>  publicKeyReaders) publicKeysReaders;

  struct IPFSCiphertext {
    address sender;
    bytes32 hashPart1;
    bytes32 hashPart2;
  }
  mapping (uint64 => IPFSCiphertext) allLinks;

  struct userAttributes {
    bytes32 hashPart1;
    bytes32 hashPart2;
  }
  mapping (uint64 => userAttributes) allUsers;

   function setStateAddress() public{
        require(stateAddress == address(0));
        stateAddress = msg.sender;
        stateContract = StateContract(stateAddress);
    } 

  function setAuthoritiesNames(uint64 _instanceID, bytes32 _hash1, bytes32 _hash2) public {
    authoritiesName[_instanceID][msg.sender].hashPart1 = _hash1;
    authoritiesName[_instanceID][msg.sender].hashPart2 = _hash2;
  }

  function getAuthoritiesNames(address _address, uint64 _instanceID) public view returns (bytes memory) {
    bytes32 p1 = authoritiesName[_instanceID][_address].hashPart1;
    bytes32 p2 = authoritiesName[_instanceID][_address].hashPart2;
    bytes memory joined = new bytes(64);
    assembly {
      mstore(add(joined, 32), p1)
      mstore(add(joined, 64), p2)
    }
    return joined;
  }

  function setElementHashed(uint64 _instanceID, bytes32 _hash1, bytes32 _hash2, bytes32 _hash3, bytes32 _hash4) public {
    firstGHashed[_instanceID][msg.sender].hashPart1 = _hash1;
    firstGHashed[_instanceID][msg.sender].hashPart2 = _hash2;
    secondGHashed[_instanceID][msg.sender].hashPart1 = _hash3;
    secondGHashed[_instanceID][msg.sender].hashPart2 = _hash4;
  }

  function getElementHashed(address _address, uint64 _instanceID) public view returns (bytes memory, bytes memory) {
    bytes32 p1 = firstGHashed[_instanceID][_address].hashPart1;
    bytes32 p2 = firstGHashed[_instanceID][_address].hashPart2;
    bytes32 p3 = secondGHashed[_instanceID][_address].hashPart1;
    bytes32 p4 = secondGHashed[_instanceID][_address].hashPart2;
    bytes memory joined = new bytes(64);
    assembly {
      mstore(add(joined, 32), p1)
      mstore(add(joined, 64), p2)
    }
    bytes memory joinedsec = new bytes(64);
    assembly {
      mstore(add(joinedsec, 32), p3)
      mstore(add(joinedsec, 64), p4)
    }
    return (joined, joinedsec);
  }

  function setElement(uint64 _instanceID, bytes32 _hash1, bytes32 _hash2, bytes32 _hash3, bytes32 _hash4, bytes32 _hash5, bytes32 _hash6) public {
    firstG[_instanceID][msg.sender].hashPart1 = _hash1;
    firstG[_instanceID][msg.sender].hashPart2 = _hash2;
    firstG[_instanceID][msg.sender].hashPart3 = _hash3;
    secondG[_instanceID][msg.sender].hashPart1 = _hash4;
    secondG[_instanceID][msg.sender].hashPart2 = _hash5;
    secondG[_instanceID][msg.sender].hashPart3 = _hash6;
  }

  function getElement(address _address, uint64 _instanceID) public view returns (bytes memory, bytes32, bytes memory, bytes32) {
    bytes32 p1 = firstG[_instanceID][_address].hashPart1;
    bytes32 p2 = firstG[_instanceID][_address].hashPart2;
    bytes32 p3 = firstG[_instanceID][_address].hashPart3;
    bytes32 p4 = secondG[_instanceID][_address].hashPart1;
    bytes32 p5 = secondG[_instanceID][_address].hashPart2;
    bytes32 p6 = secondG[_instanceID][_address].hashPart3;
    bytes memory joined = new bytes(64);
    assembly {
      mstore(add(joined, 32), p1)
      mstore(add(joined, 64), p2)
    }
    bytes memory joinedsec = new bytes(64);
    assembly {
      mstore(add(joinedsec, 32), p4)
      mstore(add(joinedsec, 64), p5)
    }

    return (joined, p3, joinedsec, p6);
  }

  function setPublicParameters(uint64 _instanceID, bytes32 _hash1, bytes32 _hash2) public {
    parameters[_instanceID][msg.sender].hashPart1 = _hash1;
    parameters[_instanceID][msg.sender].hashPart2 = _hash2;
  }

  function getPublicParameters(address _address, uint64 _instanceID) public view returns (bytes memory) {
    bytes32 p1 = parameters[_instanceID][_address].hashPart1;
    bytes32 p2 = parameters[_instanceID][_address].hashPart2;
    bytes memory joined = new bytes(64);
    assembly {
      mstore(add(joined, 32), p1)
      mstore(add(joined, 64), p2)
    }
    return joined;
  }

  function setPublicKey(uint64 _instanceID, bytes32 _hash1, bytes32 _hash2) public {
    publicKeys[_instanceID][msg.sender].hashPart1 = _hash1;
    publicKeys[_instanceID][msg.sender].hashPart2 = _hash2;
  }

  function getPublicKey(address _address, uint64 _instanceID) public view returns (bytes memory) {
    bytes32 p2 = publicKeys[_instanceID][_address].hashPart1;
    bytes32 p3 = publicKeys[_instanceID][_address].hashPart2;
    bytes memory joined = new bytes(64);
    assembly {
      mstore(add(joined, 32), p2)
      mstore(add(joined, 64), p3)
    }
      return (joined);
  }

  function setPublicKeyReaders(bytes32 _hash1, bytes32 _hash2) public {
    publicKeysReaders[msg.sender].hashPart1 = _hash1;
    publicKeysReaders[msg.sender].hashPart2 = _hash2;
  }

  function getPublicKeyReaders(address _address) public view returns (bytes memory) {
    bytes32 p2 = publicKeysReaders[_address].hashPart1;
    bytes32 p3 = publicKeysReaders[_address].hashPart2;
    bytes memory joined = new bytes(64);
    assembly {
      mstore(add(joined, 32), p2)
      mstore(add(joined, 64), p3)
    }
      return (joined);
  }

   modifier StateCheck(uint64 instanceId, uint64 msgToExecute, address user){
        bool condition = stateContract.getConfidentialChecks(instanceId, msgToExecute, user);
        require(condition == true, "message not enabled");
        _;
    }


  function setIPFSLink(uint64 instanceId, uint64 _messageID, bytes32 _hash1, bytes32 _hash2, 
  bytes32[] memory publicvarNames, bytes32[] memory publicVarValues) public StateCheck(instanceId, _messageID, msg.sender){
    stateContract.checkEventBased(instanceId, _messageID);        
    allLinks[_messageID].sender = msg.sender;
    allLinks[_messageID].hashPart1 = _hash1;
    allLinks[_messageID].hashPart2 = _hash2;
    //it manages the eventual update of public variables used later for the conditions in exclusive gateways
    stateContract.setPublicvariables(instanceId,  _messageID, publicvarNames, publicVarValues);
    //it sets to COMPLETED the current message and enables the next ones
    stateContract.changeStatus(instanceId,  _messageID);
    emit functionDone(instanceId, _messageID);
  }

  function getIPFSLink(uint64 _messageID) public view returns (address, bytes memory) {
    address sender = allLinks[_messageID].sender;
    bytes32 p1 = allLinks[_messageID].hashPart1;
    bytes32 p2 = allLinks[_messageID].hashPart2;
    bytes memory joined = new bytes(64);
    assembly {
      mstore(add(joined, 32), p1)
      mstore(add(joined, 64), p2)
    }
    return (sender, joined);
  }

  function setUserAttributes(uint64 _instanceID, bytes32 _hash1, bytes32 _hash2) public {
    allUsers[_instanceID].hashPart1 = _hash1;
    allUsers[_instanceID].hashPart2 = _hash2;
  }

  function getUserAttributes(uint64 _instanceID) public view returns (bytes memory) {
    bytes32 p1 = allUsers[_instanceID].hashPart1;
    bytes32 p2 = allUsers[_instanceID].hashPart2;
    bytes memory joined = new bytes(64);
    assembly {
      mstore(add(joined, 32), p1)
      mstore(add(joined, 64), p2)
    }
    return joined;
  }
  
  // Function called by an actor to notify the authorities to send their decryption key
  function notifyAuthorities(uint64 _instanceID, address[] memory _authorities) public {
      // Emit the event with the process_id, sender's address, and the list of authorities
      emit AuthoritiesNotified(_instanceID, msg.sender, _authorities);
  }
}
