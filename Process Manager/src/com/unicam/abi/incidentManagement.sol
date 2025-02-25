pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract incidentManagement{
	event stateChanged(Element[] , StateMemory ); 
	mapping (string=>uint) position;

	enum State {DISABLED, ENABLED, DONE} State s; 
	mapping(string => string) operator; 
	struct Element{
	string ID;
	State status;
}
	struct StateMemory{
	string response;
string questions;
string response3rd;
string response2nd;
string response1st;
string solution;
string problem2nd;
string problem3rd;
string problem1st;
}
	Element[] elements;
	  StateMemory currentMemory;
	string[] elementsID = ["sid-a6159d30-a400-42b4-b031-546b240ef5d0", "sid-c2ee54e8-a866-4cb9-b274-af8316645b2b", "sid-ce889048-4c13-4983-b692-ad5c870dcfa6", "sid-f2d88648-6507-4ea0-92b5-16e5d0eeaad0", "sid-340721f5-5cb7-4f7b-be25-6419773ead51", "sid-3062d578-d2c8-4623-a419-a5248cc4dfbe", "sid-d6518e26-fd2d-43ea-bad2-8971944b2ea0", "sid-71cb848c-4253-4764-bb96-ba0b1e6abcce", "sid-028d9e3b-fb68-43c9-ac6d-59ab9639b09c"];
	string[] roleList = [ "Software developer", "VIP customer", "Key account manager", "Key Account Manager", "2nd level support agent", "1st level support agent" ]; 
	mapping(string=>address) roles; 
constructor() public{
    //struct instantiation
    for (uint i = 0; i < elementsID.length; i ++) {
        elements.push(Element(elementsID[i], State.DISABLED));
        position[elementsID[i]]=i;
    }
         
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Software developer"] = 0x8460b386B04018f31E04D1bF181be1f26f74bb32;
	roles["VIP customer"] = 0x8460b386B04018f31E04D1bF181be1f26f74bb32;
	roles["Key account manager"] = 0x8460b386B04018f31E04D1bF181be1f26f74bb32;
	roles["Key Account Manager"] = 0x8460b386B04018f31E04D1bF181be1f26f74bb32;
	roles["2nd level support agent"] = 0x8460b386B04018f31E04D1bF181be1f26f74bb32;
	roles["1st level support agent"] = 0x8460b386B04018f31E04D1bF181be1f26f74bb32;
         
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
       	    enable("sid-EE168749-2FAC-4AD8-9F3B-CC2046AAFE4C");
       	}
   }

function subscribe_as_participant(string memory _role) public {
        if(roles[_role]==0x0000000000000000000000000000000000000000){
          roles[_role]!=msg.sender;
        }
        init();
    }
function sid_EE168749_2FAC_4AD8_9F3B_CC2046AAFE4C() private {
	require(elements[position["sid-EE168749-2FAC-4AD8-9F3B-CC2046AAFE4C"]].status==State.ENABLED);
	done("sid-EE168749-2FAC-4AD8-9F3B-CC2046AAFE4C");
	enable("sid-bcb84672-5d84-4169-a123-3a49911a328c");  
	
}

function sid_a6159d30_a400_42b4_b031_546b240ef5d0(string memory response) public checkRole(roleList[3]){
	require(elements[position["sid-a6159d30-a400-42b4-b031-546b240ef5d0"]].status==State.ENABLED);  
	done("sid-a6159d30-a400-42b4-b031-546b240ef5d0");
	enable("sid-c2ee54e8-a866-4cb9-b274-af8316645b2b");
currentMemory.response=response;
}
function sid_c2ee54e8_a866_4cb9_b274_af8316645b2b(string memory questions) public checkRole(roleList[1]){
	require(elements[position["sid-c2ee54e8-a866-4cb9-b274-af8316645b2b"]].status==State.ENABLED);
	done("sid-c2ee54e8-a866-4cb9-b274-af8316645b2b");
currentMemory.questions=questions;
	enable("sid-0297A9CD-9054-431E-9E67-309F8569D4AA");
sid_0297A9CD_9054_431E_9E67_309F8569D4AA(); 
}

function sid_0297A9CD_9054_431E_9E67_309F8569D4AA() private {
	require(elements[position["sid-0297A9CD-9054-431E-9E67-309F8569D4AA"]].status==State.ENABLED);
	done("sid-0297A9CD-9054-431E-9E67-309F8569D4AA");
if(compareStrings(currentMemory.questions, "resolved")==true){enable("sid-3062d578-d2c8-4623-a419-a5248cc4dfbe"); 
}if(compareStrings(currentMemory.questions, "error")==true){enable("sid-028d9e3b-fb68-43c9-ac6d-59ab9639b09c"); 
}}

function sid_C7D54A12_9C26_4719_914D_2B08A4FA1EB5() private {
	require(elements[position["sid-C7D54A12-9C26-4719-914D-2B08A4FA1EB5"]].status==State.ENABLED);
	done("sid-C7D54A12-9C26-4719-914D-2B08A4FA1EB5");
if(compareStrings(currentMemory.problem1st, "yes")==true){enable("sid-d6518e26-fd2d-43ea-bad2-8971944b2ea0"); 
}if(compareStrings(currentMemory.problem1st, "no")==true){enable("sid-340721f5-5cb7-4f7b-be25-6419773ead51"); 
}}

function sid_D80BE9E4_6761_4D74_A172_218FE3799D85() private {
	require(elements[position["sid-D80BE9E4-6761-4D74-A172-218FE3799D85"]].status==State.ENABLED);
	done("sid-D80BE9E4-6761-4D74-A172-218FE3799D85");
if(compareStrings(currentMemory.problem2nd, "yes")==true){enable("sid-71cb848c-4253-4764-bb96-ba0b1e6abcce"); 
}if(compareStrings(currentMemory.problem2nd, "no")==true){enable("sid-f2d88648-6507-4ea0-92b5-16e5d0eeaad0"); 
}}

function sid_ce889048_4c13_4983_b692_ad5c870dcfa6(string memory response3rd) public checkRole(roleList[0]) {
	require(elements[position["sid-ce889048-4c13-4983-b692-ad5c870dcfa6"]].status==State.ENABLED);  
	done("sid-ce889048-4c13-4983-b692-ad5c870dcfa6");
currentMemory.response3rd=response3rd;
	enable("sid-f2d88648-6507-4ea0-92b5-16e5d0eeaad0");
}

function sid_f2d88648_6507_4ea0_92b5_16e5d0eeaad0(string memory response2nd) public checkRole(roleList[4]) {
	require(elements[position["sid-f2d88648-6507-4ea0-92b5-16e5d0eeaad0"]].status==State.ENABLED);  
	done("sid-f2d88648-6507-4ea0-92b5-16e5d0eeaad0");
currentMemory.response2nd=response2nd;
	enable("sid-340721f5-5cb7-4f7b-be25-6419773ead51");
}

function sid_340721f5_5cb7_4f7b_be25_6419773ead51(string memory response1st) public checkRole(roleList[2]) {
	require(elements[position["sid-340721f5-5cb7-4f7b-be25-6419773ead51"]].status==State.ENABLED);  
	done("sid-340721f5-5cb7-4f7b-be25-6419773ead51");
currentMemory.response1st=response1st;
	enable("sid-3062d578-d2c8-4623-a419-a5248cc4dfbe");
}

function sid_3062d578_d2c8_4623_a419_a5248cc4dfbe(string memory solution) public checkRole(roleList[3]) {
	require(elements[position["sid-3062d578-d2c8-4623-a419-a5248cc4dfbe"]].status==State.ENABLED);  
	done("sid-3062d578-d2c8-4623-a419-a5248cc4dfbe");
currentMemory.solution=solution;
	enable("sid-6D43AFF0-8DA0-40D4-95E0-32D0B31EA241");
sid_6D43AFF0_8DA0_40D4_95E0_32D0B31EA241(); 
}

function sid_6D43AFF0_8DA0_40D4_95E0_32D0B31EA241() private {
	require(elements[position["sid-6D43AFF0-8DA0-40D4-95E0-32D0B31EA241"]].status==State.ENABLED);
	done("sid-6D43AFF0-8DA0-40D4-95E0-32D0B31EA241");  }

function sid_d6518e26_fd2d_43ea_bad2_8971944b2ea0(string memory problem2nd) public checkRole(roleList[5]) {
	require(elements[position["sid-d6518e26-fd2d-43ea-bad2-8971944b2ea0"]].status==State.ENABLED);  
	done("sid-d6518e26-fd2d-43ea-bad2-8971944b2ea0");
currentMemory.problem2nd=problem2nd;
	enable("sid-D80BE9E4-6761-4D74-A172-218FE3799D85");
sid_D80BE9E4_6761_4D74_A172_218FE3799D85(); 
}

function sid_71cb848c_4253_4764_bb96_ba0b1e6abcce(string memory problem3rd) public checkRole(roleList[4]) {
	require(elements[position["sid-71cb848c-4253-4764-bb96-ba0b1e6abcce"]].status==State.ENABLED);  
	done("sid-71cb848c-4253-4764-bb96-ba0b1e6abcce");
currentMemory.problem3rd=problem3rd;
	enable("sid-ce889048-4c13-4983-b692-ad5c870dcfa6");
}

function sid_028d9e3b_fb68_43c9_ac6d_59ab9639b09c(string memory problem1st) public checkRole(roleList[3]) {
	require(elements[position["sid-028d9e3b-fb68-43c9-ac6d-59ab9639b09c"]].status==State.ENABLED);  
	done("sid-028d9e3b-fb68-43c9-ac6d-59ab9639b09c");
currentMemory.problem1st=problem1st;
	enable("sid-C7D54A12-9C26-4719-914D-2B08A4FA1EB5");
sid_C7D54A12_9C26_4719_914D_2B08A4FA1EB5(); 
}

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