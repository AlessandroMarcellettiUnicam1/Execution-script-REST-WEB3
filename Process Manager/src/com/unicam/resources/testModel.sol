 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract testModel{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	bool ciao;
}
	Element[4] elements;
	  StateMemory currentMemory;
	string[1] roleList = [ "Participant 1" ]; 
	string[1] optionalList = ["Participant 2" ];
	 mapping(string=>address payable) optionalRoles; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[1] = Element("StartEvent_0hw9kmp", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Participant 1"] = 0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354;
	optionalRoles["Participant 2"] = 0x0000000000000000000000000000000000000000;		//enable the start process
		StartEvent_0hw9kmp();
		emit functionDone("Contract creation");
	}
modifier checkRole(string memory role){ 
	require(msg.sender == roles[role] || msg.sender == optionalRoles[role] 
);
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
   function getOptionalRoles() public view returns( string[] memory, address[] memory){
       require(optionalList.length > 0);
       uint c = optionalList.length;
       string[] memory allRoles = new string[](c);
       address[] memory allAddresses = new address[](c);
       
       for(uint i = 0; i < optionalList.length; i ++){
           allRoles[i] = optionalList[i];
           allAddresses[i] = optionalRoles[optionalList[i]];
       }
    
       return (allRoles, allAddresses);
   }

function subscribe_as_participant(string memory _role) public {
        if(optionalRoles[_role]==0x0000000000000000000000000000000000000000){
          optionalRoles[_role]=msg.sender;
        }
    }
function() external payable{
    
} function StartEvent_0hw9kmp() private {
	require(elements[1].status==State.ENABLED);
	done(1);
	enable("Message_0wlrs4d",2);

}

function Message_0wlrs4d(bool ciao) public checkRole(roleList[0]) {
	require(elements[2].status==State.ENABLED);  
	done(2);
currentMemory.ciao=ciao;
	enable("EndEvent_02qhm6q",3);
EndEvent_02qhm6q(); 
}

function EndEvent_02qhm6q() private {
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