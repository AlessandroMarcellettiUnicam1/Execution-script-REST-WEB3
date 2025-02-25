 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract RetailProcessExp{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	string good;
 uint amount;
uint price;
 bool isAvailable;
string product;
 uint quantity;
uint cost;
string shipment_address;
string shipInfo;
string orderDetail;
string customerAddres;
string customerShipment;
string orderID;
}
	Element[17] elements;
	  StateMemory currentMemory;
	string[1] roleList = [ "Retailer" ]; 
	string[2] optionalList = ["Customer", "Producer" ];
	 mapping(string=>address payable) optionalRoles; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[1] = Element("StartEvent_102vawy", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Retailer"] = 0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354;
	optionalRoles["Customer"] = 0x0000000000000000000000000000000000000000;	optionalRoles["Producer"] = 0x0000000000000000000000000000000000000000;		//enable the start process
		StartEvent_102vawy();
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
    
} function StartEvent_102vawy() private {
	require(elements[1].status==State.ENABLED);
	done(1);
	enable("Message_0b917rc",2);

}

function Message_0b917rc(string memory good, uint amount) public checkRole(optionalList[0]){
	require(elements[2].status==State.ENABLED);  
	done(2);
	enable("Message_1xxdwx2",3);
currentMemory.good=good;
currentMemory.amount=amount;
}
function Message_1xxdwx2(uint price, bool isAvailable) public checkRole(roleList[0]){
	require(elements[3].status==State.ENABLED);
	done(3);
currentMemory.price=price;
currentMemory.isAvailable=isAvailable;
	enable("ExclusiveGateway_042aut8",4);
ExclusiveGateway_042aut8(); 
}

function ExclusiveGateway_042aut8() private {
		require(elements[4].status==State.ENABLED);
		done(4);
if(currentMemory.isAvailable==false){enable("Message_1h3ew61", 5); 
 }
else if(currentMemory.isAvailable==true){enable("ExclusiveGateway_1johog7", 6); 
 ExclusiveGateway_1johog7(); 
}
}

function Message_1h3ew61(string memory product, uint quantity) public checkRole(roleList[0]){
	require(elements[5].status==State.ENABLED);  
	done(5);
	enable("Message_0e75g56",7);
currentMemory.product=product;
currentMemory.quantity=quantity;
}
function Message_0e75g56(uint cost) public checkRole(optionalList[1]){
	require(elements[7].status==State.ENABLED);
	done(7);
currentMemory.cost=cost;
	enable("Message_1v7cac0",8);
}

function ExclusiveGateway_1johog7() private {
		require(elements[6].status==State.ENABLED);
		done(6);
	enable("Message_1k6i83o", 9);  
}

function Message_1wrru53(string memory shipment_address) public checkRole(roleList[0]){
	require(elements[10].status==State.ENABLED);  
	done(10);
	enable("Message_1tq0g6g",11);
currentMemory.shipment_address=shipment_address;
}
function Message_1tq0g6g(string memory shipInfo) public checkRole(optionalList[1]){
	require(elements[11].status==State.ENABLED);
	done(11);
currentMemory.shipInfo=shipInfo;
	enable("ExclusiveGateway_1johog7",6);
ExclusiveGateway_1johog7(); 
}

function Message_1k6i83o() public payable checkRole(optionalList[0]) {
	require(elements[9].status==State.ENABLED);  
	done(9);
roles["Retailer"].transfer(msg.value);
	enable("Message_1lw6tm2",12);
}
function Message_1lw6tm2(string memory orderDetail) public checkRole(roleList[0]){
	require(elements[12].status==State.ENABLED);
	done(12);
currentMemory.orderDetail=orderDetail;
	enable("Message_0xbt4mx",13);
}

function Message_0xbt4mx(string memory customerAddres) public checkRole(optionalList[0]){
	require(elements[13].status==State.ENABLED);  
	done(13);
	enable("Message_0ekydcg",14);
currentMemory.customerAddres=customerAddres;
}
function Message_0ekydcg(string memory customerShipment) public checkRole(roleList[0]){
	require(elements[14].status==State.ENABLED);
	done(14);
currentMemory.customerShipment=customerShipment;
	enable("EndEvent_0eqppri",15);
EndEvent_0eqppri(); 
}

function EndEvent_0eqppri() private {
	require(elements[15].status==State.ENABLED);
	done(15);  }

function Message_1v7cac0() public payable checkRole(roleList[0]) {
	require(elements[8].status==State.ENABLED);  
	done(8);
optionalRoles["Producer"].transfer(msg.value);
	enable("Message_1vdzv5y",16);
}
function Message_1vdzv5y(string memory orderID) public checkRole(optionalList[1]){
	require(elements[16].status==State.ENABLED);
	done(16);
currentMemory.orderID=orderID;
	enable("Message_1wrru53",10);
}

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