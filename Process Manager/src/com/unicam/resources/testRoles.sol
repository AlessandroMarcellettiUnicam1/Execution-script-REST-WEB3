 pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract testRoles{
	event functionDone(string);
	enum State {DISABLED, ENABLED, DONE} State s; 
	struct Element{
			string ID;
		State status;
	}
		struct StateMemory{
	bool insuranceReq;
string bikeId;
string description;
bool ask;
 uint amount;
uint credits;
string data;
string feedback;
string voucherId;
 string bike_Id;
uint insuranceCost;
string voucherData;
string bikeType;
bool isAvailable;
 uint cost;
string insuranceData;
}
	Element[29] elements;
	  StateMemory currentMemory;
	string[3] roleList = [ "READER_SUPPLIER1", "DATAOWNER_MANUFACTURER", "READER_SUPPLIER2" ]; 
	mapping(string=>address payable) roles; 
constructor() public{
        elements[1] = Element("StartEvent_0gb8jks", State.ENABLED);
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["READER_SUPPLIER1"] = 0x62AbA4475128080Dd4B59FA5D7E2fAEb2B720A21;
	roles["DATAOWNER_MANUFACTURER"] = 0x62AbA4475128080Dd4B59FA5D7E2fAEb2B720A21;
	roles["READER_SUPPLIER2"] = 0x62AbA4475128080Dd4B59FA5D7E2fAEb2B720A21;
		//enable the start process
		StartEvent_0gb8jks();
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
    
} function StartEvent_0gb8jks() private {
	require(elements[1].status==State.ENABLED);
	done(1);
	enable("ExclusiveGateway_0uhgcse",2);
ExclusiveGateway_0uhgcse (); 
}

function ExclusiveGateway_0uhgcse() private {
		require(elements[2].status==State.ENABLED);
		done(2);
	enable("Message_02ckm6k", 3);  
}

function ExclusiveGateway_1e98v4d() private {
		require(elements[4].status==State.ENABLED);
		done(4);
if(currentMemory.isAvailable==false){enable("ExclusiveGateway_0uhgcse", 2); 
 ExclusiveGateway_0uhgcse(); 
}
else if(currentMemory.isAvailable==true){enable("Message_0l75vce", 5); 
 }
}

function Message_0l75vce(bool insuranceReq) public checkRole(roleList[1]) {
	require(elements[5].status==State.ENABLED);  
	done(5);
currentMemory.insuranceReq=insuranceReq;
	enable("ExclusiveGateway_05xdg8u",6);
ExclusiveGateway_05xdg8u(); 
}

function Message_0hzpgno(string memory bikeId) public checkRole(roleList[0]) {
	require(elements[7].status==State.ENABLED);  
	done(7);
currentMemory.bikeId=bikeId;
	enable("EventBasedGateway_1nphygh",8);
EventBasedGateway_1nphygh(); 
}

function EventBasedGateway_1nphygh() private {
	require(elements[8].status==State.ENABLED);
	done(8);
	enable("Message_0cq2w1g",9); 
	enable("Message_1989eur",10); 
}

function Message_0cq2w1g(string memory description) public checkRole(roleList[1]) {
	require(elements[9].status==State.ENABLED);  
	done(9);
currentMemory.description=description;
disable(10);
	enable("Message_1ufjjj2",11);
}

function Message_1ufjjj2(bool ask, uint amount) public checkRole(roleList[0]) {
	require(elements[11].status==State.ENABLED);  
	done(11);
currentMemory.ask=ask;
currentMemory.amount=amount;
	enable("ExclusiveGateway_04bkb0l",12);
ExclusiveGateway_04bkb0l(); 
}

function ExclusiveGateway_04bkb0l() private {
		require(elements[12].status==State.ENABLED);
		done(12);
if(currentMemory.ask==true){enable("Message_0to30q0", 13); 
 }
else if(currentMemory.ask==false){enable("ExclusiveGateway_0cfvdeh", 14); 
 ExclusiveGateway_0cfvdeh(); 
}
}

function Message_0to30q0() public payable checkRole(roleList[1]) {
	require(elements[13].status==State.ENABLED);
	done(13);
roles["READER_SUPPLIER1"].transfer(msg.value);
	enable("ExclusiveGateway_0cfvdeh",14);
ExclusiveGateway_0cfvdeh(); 
}

function ExclusiveGateway_0cfvdeh() private {
		require(elements[14].status==State.ENABLED);
		done(14);
	enable("ExclusiveGateway_1ksw1j2", 15);  
ExclusiveGateway_1ksw1j2(); 
}

function Message_0g4xpdf(uint credits) public checkRole(roleList[0]) {
	require(elements[16].status==State.ENABLED);  
	done(16);
currentMemory.credits=credits;
	enable("ParallelGateway_0himv1h",17);
ParallelGateway_0himv1h(); 
}

function Message_0is10sh(string memory data) public checkRole(roleList[0]) {
	require(elements[18].status==State.ENABLED);  
	done(18);
currentMemory.data=data;
	enable("ParallelGateway_0himv1h",17);
ParallelGateway_0himv1h(); 
}

function ParallelGateway_0himv1h() private { 
	require(elements[17].status==State.ENABLED);
	done(17);
	if( elements[18].status==State.DONE && elements[16].status==State.DONE ) { 
	enable("EndEvent_11pwcmo", 19); 
EndEvent_11pwcmo(); 
}} 

function EndEvent_11pwcmo() private {
	require(elements[19].status==State.ENABLED);
	done(19);  }

function Message_1989eur(string memory feedback) public checkRole(roleList[1]) {
	require(elements[10].status==State.ENABLED);  
	done(10);
currentMemory.feedback=feedback;
disable(9);
	enable("ExclusiveGateway_1ksw1j2",15);
ExclusiveGateway_1ksw1j2(); 
}

function ParallelGateway_0yw95j2() private { 
	require(elements[20].status==State.ENABLED);
	done(20);
	enable("Message_0g4xpdf", 16); 
	enable("Message_0is10sh", 18); 
}

function ExclusiveGateway_1ksw1j2() private {
		require(elements[15].status==State.ENABLED);
		done(15);
	enable("Message_1dp5xa4", 21);  
}

function Message_1dp5xa4(string memory voucherId, string memory bike_Id) public checkRole(roleList[1]) {
	require(elements[21].status==State.ENABLED);  
	done(21);
currentMemory.voucherId=voucherId;
currentMemory.bike_Id=bike_Id;
	enable("ParallelGateway_0yw95j2",20);
ParallelGateway_0yw95j2(); 
}

function ExclusiveGateway_0wc677m() private {
		require(elements[22].status==State.ENABLED);
		done(22);
	enable("Message_0nkjynd", 23);  
}

function Message_009a0bz(uint insuranceCost) public checkRole(roleList[0]) {
	require(elements[24].status==State.ENABLED);  
	done(24);
currentMemory.insuranceCost=insuranceCost;
	enable("Message_0psi2ab",25);
}

function Message_0nkjynd() public payable checkRole(roleList[1]) {
	require(elements[23].status==State.ENABLED);  
	done(23);
roles["READER_SUPPLIER1"].transfer(msg.value);
	enable("Message_0b1e9t1",26);
}
function Message_0b1e9t1(string memory voucherData) public checkRole(roleList[0]){
	require(elements[26].status==State.ENABLED);
	done(26);
currentMemory.voucherData=voucherData;
	enable("Message_0hzpgno",7);
}

function ExclusiveGateway_05xdg8u() private {
		require(elements[6].status==State.ENABLED);
		done(6);
if(currentMemory.insuranceReq==false){enable("ExclusiveGateway_0wc677m", 22); 
 ExclusiveGateway_0wc677m(); 
}
else if(currentMemory.insuranceReq==true){enable("Message_009a0bz", 24); 
 }
}

function Message_02ckm6k(string memory bikeType) public checkRole(roleList[1]) {
	require(elements[3].status==State.ENABLED);  
	done(3);
currentMemory.bikeType=bikeType;
	enable("Message_06bv1qa",27);
}

function Message_06bv1qa(bool isAvailable, uint cost) public checkRole(roleList[0]) {
	require(elements[27].status==State.ENABLED);  
	done(27);
currentMemory.isAvailable=isAvailable;
currentMemory.cost=cost;
	enable("ExclusiveGateway_1e98v4d",4);
ExclusiveGateway_1e98v4d(); 
}

function Message_0psi2ab() public payable checkRole(roleList[1]) {
	require(elements[25].status==State.ENABLED);  
	done(25);
roles["READER_SUPPLIER2"].transfer(msg.value);
	enable("Message_0lvlunm",28);
}
function Message_0lvlunm(string memory insuranceData) public checkRole(roleList[2]){
	require(elements[28].status==State.ENABLED);
	done(28);
currentMemory.insuranceData=insuranceData;
	enable("ExclusiveGateway_0wc677m",22);
ExclusiveGateway_0wc677m(); 
}

	function enable(string memory _taskID, uint position) internal {
		elements[position] = Element(_taskID, State.ENABLED);
	}
    function disable(uint elementNum) internal {
		elements[elementNum].status=State.DISABLED; }

    function done(uint elementNum) internal {
 		elements[elementNum].status=State.DONE; 			emit functionDone(elements[elementNum].ID);
		 }
   
    function getCurrentState()public view  returns(Element[29] memory, StateMemory memory){
        // emit stateChanged(elements, currentMemory);
        return (elements, currentMemory);
    }
    
    function compareStrings (string memory a, string memory b) internal pure returns (bool) { 
        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); 
    }
}