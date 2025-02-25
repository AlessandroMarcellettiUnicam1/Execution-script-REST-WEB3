pragma solidity >= 0.5.0 < 0.9.0;
import "./ConfidentialContract.sol";

contract StateContract{

    enum ElementType {ELEMENT, MSG, START, EX_SPLIT, EX_JOIN, PAR_SPLIT, PAR_JOIN, EVENT_BASED, END}
    enum ElementState {DISABLED, ENABLED, COMPLETED}
    enum Operator {NO_CONDITION, EQ, NOT_EQ, G_THAN, L_THAN}
    address stateContractAddress = 0xc061c73AD60d5BdC7cd4012d0B5b87cD3166ceD8;

    event functionDone(uint64, uint64);

    struct Instance {
        mapping(uint64 => Element) allElements;
        mapping(bytes32 => bytes32) publicVariables;
        mapping(uint64 => mapping (bytes32 => bool)) allowedVars;
        mapping(uint64 => Condition) conditions;
        mapping(bytes32 => address) roles;
        bytes32 policyPart1;
        bytes32 policyPart2;
    }

    struct Element{
        ElementState state;
        ElementType elementType;
        bytes32 role;
        uint64[] next;
        uint64[] previous;
    }

    struct Condition{
        bytes32 publicVar;
        Operator op;
        bytes32 value;
    }

    mapping(uint64 => Instance) allInstances;

    constructor(address confidentialContract){
        ConfidentialContract m = ConfidentialContract(confidentialContract);
        m.setStateAddress();
    }

    function getPublicVaraible(uint64 instanceId, bytes32 _var) public view returns(bytes32){
        return allInstances[instanceId].publicVariables[_var];
    }

    function getInstancePolicy(uint64 instanceId) public view returns(bytes memory){
        bytes memory joined = new bytes(64);
        bytes32 p1 = allInstances[instanceId].policyPart1;
        bytes32 p2 = allInstances[instanceId].policyPart2;
        assembly {
            mstore(add(joined, 32), p1)
            mstore(add(joined, 64), p2)
        }
        return joined;
    }

    modifier UserRoleCheck(uint64 instanceId, uint64 msgToExecute, address user) {
        bytes32 enabledRole = allInstances[instanceId].allElements[msgToExecute].role;
        require(user == allInstances[instanceId].roles[enabledRole]);
        _;
    }


    modifier ElementStatusCheck(uint64 instanceId, uint64 msgToExecute) {
        require(allInstances[instanceId].allElements[msgToExecute].elementType == ElementType.MSG);
        require(allInstances[instanceId].allElements[msgToExecute].state == ElementState.ENABLED);
        _;
    }

    function getConfidentialChecks(uint64 instanceId, uint64 msgToExecute, address user) public view UserRoleCheck(instanceId, msgToExecute, user)
    ElementStatusCheck(instanceId, msgToExecute) returns(bool){
        return true;
    }

    modifier StateContract() {
        require(stateContractAddress == msg.sender);
        _;
    }

    function getInstanceElement(uint64 instanceId, uint64 _element) public view returns(Element memory){
        return allInstances[instanceId].allElements[_element];
    }

    function getCondition(uint64 instanceId, uint64 element) public view returns(Condition memory){
        return allInstances[instanceId].conditions[element];
    }

    function getAllowedVar(uint64 instanceId, uint64 element, bytes32 varName) public view returns(bool){
        return allInstances[instanceId].allowedVars[element][varName];
    }

    function instantiateProcess(uint64 instanceId, bytes32[] memory _roles, address[] memory users, uint64[] memory elements,
        uint64[][] memory nextElements, uint64[][] memory previousElements, ElementType[] memory types, 
        bytes32 policy1, bytes32 policy2) public{
        uint64 startEvent;
        allInstances[instanceId].policyPart1 = policy1;
        allInstances[instanceId].policyPart2 = policy2;
        for(uint8 i = 0; i < elements.length; i++){
            Element memory e;
            if(users[i] != address(0x0)){
                allInstances[instanceId].roles[_roles[i]] = users[i];
            }
            if(types[i] != ElementType.START){
                e = Element(ElementState.DISABLED, types[i], _roles[i], nextElements[i], previousElements[i]);
            }else{
                e = Element(ElementState.ENABLED, types[i], _roles[i], nextElements[i], previousElements[i]);
                startEvent = elements[i];
            }
            allInstances[instanceId].allElements[elements[i]] = e;
        }
        changeStatus(instanceId, startEvent);
    }

    
    function createConditions(uint64 instanceId, uint64[] memory elementWithConditions, uint64[] memory elementWithPublicVar,
        bytes32[] memory publicVars, Operator[] memory operators, bytes32[] memory values) public{
        for(uint8 i = 0; i < elementWithPublicVar.length; i++){
            allInstances[instanceId].allowedVars[elementWithPublicVar[i]][publicVars[i]] = true;
        }
        for(uint8 i = 0; i < elementWithConditions.length; i++){
            allInstances[instanceId].conditions[elementWithConditions[i]] = Condition(publicVars[i], operators[i], values[i]);
        }
    }

   
    function checkEventBased(uint64 instanceId, uint64 msgToExecute) public {
        uint64 previousId = allInstances[instanceId].allElements[msgToExecute].previous[0];
        Element memory previousElement = allInstances[instanceId].allElements[previousId];
        if(previousElement.elementType == ElementType.EVENT_BASED){
            eventBased(previousElement, instanceId, msgToExecute);
        }
    }


    function setPublicvariables(uint64 instanceId, uint64 msgToExecute, bytes32[] memory publicVarNames, bytes32[] memory publicVarValues) public {
        Instance storage currentInstance = allInstances[instanceId];
        for(uint8 i = 0; i < publicVarNames.length; i++){
            if(currentInstance.allowedVars[msgToExecute][publicVarNames[i]] == true){
                currentInstance.publicVariables[publicVarNames[i]] = publicVarValues[i];
            }
        }
    }

    function executeGateway(uint64 elementToExecute, uint64 instanceId) internal {
        Element storage element = allInstances[instanceId].allElements[elementToExecute];
        if(element.elementType == ElementType.EX_SPLIT){
            ex_split(instanceId, elementToExecute);
        }else if(element.elementType == ElementType.EX_JOIN){
            ex_join(instanceId, elementToExecute);
        }else if(element.elementType == ElementType.PAR_SPLIT || element.elementType == ElementType.EVENT_BASED){
            par_event_split(instanceId, elementToExecute);
        }else if(element.elementType == ElementType.PAR_JOIN){
            par_join(element, instanceId);
        }else if(element.elementType == ElementType.END){
            setCompleted(instanceId, elementToExecute);
        }else if(element.elementType == ElementType.MSG){
            element.state = ElementState.ENABLED;
        }
    }


    function changeStatus(uint64 instanceId, uint64 elementToExecute) public {
        Element storage currentElement = allInstances[instanceId].allElements[elementToExecute];
        setCompleted(instanceId, elementToExecute);
        for(uint8 i = 0; i < currentElement.next.length; i++){
            Element storage nextElement = allInstances[instanceId].allElements[currentElement.next[i]];
            nextElement.state = ElementState.ENABLED;
            executeGateway(currentElement.next[i], instanceId);
        }
        emit functionDone(instanceId, elementToExecute);

    }

    function par_event_split(uint64 instanceId, uint64 element) internal {
        Element memory gateway = allInstances[instanceId].allElements[element];
        setCompleted(instanceId, element);
        for(uint8 i = 0; i < gateway.next.length; i++){
            Element storage e = allInstances[instanceId].allElements[gateway.next[i]];
            e.state = ElementState.ENABLED;
            executeGateway(gateway.next[i], instanceId);
        }
    }

    function par_join(Element storage gateway, uint64 instanceId) internal {
        for(uint8 i = 0; i < gateway.previous.length; i++){
            Element storage e = allInstances[instanceId].allElements[gateway.previous[i]];
            if(e.state != ElementState.COMPLETED){
                return;
            }
        }
        gateway.state = ElementState.COMPLETED;
        executeGateway(gateway.next[0], instanceId);
    }

    
    function eventBased(Element memory gateway, uint64 instanceId, uint64 msgToExecute) internal {
        for(uint8 i = 0; i < gateway.next.length; i ++){
            if(gateway.next[i] != msgToExecute){
                allInstances[instanceId].allElements[gateway.next[i]].state = ElementState.DISABLED;
            }
        }
    }

    function ex_join(uint64 instanceId, uint64 element) internal {
        Element memory gateway = allInstances[instanceId].allElements[element];
        for(uint8 i = 0; i < gateway.previous.length; i++){
            Element storage e = allInstances[instanceId].allElements[gateway.previous[i]];
            if(e.state == ElementState.COMPLETED){
                setCompleted(instanceId, element);
                executeGateway(gateway.next[0], instanceId);
            }
        }
    }


    function ex_split(uint64 instanceId, uint64 element) public {
        Element storage gateway = allInstances[instanceId].allElements[element];
        if(gateway.next.length == 1 && allInstances[instanceId].conditions[gateway.next[0]].op == Operator.NO_CONDITION){
            Element storage nextElement = allInstances[instanceId].allElements[gateway.next[0]];
            nextElement.state = ElementState.ENABLED;
            executeGateway(gateway.next[0], instanceId);
            setCompleted(instanceId, element);
        }else{
            for(uint8 i = 0; i < gateway.next.length; i++){
                Condition storage c = allInstances[instanceId].conditions[gateway.next[i]];
                Element storage nextElement = allInstances[instanceId].allElements[gateway.next[i]];
                bytes32 publicVar = allInstances[instanceId].publicVariables[c.publicVar];
                if(c.op == Operator.EQ && publicVar == c.value){
                    nextElement.state = ElementState.ENABLED;                    
                    executeGateway(gateway.next[i], instanceId);
                }else if(c.op == Operator.G_THAN && publicVar > c.value){
                    nextElement.state = ElementState.ENABLED;
                    executeGateway(gateway.next[i], instanceId);
                }else if(c.op == Operator.L_THAN && publicVar < c.value){
                    nextElement.state = ElementState.ENABLED;
                    executeGateway(gateway.next[i], instanceId);
                }
                setCompleted(instanceId, element);
            }
        }
    }

    function setCompleted(uint64 instanceId, uint64 element) internal {
        allInstances[instanceId].allElements[element].state = ElementState.COMPLETED;
    }


}
