 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract emergencyResponsee{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	string envionrment_data;
string data;
string report;
 bool real;
string area;
string operational_report;
bool emergency_decision;
string area;
string area1;
}
	Element[17] elements;
	  StateMemory currentMemory;
	string[5] roleList = [ "Fireforce", "Security_guard", "Environment", "Operational_centre", "Police" ]; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[1] = Element("StartEvent_0krg75r", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Fireforce"] = 0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354;
	roles["Security_guard"] = 0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354;
	roles["Environment"] = 0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354;
	roles["Operational_centre"] = 0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354;
	roles["Police"] = 0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354;
		//enable the start process
		StartEvent_0krg75r();
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
    
} function StartEvent_0krg75r() private {
	require(elements[1].status==State.ENABLED);
	done(1);
	enable("Message_1o8gxqk",2);

}

function Message_1o8gxqk(string memory envionrment_data) public checkRole(roleList[2]) {
	require(elements[2].status==State.ENABLED);  
	done(2);
currentMemory.envionrment_data=envionrment_data;
	enable("Message_0nx6amg",3);
}

function Message_0nx6amg(string memory data) public checkRole(roleList[3]){
	require(elements[3].status==State.ENABLED);  
	done(3);
	enable("Message_1kacqb4",4);
currentMemory.data=data;
}
function Message_1kacqb4(string memory report, bool real) public checkRole(roleList[1]){
	require(elements[4].status==State.ENABLED);
	done(4);
currentMemory.report=report;
currentMemory.real=real;
	enable("ExclusiveGateway_1c7o0uq",5);
ExclusiveGateway_1c7o0uq(); 
}

function ExclusiveGateway_1c7o0uq() private {
		require(elements[5].status==State.ENABLED);
		done(5);
if(currentMemory.real == true){enable("Message_03llqct", 6); 
 }
else if(currentMemory.real == false){enable("EndEvent_0dwaxy7", 7); 
 EndEvent_0dwaxy7(); 
}
}

function Message_03llqct(string memory area) public checkRole(roleList[2]) {
	require(elements[6].status==State.ENABLED);  
	done(6);
currentMemory.area=area;
	enable("ExclusiveGateway_0lceem4",8);
ExclusiveGateway_0lceem4(); 
}

function ExclusiveGateway_0lceem4() private {
		require(elements[8].status==State.ENABLED);
		done(8);
	enable("Message_0wgujl1", 9);  
}

function Message_0wgujl1(string memory operational_report) public checkRole(roleList[1]){
	require(elements[9].status==State.ENABLED);  
	done(9);
	enable("Message_0dju1ni",10);
currentMemory.operational_report=operational_report;
}
function Message_0dju1ni(bool emergency_decision) public checkRole(roleList[3]){
	require(elements[10].status==State.ENABLED);
	done(10);
currentMemory.emergency_decision=emergency_decision;
	enable("ExclusiveGateway_136gbik",11);
ExclusiveGateway_136gbik(); 
}

function ExclusiveGateway_136gbik() private {
		require(elements[11].status==State.ENABLED);
		done(11);
if(currentMemory.emergency_decision == true){enable("EndEvent_004h30l", 12); 
 EndEvent_004h30l(); 
}
else if(currentMemory.emergency_decision == false){enable("ParallelGateway_03pzpqz", 13); 
 ParallelGateway_03pzpqz(); 
}
}

function EndEvent_004h30l() private {
	require(elements[12].status==State.ENABLED);
	done(12);  }

function EndEvent_0dwaxy7() private {
	require(elements[7].status==State.ENABLED);
	done(7);  }

function ParallelGateway_03pzpqz() private { 
	require(elements[13].status==State.ENABLED);
	done(13);
	enable("Message_0yif06o", 14); 
	enable("Message_1lp1gqg", 15); 
}

function Message_0yif06o(string memory area) public checkRole(roleList[3]) {
	require(elements[14].status==State.ENABLED);  
	done(14);
currentMemory.area=area;
	enable("ParallelGateway_11k670q",16);
ParallelGateway_11k670q(); 
}

function Message_1lp1gqg(string memory area1) public checkRole(roleList[2]) {
	require(elements[15].status==State.ENABLED);  
	done(15);
currentMemory.area1=area1;
	enable("ParallelGateway_11k670q",16);
ParallelGateway_11k670q(); 
}

function ParallelGateway_11k670q() private { 
	require(elements[16].status==State.ENABLED);
	done(16);
	if( elements[15].status==State.DONE && elements[14].status==State.DONE ) { 
	enable("ExclusiveGateway_0lceem4", 8); 
ExclusiveGateway_0lceem4(); 
}} 

	function enable(string memory _taskID, uint position) internal {
		elements[position] = Element(_taskID, State.ENABLED);
	}
    function disable(uint elementNum) internal {
		elements[elementNum].status=State.DISABLED; }

    function done(uint elementNum) internal {
 		elements[elementNum].status=State.DONE; 			emit functionDone(elements[elementNum].ID);
		 }
   
    function getCurrentState()public view  returns(Element[17] memory, StateMemory memory){
        // emit stateChanged(elements, currentMemory);
        return (elements, currentMemory);
    }
    
    function compareStrings (string memory a, string memory b) internal pure returns (bool) { 
        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); 
    }
}