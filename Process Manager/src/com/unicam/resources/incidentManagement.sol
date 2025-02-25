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
	string problem_info;
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
	string[] elementsID = ["sid-EE168749-2FAC-4AD8-9F3B-CC2046AAFE4C", "sid-5e4d800a-1f6f-46ca-8d4b-2327694d4958", "sid-3f2f6541-2bd2-432c-b595-23712dbfe350", "sid-606530fb-4ecf-4219-a0d5-6341a50039da", "sid-0297A9CD-9054-431E-9E67-309F8569D4AA", "sid-C7D54A12-9C26-4719-914D-2B08A4FA1EB5", "sid-D80BE9E4-6761-4D74-A172-218FE3799D85", "sid-a07225ce-c514-462b-a681-cd452b83352e", "sid-9f328606-3234-488d-b712-ee0ef6205109", "sid-96bfe28f-2d7b-48e7-8571-55b9f9fb95e1", "sid-6c534b87-e576-419b-9c48-58ab017bca84", "sid-6D43AFF0-8DA0-40D4-95E0-32D0B31EA241", "sid-e396b27b-4f24-4f8b-887f-1b020b8d86b4", "sid-585df627-5639-408c-ae64-cfb696945195", "sid-193e65e8-a4b7-4e6d-bcca-5121de7787dc"];
	string[] roleList = [ "Software developer", "VIP customer", "Key Account Manager", "2nd level support agent", "1st level support agent" ]; 
	mapping(string=>address) roles; 
constructor() public{
    //struct instantiation
    for (uint i = 0; i < elementsID.length; i ++) {
        elements.push(Element(elementsID[i], State.DISABLED));
        position[elementsID[i]]=i;
    }
         
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Software developer"] = 0xc33d9df08d31d3a2e7ba59519783593cff46c086;
	roles["VIP customer"] = 0xc33d9df08d31d3a2e7ba59519783593cff46c086;
	roles["Key Account Manager"] = 0xc33d9df08d31d3a2e7ba59519783593cff46c086;
	roles["2nd level support agent"] = 0xc33d9df08d31d3a2e7ba59519783593cff46c086;
	roles["1st level support agent"] = 0xc33d9df08d31d3a2e7ba59519783593cff46c086;
         
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
				sid_EE168749_2FAC_4AD8_9F3B_CC2046AAFE4C();
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
	enable("sid-5e4d800a-1f6f-46ca-8d4b-2327694d4958");  
	
}

function sid_5e4d800a_1f6f_46ca_8d4b_2327694d4958(string memory problem_info) public checkRole(roleList[1]) {
	require(elements[position["sid-5e4d800a-1f6f-46ca-8d4b-2327694d4958"]].status==State.ENABLED);  
	done("sid-5e4d800a-1f6f-46ca-8d4b-2327694d4958");
currentMemory.problem_info=problem_info;
	enable("sid-3f2f6541-2bd2-432c-b595-23712dbfe350");
}

function sid_3f2f6541_2bd2_432c_b595_23712dbfe350(string memory response) public checkRole(roleList[2]){
	require(elements[position["sid-3f2f6541-2bd2-432c-b595-23712dbfe350"]].status==State.ENABLED);  
	done("sid-3f2f6541-2bd2-432c-b595-23712dbfe350");
	enable("sid-606530fb-4ecf-4219-a0d5-6341a50039da");
currentMemory.response=response;
}
function sid_606530fb_4ecf_4219_a0d5_6341a50039da(string memory questions) public checkRole(roleList[1]){
	require(elements[position["sid-606530fb-4ecf-4219-a0d5-6341a50039da"]].status==State.ENABLED);
	done("sid-606530fb-4ecf-4219-a0d5-6341a50039da");
currentMemory.questions=questions;
	enable("sid-0297A9CD-9054-431E-9E67-309F8569D4AA");
sid_0297A9CD_9054_431E_9E67_309F8569D4AA(); 
}

function sid_0297A9CD_9054_431E_9E67_309F8569D4AA() private {
	require(elements[position["sid-0297A9CD-9054-431E-9E67-309F8569D4AA"]].status==State.ENABLED);
	done("sid-0297A9CD-9054-431E-9E67-309F8569D4AA");
if(compareStrings(currentMemory.questions, "resolved")==true){enable("sid-6c534b87-e576-419b-9c48-58ab017bca84"); 
}if(compareStrings(currentMemory.questions, "error")==true){enable("sid-193e65e8-a4b7-4e6d-bcca-5121de7787dc"); 
}}

function sid_C7D54A12_9C26_4719_914D_2B08A4FA1EB5() private {
	require(elements[position["sid-C7D54A12-9C26-4719-914D-2B08A4FA1EB5"]].status==State.ENABLED);
	done("sid-C7D54A12-9C26-4719-914D-2B08A4FA1EB5");
if(compareStrings(currentMemory.problem1st, "yes")==true){enable("sid-e396b27b-4f24-4f8b-887f-1b020b8d86b4"); 
}if(compareStrings(currentMemory.problem1st, "no")==true){enable("sid-96bfe28f-2d7b-48e7-8571-55b9f9fb95e1"); 
}}

function sid_D80BE9E4_6761_4D74_A172_218FE3799D85() private {
	require(elements[position["sid-D80BE9E4-6761-4D74-A172-218FE3799D85"]].status==State.ENABLED);
	done("sid-D80BE9E4-6761-4D74-A172-218FE3799D85");
if(compareStrings(currentMemory.problem2nd, "yes")==true){enable("sid-585df627-5639-408c-ae64-cfb696945195"); 
}if(compareStrings(currentMemory.problem2nd, "no")==true){enable("sid-9f328606-3234-488d-b712-ee0ef6205109"); 
}}

function sid_a07225ce_c514_462b_a681_cd452b83352e(string memory response3rd) public checkRole(roleList[0]) {
	require(elements[position["sid-a07225ce-c514-462b-a681-cd452b83352e"]].status==State.ENABLED);  
	done("sid-a07225ce-c514-462b-a681-cd452b83352e");
currentMemory.response3rd=response3rd;
	enable("sid-9f328606-3234-488d-b712-ee0ef6205109");
}

function sid_9f328606_3234_488d_b712_ee0ef6205109(string memory response2nd) public checkRole(roleList[3]) {
	require(elements[position["sid-9f328606-3234-488d-b712-ee0ef6205109"]].status==State.ENABLED);  
	done("sid-9f328606-3234-488d-b712-ee0ef6205109");
currentMemory.response2nd=response2nd;
	enable("sid-96bfe28f-2d7b-48e7-8571-55b9f9fb95e1");
}

function sid_96bfe28f_2d7b_48e7_8571_55b9f9fb95e1(string memory response1st) public checkRole(roleList[2]) {
	require(elements[position["sid-96bfe28f-2d7b-48e7-8571-55b9f9fb95e1"]].status==State.ENABLED);  
	done("sid-96bfe28f-2d7b-48e7-8571-55b9f9fb95e1");
currentMemory.response1st=response1st;
	enable("sid-6c534b87-e576-419b-9c48-58ab017bca84");
}

function sid_6c534b87_e576_419b_9c48_58ab017bca84(string memory solution) public checkRole(roleList[2]) {
	require(elements[position["sid-6c534b87-e576-419b-9c48-58ab017bca84"]].status==State.ENABLED);  
	done("sid-6c534b87-e576-419b-9c48-58ab017bca84");
currentMemory.solution=solution;
	enable("sid-6D43AFF0-8DA0-40D4-95E0-32D0B31EA241");
sid_6D43AFF0_8DA0_40D4_95E0_32D0B31EA241(); 
}

function sid_6D43AFF0_8DA0_40D4_95E0_32D0B31EA241() private {
	require(elements[position["sid-6D43AFF0-8DA0-40D4-95E0-32D0B31EA241"]].status==State.ENABLED);
	done("sid-6D43AFF0-8DA0-40D4-95E0-32D0B31EA241");  }

function sid_e396b27b_4f24_4f8b_887f_1b020b8d86b4(string memory problem2nd) public checkRole(roleList[4]) {
	require(elements[position["sid-e396b27b-4f24-4f8b-887f-1b020b8d86b4"]].status==State.ENABLED);  
	done("sid-e396b27b-4f24-4f8b-887f-1b020b8d86b4");
currentMemory.problem2nd=problem2nd;
	enable("sid-D80BE9E4-6761-4D74-A172-218FE3799D85");
sid_D80BE9E4_6761_4D74_A172_218FE3799D85(); 
}

function sid_585df627_5639_408c_ae64_cfb696945195(string memory problem3rd) public checkRole(roleList[3]) {
	require(elements[position["sid-585df627-5639-408c-ae64-cfb696945195"]].status==State.ENABLED);  
	done("sid-585df627-5639-408c-ae64-cfb696945195");
currentMemory.problem3rd=problem3rd;
	enable("sid-a07225ce-c514-462b-a681-cd452b83352e");
}

function sid_193e65e8_a4b7_4e6d_bcca_5121de7787dc(string memory problem1st) public checkRole(roleList[2]) {
	require(elements[position["sid-193e65e8-a4b7-4e6d-bcca-5121de7787dc"]].status==State.ENABLED);  
	done("sid-193e65e8-a4b7-4e6d-bcca-5121de7787dc");
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