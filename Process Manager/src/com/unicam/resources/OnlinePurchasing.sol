pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract OnlinePurchasing{
	event stateChanged(Element[] , StateMemory ); 
	mapping (string=>uint) position;

	enum State {DISABLED, ENABLED, DONE} State s; 
	mapping(string => string) operator; 
	struct Element{
	string ID;
	State status;
}
	struct StateMemory{
	string ordername;
string order;
 uint price;
bool accepted;
string withdrawOrder;
string shipAddress;
string cardID;
string shipmentID;
string invoiceInfo;
}
	Element[] elements;
	  StateMemory currentMemory;
	string[] elementsID = ["sid-0EC70E7E-A42A-4C9E-B120-16B25BDACE7A", "sid-cc10ea7f-5f60-4c0f-bd9c-2ebfe801eddd", "sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04", "sid-0daa7f46-4ef3-4fb6-9a4d-316eabd199b5", "sid-da7fdf5d-b390-43ba-8614-c07172058b4a", "sid-E2CFD2E8-7869-4F28-AC83-296ED8FA7D6E", "sid-94C810EF-69BE-4D67-91B8-4A34DF4D1940", "sid-5a9c7685-881d-4f23-9927-3a8219dfe27b", "sid-82c3e732-be0a-4ac5-b7f8-91622fe19ce4", "sid-ec7e7cf9-9a7d-48ca-ba5c-fac0b0320422", "sid-0663CB4E-D3BF-4E12-8D81-D68E9318355F", "sid-859C73C7-F0DD-45ED-AA88-E0DEA0340C91", "sid-2F272EDB-9940-467E-AADC-2B485679AF43", "sid-f759c934-51a1-46c8-8466-1cb711e5560e", "sid-CCD2A372-D382-426E-B823-05F778D4EA44", "sid-094362A8-CC68-4CB6-AC98-74DCF1163997"];
	string[] roleList = [ "Buyer", "Seller" ]; 
	mapping(string=>address) roles; 
constructor() public{
    //struct instantiation
    for (uint i = 0; i < elementsID.length; i ++) {
        elements.push(Element(elementsID[i], State.DISABLED));
        position[elementsID[i]]=i;
    }
         
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Buyer"] = 0x1043217D3beF85bd710007C69307D5232046293a;
	roles["Seller"] = 0x1043217D3beF85bd710007C69307D5232046293a;
         
         //enable the start process
         init();
    }
    modifier checkRole(string storage role) 
{ 
	require(msg.sender == roles[role]); 
	_;}

modifier Owner(string memory task) 
{ 
	require(elements[position[task]].status==State.ENABLED);
	_;
}
function init() internal{
       bool result=true;
       	for(uint i=0; i<roleList.length;i++){
       	     if(roles[roleList[i]]==0x0000000000000000000000000000000000000000){
                result=false;
                break;
            }
       	}
       	if(result){
       	    enable("sid-0EC70E7E-A42A-4C9E-B120-16B25BDACE7A");
				sid_0EC70E7E_A42A_4C9E_B120_16B25BDACE7A();
       	}
   }

function subscribe_as_participant(string memory _role) public {
        if(roles[_role]==0x0000000000000000000000000000000000000000){
          roles[_role]!=msg.sender;
        }
        init();
    }
function sid_0EC70E7E_A42A_4C9E_B120_16B25BDACE7A() private {
	require(elements[position["sid-0EC70E7E-A42A-4C9E-B120-16B25BDACE7A"]].status==State.ENABLED);
	done("sid-0EC70E7E-A42A-4C9E-B120-16B25BDACE7A");
	enable("sid-cc10ea7f-5f60-4c0f-bd9c-2ebfe801eddd");  
	
}

function sid_cc10ea7f_5f60_4c0f_bd9c_2ebfe801eddd(string memory ordername) public checkRole(roleList[0]) {
	require(elements[position["sid-cc10ea7f-5f60-4c0f-bd9c-2ebfe801eddd"]].status==State.ENABLED);  
	done("sid-cc10ea7f-5f60-4c0f-bd9c-2ebfe801eddd");
currentMemory.ordername=ordername;
	enable("sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04");
sid_C240C6E9_F55F_46A5_B1F6_5FC4A0F30B04(); 
}

function sid_C240C6E9_F55F_46A5_B1F6_5FC4A0F30B04() private {
	require(elements[position["sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04"]].status==State.ENABLED);
	done("sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04");
	enable("sid-0daa7f46-4ef3-4fb6-9a4d-316eabd199b5");  
}

function sid_0daa7f46_4ef3_4fb6_9a4d_316eabd199b5(string memory order, uint price) public checkRole(roleList[1]){
	require(elements[position["sid-0daa7f46-4ef3-4fb6-9a4d-316eabd199b5"]].status==State.ENABLED);  
	done("sid-0daa7f46-4ef3-4fb6-9a4d-316eabd199b5");
	enable("sid-da7fdf5d-b390-43ba-8614-c07172058b4a");
currentMemory.order=order;
currentMemory.price=price;
}
function sid_da7fdf5d_b390_43ba_8614_c07172058b4a(bool accepted) public checkRole(roleList[0]){
	require(elements[position["sid-da7fdf5d-b390-43ba-8614-c07172058b4a"]].status==State.ENABLED);
	done("sid-da7fdf5d-b390-43ba-8614-c07172058b4a");
currentMemory.accepted=accepted;
	enable("sid-E2CFD2E8-7869-4F28-AC83-296ED8FA7D6E");
sid_E2CFD2E8_7869_4F28_AC83_296ED8FA7D6E(); 
}

function sid_E2CFD2E8_7869_4F28_AC83_296ED8FA7D6E() private {
	require(elements[position["sid-E2CFD2E8-7869-4F28-AC83-296ED8FA7D6E"]].status==State.ENABLED);
	done("sid-E2CFD2E8-7869-4F28-AC83-296ED8FA7D6E");
if(currentMemory.accepted==false){enable("sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04"); 
 sid_C240C6E9_F55F_46A5_B1F6_5FC4A0F30B04();} 
if(currentMemory.accepted==true){enable("sid-94C810EF-69BE-4D67-91B8-4A34DF4D1940"); 
 sid_94C810EF_69BE_4D67_91B8_4A34DF4D1940();} 
}

function sid_94C810EF_69BE_4D67_91B8_4A34DF4D1940() private {
	require(elements[position["sid-94C810EF-69BE-4D67-91B8-4A34DF4D1940"]].status==State.ENABLED);
	done("sid-94C810EF-69BE-4D67-91B8-4A34DF4D1940");
	enable("sid-5a9c7685-881d-4f23-9927-3a8219dfe27b"); 
	enable("sid-82c3e732-be0a-4ac5-b7f8-91622fe19ce4"); 
}

function sid_5a9c7685_881d_4f23_9927_3a8219dfe27b(string memory withdrawOrder) public checkRole(roleList[0]) {
	require(elements[position["sid-5a9c7685-881d-4f23-9927-3a8219dfe27b"]].status==State.ENABLED);  
	done("sid-5a9c7685-881d-4f23-9927-3a8219dfe27b");
currentMemory.withdrawOrder=withdrawOrder;
disable("sid-82c3e732-be0a-4ac5-b7f8-91622fe19ce4");
	enable("sid-859C73C7-F0DD-45ED-AA88-E0DEA0340C91");
sid_859C73C7_F0DD_45ED_AA88_E0DEA0340C91(); 
}

function sid_82c3e732_be0a_4ac5_b7f8_91622fe19ce4(string memory shipAddress) public checkRole(roleList[0]) {
	require(elements[position["sid-82c3e732-be0a-4ac5-b7f8-91622fe19ce4"]].status==State.ENABLED);  
	done("sid-82c3e732-be0a-4ac5-b7f8-91622fe19ce4");
currentMemory.shipAddress=shipAddress;
disable("sid-5a9c7685-881d-4f23-9927-3a8219dfe27b");
	enable("sid-ec7e7cf9-9a7d-48ca-ba5c-fac0b0320422");
}

function sid_ec7e7cf9_9a7d_48ca_ba5c_fac0b0320422(string memory cardID) public checkRole(roleList[0]) {
	require(elements[position["sid-ec7e7cf9-9a7d-48ca-ba5c-fac0b0320422"]].status==State.ENABLED);  
	done("sid-ec7e7cf9-9a7d-48ca-ba5c-fac0b0320422");
currentMemory.cardID=cardID;
	enable("sid-0663CB4E-D3BF-4E12-8D81-D68E9318355F");
sid_0663CB4E_D3BF_4E12_8D81_D68E9318355F(); 
}

function sid_0663CB4E_D3BF_4E12_8D81_D68E9318355F() private { 
	require(elements[position["sid-0663CB4E-D3BF-4E12-8D81-D68E9318355F"]].status==State.ENABLED);
	done("sid-0663CB4E-D3BF-4E12-8D81-D68E9318355F");
	enable("sid-2F272EDB-9940-467E-AADC-2B485679AF43"); 
	enable("sid-f759c934-51a1-46c8-8466-1cb711e5560e"); 
}

function sid_859C73C7_F0DD_45ED_AA88_E0DEA0340C91() private {
	require(elements[position["sid-859C73C7-F0DD-45ED-AA88-E0DEA0340C91"]].status==State.ENABLED);
	done("sid-859C73C7-F0DD-45ED-AA88-E0DEA0340C91");  }

function sid_2F272EDB_9940_467E_AADC_2B485679AF43(string memory shipmentID) public checkRole(roleList[1]) {
	require(elements[position["sid-2F272EDB-9940-467E-AADC-2B485679AF43"]].status==State.ENABLED);  
	done("sid-2F272EDB-9940-467E-AADC-2B485679AF43");
currentMemory.shipmentID=shipmentID;
	enable("sid-CCD2A372-D382-426E-B823-05F778D4EA44");
sid_CCD2A372_D382_426E_B823_05F778D4EA44(); 
}

function sid_f759c934_51a1_46c8_8466_1cb711e5560e(string memory invoiceInfo) public checkRole(roleList[1]) {
	require(elements[position["sid-f759c934-51a1-46c8-8466-1cb711e5560e"]].status==State.ENABLED);  
	done("sid-f759c934-51a1-46c8-8466-1cb711e5560e");
currentMemory.invoiceInfo=invoiceInfo;
	enable("sid-CCD2A372-D382-426E-B823-05F778D4EA44");
sid_CCD2A372_D382_426E_B823_05F778D4EA44(); 
}

function sid_CCD2A372_D382_426E_B823_05F778D4EA44() private { 
	require(elements[position["sid-CCD2A372-D382-426E-B823-05F778D4EA44"]].status==State.ENABLED);
	done("sid-CCD2A372-D382-426E-B823-05F778D4EA44");
	if( elements[position["sid-2F272EDB-9940-467E-AADC-2B485679AF43"]].status==State.DONE && elements[position["sid-f759c934-51a1-46c8-8466-1cb711e5560e"]].status==State.DONE ) { 
	enable("sid-094362A8-CC68-4CB6-AC98-74DCF1163997"); 
sid_094362A8_CC68_4CB6_AC98_74DCF1163997(); 
}} 

function sid_094362A8_CC68_4CB6_AC98_74DCF1163997() private {
	require(elements[position["sid-094362A8-CC68-4CB6-AC98-74DCF1163997"]].status==State.ENABLED);
	done("sid-094362A8-CC68-4CB6-AC98-74DCF1163997");  }

 function enable(string memory _taskID) internal { elements[position[_taskID]].status=State.ENABLED; }

    function disable(string memory _taskID) internal { elements[position[_taskID]].status=State.DISABLED; }

    function done(string memory _taskID) internal { elements[position[_taskID]].status=State.DONE; } 
   
    function getCurrentState()public view  returns(Element[] memory, StateMemory memory){
        // emit stateChanged(elements, currentMemory);
        return (elements, currentMemory);
    }
    
    function compareStrings (string memory a, string memory b) internal pure returns (bool) { 
        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); 
    }
}