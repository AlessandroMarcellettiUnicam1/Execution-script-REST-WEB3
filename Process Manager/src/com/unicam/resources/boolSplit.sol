 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract boolSplit{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	bool a;
}
	Element[14] elements;
	  StateMemory currentMemory;
	string[2] roleList = [ "Participant 1", "Participant 2" ]; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[1] = Element("StartEvent_1wvaru8", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Participant 1"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
	roles["Participant 2"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
		//enable the start process
		StartEvent_1wvaru8();
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
    
} function StartEvent_1wvaru8() private {
	require(elements[1].status==State.ENABLED);
	done(1);
	enable("Message_06vyjz0",2);

}

function Message_06vyjz0(bool a) public checkRole(roleList[0]) {
	require(elements[2].status==State.ENABLED);  
	done(2);
currentMemory.a=a;
	enable("ExclusiveGateway_1krbxrv",3);
ExclusiveGateway_1krbxrv(); 
}

function ExclusiveGateway_1krbxrv() private {
		require(elements[3].status==State.ENABLED);
		done(3);
if(currentMemory.a==false){enable("EndEvent_1vmpzms", 4); 
 EndEvent_1vmpzms(); 
}
else if(currentMemory.a==true){enable("ExclusiveGateway_09po7sd", 5); 
 ExclusiveGateway_09po7sd(); 
}
}

function EndEvent_1vmpzms() private {
	require(elements[4].status==State.ENABLED);
	done(4);  }

function ExclusiveGateway_09po7sd() private {
		require(elements[5].status==State.ENABLED);
		done(5);
if(currentMemory.a==false){enable("EndEvent_1jbw6ut", 6); 
 EndEvent_1jbw6ut(); 
}
else if(currentMemory.a==true){enable("ExclusiveGateway_0jh9tiu", 7); 
 ExclusiveGateway_0jh9tiu(); 
}
}

function EndEvent_1jbw6ut() private {
	require(elements[6].status==State.ENABLED);
	done(6);  }

function ExclusiveGateway_0jh9tiu() private {
		require(elements[7].status==State.ENABLED);
		done(7);
if(currentMemory.a==false){enable("EndEvent_03c9vrj", 8); 
 EndEvent_03c9vrj(); 
}
else if(currentMemory.a==true){enable("ExclusiveGateway_12jgl5c", 9); 
 ExclusiveGateway_12jgl5c(); 
}
}

function EndEvent_03c9vrj() private {
	require(elements[8].status==State.ENABLED);
	done(8);  }

function ExclusiveGateway_12jgl5c() private {
		require(elements[9].status==State.ENABLED);
		done(9);
if(currentMemory.a==true){enable("ExclusiveGateway_15fpq2l", 10); 
 ExclusiveGateway_15fpq2l(); 
}
else if(currentMemory.a==false){enable("EndEvent_1ufg2me", 11); 
 EndEvent_1ufg2me(); 
}
}

function ExclusiveGateway_15fpq2l() private {
		require(elements[10].status==State.ENABLED);
		done(10);
if(currentMemory.a==false){enable("EndEvent_1k8i0ob", 12); 
 EndEvent_1k8i0ob(); 
}
else if(currentMemory.a==true){enable("EndEvent_1qpsd1u", 13); 
 EndEvent_1qpsd1u(); 
}
}

function EndEvent_1ufg2me() private {
	require(elements[11].status==State.ENABLED);
	done(11);  }

function EndEvent_1k8i0ob() private {
	require(elements[12].status==State.ENABLED);
	done(12);  }

function EndEvent_1qpsd1u() private {
	require(elements[13].status==State.ENABLED);
	done(13);  }

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