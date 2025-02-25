// SPDX-License-Identifier: CC-BY-SA-4.0
pragma solidity >= 0.5.0 < 0.9.0;
//Registry contract -> tiene traccia di tutte le istanze aventi [elementi, stati, dati e utenti] per istanza
contract SimplifiedMartsia{
    address constant chorchainAddress = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    //                  0    ,   1 ,  2   ,    3    ,    4   ,    5     ,     6   ,      7     ,  8
    enum ElementType {ELEMENT, MSG, START, EX_SPLIT, EX_JOIN, PAR_SPLIT, PAR_JOIN, EVENT_BASED, END}
    enum ElementState {DISABLED, ENABLED, COMPLETED}
    enum Operator {EQ, NOT_EQ, G_THAN, L_THAN}    
    //in IPFS contiene chiavi pubbliche utenti e attributi vari
    //todo policy "hard-coded" messa su ipfs dopo subscription
    struct Instance {
        //policy di lettura su ipfs
        bytes32 hashPart1;
        bytes32 hashPart2;
        //messageIDs -> messages
        mapping(uint8 => Element) allElements;
        //contains all the process intstances
        mapping(bytes32 => bytes32) publicVariables;
        //associates variables to message and then more values
        //apping(bytes32 => mapping (bytes32 => bytes32)) publicVariables;
        //contains the public variables allowed. This is used to enforce what user can insert
        mapping(uint8 => mapping (bytes32 => bool)) allowedVars;
        //maps outgoing branches (next elements from an exclusive gw) to conditions
        mapping(uint8 => Condition) conditions;
    }

    //an element contains its status (enabled/disabled), the participant address that can execute it and the reference to the next elements
    struct Element{
        ElementState state;
        ElementType elementType;
        address senderParticipant;
        uint8[] next;
        uint8[] previous;
    }

    //it expresses a condition in a certain path. it contains the public variable to evaluate, the type of operand and the value to be used in the comparison
    struct Condition{
        bytes32 publicVar;
        Operator op;
        bytes32 value;
    }

    //it contains all the instances
    mapping(uint64 => Instance) allInstances;

   

    //checks if sender user is the one enabled in the element that is executed
    modifier UserRoleCheck(uint64 instanceId, uint8 msgToExecute) {
        require(allInstances[instanceId].allElements[msgToExecute].senderParticipant == msg.sender);
        _;
    }

    //checks if the element to execute is enabled 
    modifier ElementStatusCheck(uint64 instanceId, uint8 msgToExecute) {
        require(allInstances[instanceId].allElements[msgToExecute].elementType == ElementType.MSG);
        require(allInstances[instanceId].allElements[msgToExecute].state == ElementState.ENABLED);
        _;
    }

    /*modifier Variable(uint64 instanceId, uint8 msgToExecute, bytes32[] memory publicVarNames) {
         for(uint8 i = 0; i < publicVarNames.length; i++){
            require(allInstances[instanceId].allowedVars[msgToExecute][publicVarNames[i]] == true);
        }
        _;
    }*/

    //checks if the invoker is ChorChain
    modifier ChorChain() {
        require(chorchainAddress == msg.sender);
        _;
    }

    function getInstance(uint64 instanceId, uint8 _element) public view returns(Element memory){
        return allInstances[instanceId].allElements[_element];
    }

    function getCondition(uint64 instanceId, uint8 element) public view returns(Condition memory){
        return allInstances[instanceId].conditions[element];
    }

    function getAllowedVar(uint64 instanceId, uint8 element, bytes32 varName) public view returns(bool){
        return allInstances[instanceId].allowedVars[element][varName];
    }

   /*
   Function to create a new instance structure in the smart contract
   it takes in input the instance id, list of BPMN elements and their nexts to recreate the choreography tree, list of users for elements,
   the first element to enable and the hash for [reading policies --> TODO]
   */
   //TODO------> AVOID INSTANCES TO OVERWRITE ALREADY EXISTING ONES
   //TODO------> USERS ARE NOT NEEDED FOR GATEWAYS. HOW TO MANAGE?
   //TODO------> ENFORCE WHICH MESSAGE HAS WHICH PUBLIC VARIABLE, TO INSERT direclty IN THE ELEMENT or in the mapping?
    function instantiateProcess(uint64 instanceId, address[] memory users, uint8[] memory elements,
        uint8[][] memory nextElements, uint8[][] memory previousElements, ElementType[] memory types,
        bytes32 _hashPart1, bytes32 _hashPart2) public ChorChain{
        uint8 startEvent;
        for(uint8 i = 0; i < elements.length; i++){
            Element memory e;
            //if the element is the start event then set it to enabled. the start event is hard coded since it is always present
            //and it is always the starting point
            if(types[i] != ElementType.START){
                e = Element(ElementState.DISABLED, types[i], users[i], nextElements[i], previousElements[i]);
            }else{
                e = Element(ElementState.ENABLED, types[i], users[i], nextElements[i], previousElements[i]);
                startEvent = elements[i];
            }
            allInstances[instanceId].allElements[elements[i]] = e;
        }
        allInstances[instanceId].hashPart1 = _hashPart1;
        allInstances[instanceId].hashPart2 = _hashPart2;
        //automatically executes the start event
        changeStatus(instanceId, startEvent);
    }

    //function for creating a condition attached to an element. It requires the instance id, the set of elements to which associate conditions,
    //the set of public variables associated with the conditions, the operators associated with the conditions and the values used in the condition
    function createConditions(uint64 instanceId, uint8[] memory elementWithConditions, uint8[] memory elementWithPublicVar,
    bytes32[] memory publicVars, Operator[] memory operators, bytes32[] memory values) public ChorChain{
        for(uint8 i = 0; i < elementWithPublicVar.length; i++){
            allInstances[instanceId].allowedVars[elementWithPublicVar[i]][publicVars[i]] = true;
        }
        for(uint8 i = 0; i < elementWithConditions.length; i++){
            //allow public variables attached to corresponding elements
            allInstances[instanceId].conditions[elementWithConditions[i]] = Condition(publicVars[i], operators[i], values[i]);
        }  
    }

    /*function that simulates the cipher in Martsia contract. 
    it has the modifiers for checking if 1) the element is a message, 2) the element is enabled, and 3) the user is the designed one
    inside the function it first checks if the message to execute comes after an event based gateway and in case it invokes the function
    for disabling the other concurrent ones.
    Then, it invokes the function for changing the status of the message and the next ones 
    */
    function pippo(uint64 instanceId, uint8 msgToExecute, bytes32[] memory publicvarNames, bytes32[] memory publicVarValues) public
     ElementStatusCheck(instanceId, msgToExecute) UserRoleCheck(instanceId, msgToExecute) returns(string memory) {     
        uint8 previousId = allInstances[instanceId].allElements[msgToExecute].previous[0];
        Element memory previousElement = allInstances[instanceId].allElements[previousId];
        //if the previous element is an event based gw then invoke the function for disabling the concurrent ones
        if(previousElement.elementType == ElementType.EVENT_BASED){
            eventBased(previousElement, instanceId, msgToExecute);
        }
        //it manages the eventual update of public variables used later for the conditions in exclusive gateways
        setPublicvariables(instanceId, msgToExecute, publicvarNames, publicVarValues);
        //it sets to COMPLETED the current message and enables the next ones
        changeStatus(instanceId, msgToExecute);
        return "sei stato abilitato complimenti";
    }

    //function for setting the value of a public variable previously allowed
    function setPublicvariables(uint64 instanceId, uint8 msgToExecute, bytes32[] memory publicVarNames, bytes32[] memory publicVarValues) internal {
        Instance storage currentInstance = allInstances[instanceId];
        //for each user input variable, if it is allowed then insert it 
        for(uint8 i = 0; i < publicVarNames.length; i++){
            if(currentInstance.allowedVars[msgToExecute][publicVarNames[i]] == true){
            currentInstance.publicVariables[publicVarNames[i]] = publicVarValues[i];
            }
        }
    }


    //checks if an element is a gateway and in case executes it
    function executeGateway(uint8 elementToExecute, uint64 instanceId) internal {
        Element storage element = allInstances[instanceId].allElements[elementToExecute];
        if(element.elementType == ElementType.EX_SPLIT){
            ex_split(element, instanceId);  
        }else if(element.elementType == ElementType.EX_JOIN){
            ex_join(element, instanceId);
        }else if(element.elementType == ElementType.PAR_SPLIT || element.elementType == ElementType.EVENT_BASED){
            //in case of parallel split and event based gateways just enable the next elements (also called outgoing)
            par_event_split(element, instanceId);
        }else if(element.elementType == ElementType.PAR_JOIN){
            par_join(element, instanceId);
        }else if(element.elementType == ElementType.END){
            //if the element is an end event just complete it thus terminating the process instance flow
            element.state = ElementState.COMPLETED;
        }
    }


    //the function sets the status of the current element to false and of the next elements to true
    //then it invokes the function for checking if the element is a gateway eventually executing it
    function changeStatus(uint64 instanceId, uint8 elementToExecute) internal{
        Element storage currentElement = allInstances[instanceId].allElements[elementToExecute];
        currentElement.state = ElementState.COMPLETED;
        //for each next element enables it and triggers the function for eventually execute it in case it is a gateway
        for(uint8 i = 0; i < currentElement.next.length; i++){
            Element storage nextElement = allInstances[instanceId].allElements[currentElement.next[i]];
            nextElement.state = ElementState.ENABLED;
            executeGateway(currentElement.next[i], instanceId);
        }
    }

    //function for the parallel split gateway, it enables the next elements and if they are gateways execute them
    function par_event_split(Element storage gateway, uint64 instanceId) internal {
        gateway.state = ElementState.COMPLETED;
        //for each element outgoing the gateway enable it and check if it is a gateway
        for(uint8 i = 0; i < gateway.next.length; i++){
            Element storage e = allInstances[instanceId].allElements[gateway.next[i]];
            e.state = ElementState.ENABLED;
            executeGateway(gateway.next[i], instanceId);
        }        
    }

    //function for the parallel JOIN gateway, it enables the next elements (and if they are gateways execute them) only if the previous were both executed
    function par_join(Element storage gateway, uint64 instanceId) internal {
        for(uint8 i = 0; i < gateway.previous.length; i++){
            Element storage e = allInstances[instanceId].allElements[gateway.previous[i]];
            //if there is an element still not executed then interrupts the execution of the function
            if(e.state != ElementState.COMPLETED){
                return;
            }
        }      
        gateway.state = ElementState.COMPLETED;
        //if the join is ok then check if the next element (join has only 1 outgoing) is a gateway
        executeGateway(gateway.next[0], instanceId);  
    }

    //EVENT-BASED gateway is a race condition, the first element to be executed wins and disables the other ones
    //this function manages the disabling of the other elements outgoing from the event based not boing the current to execute
    function eventBased(Element memory gateway, uint64 instanceId, uint8 msgToExecute) internal {
        //iter outgoing elements from the event based to disable the one not being executed
        for(uint8 i = 0; i < gateway.next.length; i ++){
            //If outgoing element is not the message to execute then disable it
            if(gateway.next[i] != msgToExecute){
                allInstances[instanceId].allElements[gateway.next[i]].state = ElementState.DISABLED;
            }
        }
    }

    //function for the parallel JOIN gateway, it enables the next elements (and if they are gateways execute them) only if the previous were both executed
    function ex_join(Element storage gateway, uint64 instanceId) internal {
        for(uint8 i = 0; i < gateway.previous.length; i++){
            Element storage e = allInstances[instanceId].allElements[gateway.previous[i]];
            //if there is an element still not executed then interrupts the execution of the function
            if(e.state == ElementState.COMPLETED){
                gateway.state = ElementState.COMPLETED;
                //if the join is ok then check if the next element (join has only 1 outgoing) is a gateway
                executeGateway(gateway.next[0], instanceId);  
            }
        }      
    }

    //function for the exclusive gateway, for each outgoing element checks the related condition and evaluates it
    function ex_split(Element storage gateway, uint64 instanceId) internal{
        for(uint8 i = 0; i < gateway.next.length; i++){
            //retrieves the condition attached to the outgoing element
            Condition memory c = allInstances[instanceId].conditions[gateway.next[i]];
            Element storage nextElement = allInstances[instanceId].allElements[gateway.next[i]];
            //reads the public variable (the one iserted by the user) required by the condition
            bytes32 publicVar = allInstances[instanceId].publicVariables[c.publicVar];
            //checks if the operator is EQUAL and the public variable is equal the condition valu
            if(c.op == Operator.EQ && publicVar == c.value){
                nextElement.state = ElementState.ENABLED;
                executeGateway(gateway.next[i], instanceId);
            //checks if the operator is GREATER THAN and the public variable is greater than the condition value
            }else if(c.op == Operator.G_THAN && publicVar > c.value){
                nextElement.state = ElementState.ENABLED;
                executeGateway(gateway.next[i], instanceId);
            //checks if the operator is LESS THAN and the public variable is less than the condition value
            }else if(c.op == Operator.L_THAN && publicVar < c.value){
                nextElement.state = ElementState.ENABLED;
                executeGateway(gateway.next[i], instanceId);
            }
            gateway.state = ElementState.COMPLETED;    
        }
    }

    //***TESTING FUNCTION***
    function test_addElement(uint64 instanceId, address user, uint8 element, 
        uint8[] memory nextElements, uint8[] memory previousElements, ElementType elType, ElementState elState) public{
            Element memory e = Element(elState, elType, user, nextElements, previousElements);
            allInstances[instanceId].allElements[element] = e;
    }

    function test_addValue(uint64 instanceId, bytes32 _var, bytes32 value) public {
        allInstances[instanceId].publicVariables[_var] = value;
    }

}