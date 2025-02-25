 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract hotelbooking{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	uint quotation;
bool confirmation;
string date;
 uint people;
bool confirm;
 uint rooms_number;
string motivation;
string booking_id;
string receipt;
}
	Element[17] elements;
	  StateMemory currentMemory;
	string[2] roleList = [ "Client", "Hotel" ]; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[8] = Element("StartEvent_1jtgn3j", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Client"] = 0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354;
	roles["Hotel"] = 0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354;
		//enable the start process
		StartEvent_1jtgn3j();
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
    
} function ExclusiveGateway_106je4z() private {
		require(elements[1].status==State.ENABLED);
		done(1);
if(currentMemory.confirm==true){enable("Message_1em0ee4", 2); 
 }
else if(currentMemory.confirm==false){enable("ExclusiveGateway_0hs3ztq", 3); 
 ExclusiveGateway_0hs3ztq(); 
}
}

function Message_1em0ee4(uint quotation) public checkRole(roleList[1]){
	require(elements[2].status==State.ENABLED);  
	done(2);
	enable("Message_1nlagx2",4);
currentMemory.quotation=quotation;
}
function Message_1nlagx2(bool confirmation) public checkRole(roleList[0]){
	require(elements[4].status==State.ENABLED);
	done(4);
currentMemory.confirmation=confirmation;
	enable("EventBasedGateway_1fxpmyn",5);
EventBasedGateway_1fxpmyn(); 
}

function Message_045i10y(string memory date, uint people) public checkRole(roleList[0]){
	require(elements[6].status==State.ENABLED);  
	done(6);
	enable("Message_0r9lypd",7);
currentMemory.date=date;
currentMemory.people=people;
}
function Message_0r9lypd(bool confirm, uint rooms_number) public checkRole(roleList[1]){
	require(elements[7].status==State.ENABLED);
	done(7);
currentMemory.confirm=confirm;
currentMemory.rooms_number=rooms_number;
	enable("ExclusiveGateway_106je4z",1);
ExclusiveGateway_106je4z(); 
}

function ExclusiveGateway_0hs3ztq() private {
		require(elements[3].status==State.ENABLED);
		done(3);
	enable("Message_045i10y", 6);  
}

function StartEvent_1jtgn3j() private {
	require(elements[8].status==State.ENABLED);
	done(8);
	enable("ExclusiveGateway_0hs3ztq",3);
ExclusiveGateway_0hs3ztq (); 
}

function EventBasedGateway_1fxpmyn() private {
	require(elements[5].status==State.ENABLED);
	done(5);
	enable("Message_0o8eyir",9); 
	enable("Message_1xm9dxy",10); 
}

function Message_0o8eyir(address payable to) public payable checkRole(roleList[0]) {
	require(elements[9].status==State.ENABLED);
	done(9);
roles["Hotel"].transfer(msg.value);
disable(10);
	enable("Gateway_0dmg4dd",11);
Gateway_0dmg4dd(); 
}

function Message_1xm9dxy(string memory motivation) public checkRole(roleList[0]) {
	require(elements[10].status==State.ENABLED);  
	done(10);
currentMemory.motivation=motivation;
disable(9);
	enable("EndEvent_0366pfz",12);
EndEvent_0366pfz(); 
}

function EndEvent_0366pfz() private {
	require(elements[12].status==State.ENABLED);
	done(12);  }

function Gateway_0dmg4dd() private { 
	require(elements[11].status==State.ENABLED);
	done(11);
	enable("Message_1ljlm4g", 13); 
	enable("Message_05isfw9", 14); 
}

function Message_1ljlm4g(string memory booking_id) public checkRole(roleList[1]) {
	require(elements[13].status==State.ENABLED);  
	done(13);
currentMemory.booking_id=booking_id;
	enable("Gateway_1m0ia08",15);
Gateway_1m0ia08(); 
}

function Message_05isfw9(string memory receipt) public checkRole(roleList[1]) {
	require(elements[14].status==State.ENABLED);  
	done(14);
currentMemory.receipt=receipt;
	enable("Gateway_1m0ia08",15);
Gateway_1m0ia08(); 
}

function Gateway_1m0ia08() private { 
	require(elements[15].status==State.ENABLED);
	done(15);
	if( elements[13].status==State.DONE && elements[14].status==State.DONE ) { 
	enable("Event_13y41ry", 16); 
Event_13y41ry(); 
}} 

function Event_13y41ry() private {
	require(elements[16].status==State.ENABLED);
	done(16);  }

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