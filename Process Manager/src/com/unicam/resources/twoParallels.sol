 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract twoParallels{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	bool par1;
}
	Element[8] elements;
	  StateMemory currentMemory;
	string[2] roleList = [ "Participant 1", "Participant 2" ]; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[1] = Element("StartEvent_0v61avy", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Participant 1"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
	roles["Participant 2"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
		//enable the start process
		StartEvent_0v61avy();
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
    
} function StartEvent_0v61avy() private {
	require(elements[1].status==State.ENABLED);
	done(1);
	enable("Message_0vhsbc7",2);

}

function Message_0vhsbc7(bool par1) public checkRole(roleList[0]) {
	require(elements[2].status==State.ENABLED);  
	done(2);
currentMemory.par1=par1;
	enable("ParallelGateway_0outchh",3);
ParallelGateway_0outchh(); 
}

function ParallelGateway_0outchh() private { 
	require(elements[3].status==State.ENABLED);
	done(3);
	enable("EndEvent_0z1pg3r", 4); 
EndEvent_0z1pg3r(); 
	enable("ParallelGateway_187d31l", 5); 
ParallelGateway_187d31l(); 
}

function EndEvent_0z1pg3r() private {
	require(elements[4].status==State.ENABLED);
	done(4);  }

function ParallelGateway_187d31l() private { 
	require(elements[5].status==State.ENABLED);
	done(5);
	enable("EndEvent_0vb0knf", 6); 
EndEvent_0vb0knf(); 
	enable("EndEvent_1vc8ok1", 7); 
EndEvent_1vc8ok1(); 
}

function EndEvent_0vb0knf() private {
	require(elements[6].status==State.ENABLED);
	done(6);  }

function EndEvent_1vc8ok1() private {
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