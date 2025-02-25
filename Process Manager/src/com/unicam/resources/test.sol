 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract Test{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	uint c;
}
	Element[4] elements;
	  StateMemory currentMemory;
	string[2] roleList = [ "Participant 1", "Participant 2" ]; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[1] = Element("StartEvent_0nb2y4q", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Participant 1"] = 0x762721c2e53C69De94449101815928fC17b2A64C;
	roles["Participant 2"] = 0x762721c2e53C69De94449101815928fC17b2A64C;
		//enable the start process
		StartEvent_0nb2y4q();
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
    
} function StartEvent_0nb2y4q() private {
	require(elements[1].status==State.ENABLED);
	done(1);
	enable("Message_0p0s1dt",2);

}

function Message_0p0s1dt(uint c) public checkRole(roleList[0]) {
	require(elements[2].status==State.ENABLED);  
	done(2);
currentMemory.c=c;
	enable("EndEvent_0lf51kf",3);
EndEvent_0lf51kf(); 
}

function EndEvent_0lf51kf() private {
	require(elements[3].status==State.ENABLED);
	done(3);  }

	function enable(string memory _taskID, uint position) internal {
		elements[position] = Element(_taskID, State.ENABLED);
	}
    function disable(uint elementNum) internal {
		elements[elementNum].status=State.DISABLED; }

    function done(uint elementNum) internal {
 		elements[elementNum].status=State.DONE; 			emit functionDone(elements[elementNum].ID);
		 }
   
    function getCurrentState()public view  returns(Element[4] memory, StateMemory memory){
        // emit stateChanged(elements, currentMemory);
        return (elements, currentMemory);
    }
    
    function compareStrings (string memory a, string memory b) internal pure returns (bool) { 
        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); 
    }
}