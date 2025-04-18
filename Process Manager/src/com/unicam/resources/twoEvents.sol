 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract twoEvents{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	bool par2;
bool par1;
bool par3;
}
	Element[8] elements;
	  StateMemory currentMemory;
	string[2] roleList = [ "Participant 1", "Participant 2" ]; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[4] = Element("StartEvent_0e2atjt", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Participant 1"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
	roles["Participant 2"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
		//enable the start process
		StartEvent_0e2atjt();
		emit functionDone("Contract creation");
	}
modifier checkRole(string memory role){ 
	require(msg.sender == roles[role]);
_; 

} function getRoles() public view returns( string[] memory, address[] memory){
    uint c = roleList.length;
    string[] memory allRoles = new string[](c);
    address[] memory allAddresses = new address[](c);
    
    for(uint i = 0; i < roleList.length; i ++){
        allRoles[i] = roleList[i];
        allAddresses[i] = roles[roleList[i]];
    }
    return (allRoles, allAddresses);
}
function() external payable{
    
} function Message_0p8ty97(bool par2) public checkRole(roleList[0]) {
	require(elements[1].status==State.ENABLED);  
	done(1);
currentMemory.par2=par2;
disable(2);
	enable("EndEvent_1yen5a7",3);
EndEvent_1yen5a7(); 
}

function EndEvent_1yen5a7() private {
	require(elements[3].status==State.ENABLED);
	done(3);  }

function StartEvent_0e2atjt() private {
	require(elements[4].status==State.ENABLED);
	done(4);
	enable("Message_1pqowxs",5);

}

function Message_1pqowxs(bool par1) public checkRole(roleList[0]) {
	require(elements[5].status==State.ENABLED);  
	done(5);
currentMemory.par1=par1;
	enable("EventBasedGateway_0n7mixr",6);
EventBasedGateway_0n7mixr(); 
}

function EventBasedGateway_0n7mixr() private {
	require(elements[6].status==State.ENABLED);
	done(6);
	enable("Message_0p8ty97",1); 
	enable("Message_0ufltsl",2); 
}

function Message_0ufltsl(bool par3) public checkRole(roleList[1]) {
	require(elements[2].status==State.ENABLED);  
	done(2);
currentMemory.par3=par3;
disable(1);
	enable("EndEvent_08ry8wd",7);
EndEvent_08ry8wd(); 
}

function EndEvent_08ry8wd() private {
	require(elements[7].status==State.ENABLED);
	done(7);  }

	function enable(string memory _taskID, uint position) internal {
		elements[position] = Element(_taskID, State.ENABLED);
	}
    function disable(uint elementNum) internal {
		elements[elementNum].status=State.DISABLED; }

    function done(uint elementNum) internal {
 		elements[elementNum].status=State.DONE; 			emit functionDone(elements[elementNum].ID);
		 }
   
    function getCurrentState()public view  returns(Element[8] memory, StateMemory memory){
        // emit stateChanged(elements, currentMemory);
        return (elements, currentMemory);
    }
    
    function compareStrings (string memory a, string memory b) internal pure returns (bool) { 
        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); 
    }
}