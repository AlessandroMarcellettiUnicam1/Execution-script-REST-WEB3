 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract process{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	string order;
string placed_order;
string fwd_order;
string transport_order;
string req_details;
string prov_details;
string waybill;
string del_order;
string report;
string deliver;
}
	Element[15] elements;
	  StateMemory currentMemory;
	string[5] roleList = [ "Special carrier", "Bulk buyer", "Middleman", "Manufacturer", "Supplier" ]; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[1] = Element("Event_1dbiauq", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Special carrier"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
	roles["Bulk buyer"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
	roles["Middleman"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
	roles["Manufacturer"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
	roles["Supplier"] = 0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0;
		//enable the start process
		Event_1dbiauq();
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
    
} function Event_1dbiauq() private {
	require(elements[1].status==State.ENABLED);
	done(1);
	enable("Message_1rxxmav",2);

}

function Message_1rxxmav(string memory order) public checkRole(roleList[1]) {
	require(elements[2].status==State.ENABLED);  
	done(2);
currentMemory.order=order;
	enable("Message_1sh89cl",3);
}

function Message_1sh89cl(string memory placed_order) public checkRole(roleList[3]) {
	require(elements[3].status==State.ENABLED);  
	done(3);
currentMemory.placed_order=placed_order;
	enable("Gateway_06ro0vg",4);
Gateway_06ro0vg(); 
}

function Gateway_06ro0vg() private { 
	require(elements[4].status==State.ENABLED);
	done(4);
	enable("Message_0sdet47", 5); 
	enable("Message_1kacyby", 6); 
}

function Message_0sdet47(string memory fwd_order) public checkRole(roleList[2]) {
	require(elements[5].status==State.ENABLED);  
	done(5);
currentMemory.fwd_order=fwd_order;
	enable("Gateway_181g1xe",7);
Gateway_181g1xe(); 
}

function Message_1kacyby(string memory transport_order) public checkRole(roleList[2]) {
	require(elements[6].status==State.ENABLED);  
	done(6);
currentMemory.transport_order=transport_order;
	enable("Gateway_181g1xe",7);
Gateway_181g1xe(); 
}

function Gateway_181g1xe() private { 
	require(elements[7].status==State.ENABLED);
	done(7);
	if( elements[5].status==State.DONE && elements[6].status==State.DONE ) { 
	enable("Message_1txqx13", 8); 
}} 

function Message_1txqx13(string memory req_details) public checkRole(roleList[0]) {
	require(elements[8].status==State.ENABLED);  
	done(8);
currentMemory.req_details=req_details;
	enable("Message_0b73gfv",9);
}

function Message_0b73gfv(string memory prov_details) public checkRole(roleList[4]) {
	require(elements[9].status==State.ENABLED);  
	done(9);
currentMemory.prov_details=prov_details;
	enable("Message_1s263cb",10);
}

function Message_1s263cb(string memory waybill) public checkRole(roleList[4]) {
	require(elements[10].status==State.ENABLED);  
	done(10);
currentMemory.waybill=waybill;
	enable("Message_0tc36iv",11);
}

function Message_0tc36iv(string memory del_order) public checkRole(roleList[0]) {
	require(elements[11].status==State.ENABLED);  
	done(11);
currentMemory.del_order=del_order;
	enable("Message_1fh103z",12);
}

function Message_1fh103z(string memory report) public checkRole(roleList[3]) {
	require(elements[12].status==State.ENABLED);  
	done(12);
currentMemory.report=report;
	enable("Message_0d2vwmq",13);
}

function Message_0d2vwmq(string memory deliver) public checkRole(roleList[3]) {
	require(elements[13].status==State.ENABLED);  
	done(13);
currentMemory.deliver=deliver;
	enable("Event_1mcddbu",14);
Event_1mcddbu(); 
}

function Event_1mcddbu() private {
	require(elements[14].status==State.ENABLED);
	done(14);  }

	function enable(string memory _taskID, uint position) internal {
		elements[position] = Element(_taskID, State.ENABLED);
	}
    function disable(uint elementNum) internal {
		elements[elementNum].status=State.DISABLED; }

    function done(uint elementNum) internal {
 		elements[elementNum].status=State.DONE; 			emit functionDone(elements[elementNum].ID);
		 }
   
    function getCurrentState()public view  returns(Element[15] memory, StateMemory memory){
        // emit stateChanged(elements, currentMemory);
        return (elements, currentMemory);
    }
    
    function compareStrings (string memory a, string memory b) internal pure returns (bool) { 
        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); 
    }
}