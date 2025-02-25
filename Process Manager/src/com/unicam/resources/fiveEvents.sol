 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract fiveEvents{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	bool par2;
bool par1;
bool par4;
bool par3;
bool par5;
bool par6;
}
	Element[14] elements;
	  StateMemory currentMemory;
	string[2] roleList = [ "Participant 1", "Participant 2" ]; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[7] = Element("StartEvent_0e2atjt", State.ENABLED);
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
disable(3);
disable(4);
disable(5);
	enable("EndEvent_1yen5a7",6);
EndEvent_1yen5a7(); 
}

function EndEvent_1yen5a7() private {
	require(elements[6].status==State.ENABLED);
	done(6);  }

function StartEvent_0e2atjt() private {
	require(elements[7].status==State.ENABLED);
	done(7);
	enable("Message_1pqowxs",8);

}

function Message_1pqowxs(bool par1) public checkRole(roleList[0]) {
	require(elements[8].status==State.ENABLED);  
	done(8);
currentMemory.par1=par1;
	enable("EventBasedGateway_0n7mixr",9);
EventBasedGateway_0n7mixr(); 
}

function Message_0im6k58(bool par4) public checkRole(roleList[1]) {
	require(elements[2].status==State.ENABLED);  
	done(2);
currentMemory.par4=par4;
disable(1);
disable(3);
disable(4);
disable(5);
	enable("EndEvent_0sdqc38",10);
EndEvent_0sdqc38(); 
}

function EventBasedGateway_0n7mixr() private {
	require(elements[9].status==State.ENABLED);
	done(9);
	enable("Message_0p8ty97",1); 
	enable("Message_0im6k58",2); 
	enable("Message_0ufltsl",3); 
	enable("Message_0o3i81e",4); 
	enable("Message_0hf92hp",5); 
}

function Message_0ufltsl(bool par3) public checkRole(roleList[1]) {
	require(elements[3].status==State.ENABLED);  
	done(3);
currentMemory.par3=par3;
disable(1);
disable(2);
disable(4);
disable(5);
	enable("EndEvent_08ry8wd",11);
EndEvent_08ry8wd(); 
}

function EndEvent_08ry8wd() private {
	require(elements[11].status==State.ENABLED);
	done(11);  }

function EndEvent_0sdqc38() private {
	require(elements[10].status==State.ENABLED);
	done(10);  }

function EndEvent_0g3qwfs() private {
	require(elements[12].status==State.ENABLED);
	done(12);  }

function EndEvent_1e2y54c() private {
	require(elements[13].status==State.ENABLED);
	done(13);  }

function Message_0o3i81e(bool par5) public checkRole(roleList[1]) {
	require(elements[4].status==State.ENABLED);  
	done(4);
currentMemory.par5=par5;
disable(1);
disable(2);
disable(3);
disable(5);
	enable("EndEvent_0g3qwfs",12);
EndEvent_0g3qwfs(); 
}

function Message_0hf92hp(bool par6) public checkRole(roleList[1]) {
	require(elements[5].status==State.ENABLED);  
	done(5);
currentMemory.par6=par6;
disable(1);
disable(2);
disable(3);
disable(4);
	enable("EndEvent_1e2y54c",13);
EndEvent_1e2y54c(); 
}

	function enable(string memory _taskID, uint position) internal {
		elements[position] = Element(_taskID, State.ENABLED);
	}
    function disable(uint elementNum) internal {
		elements[elementNum].status=State.DISABLED; }

    function done(uint elementNum) internal {
 		elements[elementNum].status=State.DONE; 			emit functionDone(elements[elementNum].ID);
		 }
   
    function getCurrentState()public view  returns(Element[14] memory, StateMemory memory){
        // emit stateChanged(elements, currentMemory);
        return (elements, currentMemory);
    }
    
    function compareStrings (string memory a, string memory b) internal pure returns (bool) { 
        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); 
    }
}