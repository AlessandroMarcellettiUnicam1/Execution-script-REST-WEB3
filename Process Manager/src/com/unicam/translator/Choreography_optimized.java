package com.unicam.translator;

import com.unicam.model.ContractObject;
import com.unicam.model.User;
import com.unicam.rest.ContractFunctions;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.impl.instance.EndEventImpl;
import org.camunda.bpm.model.bpmn.impl.instance.EventBasedGatewayImpl;
import org.camunda.bpm.model.bpmn.impl.instance.ExclusiveGatewayImpl;
import org.camunda.bpm.model.bpmn.impl.instance.ParallelGatewayImpl;
import org.camunda.bpm.model.bpmn.instance.*;
import org.camunda.bpm.model.xml.impl.instance.ModelElementInstanceImpl;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.*;

public class Choreography_optimized {
	public  int startint;
	private  BpmnModelInstance modelInstance;
	public  ArrayList<String> participantsWithoutDuplicates;
	public  ArrayList<String> partecipants;
	public  ArrayList<String> functions;
	public  Collection<FlowNode> allNodes;
	public  int startCounter;
	public  Integer xorCounter;
	public  Integer parallelCounter;
	public  Integer eventBasedCounter;
	public  Integer endEventCounter;
	//public  String choreographyFile;
	public ArrayList<DomElement> participantsTask;
	public ArrayList<DomElement> msgTask;
	public ArrayList<SequenceFlow> taskIncoming, taskOutgoing;
	public  ArrayList<String> nodeSet;
	public  String request;
	public  String response;
	public  ArrayList<String> gatewayGuards;
	public int globalCounter;
	public  List<String> tasks;
	public  List<String> elementsID;
	public  List<String> enableElements;
	private  String startEventAdd;
	private  List<String> roleFortask;
	private  LinkedHashMap<String, String> taskIdAndRole;
	private  HashMap<String, String> taskIdAndName;
	private HashMap<String, Integer> taskIdInt;
	private LinkedHashMap<String, Integer> taskIdAndMartsiaId;
	private LinkedHashMap<String, Integer> taskIdAndMartsiaType;


	// static String projectPath = System.getProperty("user.dir")+ "/workspace";

	public Choreography_optimized() {
		roleFortask = new ArrayList<>();
		elementsID = new ArrayList<>();
		tasks = new ArrayList<>();
		gatewayGuards = new ArrayList<>();
		partecipants = new ArrayList<>();
		enableElements = new ArrayList<>();
		startint = 0;
		startCounter = 0;
		xorCounter = 0;
		eventBasedCounter = 0;
		parallelCounter = 0;
		endEventCounter = 0;
		globalCounter = 0;
		//choreographyFile = "";
		this.participantsTask = new ArrayList<>();
		this.msgTask = new ArrayList<>();
		this.taskIncoming = new ArrayList<>();
		this.taskOutgoing = new ArrayList<>();
		nodeSet = new ArrayList<>();
		request = "";
		response = "";
		startEventAdd = "";
		taskIdAndName = new HashMap<>();
		taskIdInt = new HashMap<String, Integer>();
		//variables used for martsia instantiation
		taskIdAndRole = new LinkedHashMap<>(); //da spacchettare per prendere solo ruoli ma cmq li abbiamo
		taskIdAndMartsiaId = new LinkedHashMap<>(); // prendere solo martiaid che va messo nel contratto
		taskIdAndMartsiaType = new LinkedHashMap<>();
	}

	public ContractObject start(File bpmnFile, Map<String, User> participants, List<String> optionalRoles,
			List<String> mandatoryRoles) throws Exception {
		    ContractObject finalContract = new ContractObject();
		try {
			Choreography_optimized choreography = new Choreography_optimized();
			choreography.readFile(bpmnFile);
			choreography.getParticipants();
			String a = " ";
			String buffer = choreography.FlowNodeSearch(optionalRoles, mandatoryRoles);
			a = a.concat(choreography.initial(bpmnFile.getName(), participants, optionalRoles, mandatoryRoles));
			//+choreographyFile

			a = a.concat(buffer);
			a = a.concat(choreography.lastFunctions());
			//choreographyFile += choreography.lastFunctions();

			finalContract.setAddress(null);
			finalContract.setTaskIdAndName(choreography.getTaskIdAndName());
			finalContract.setAbi(null);
			finalContract.setBin(null);
			finalContract.setVarNames(choreography.getGatewayGuards());
			finalContract.setTaskIdAndRole(choreography.getTaskIdAndRole());
			finalContract.setTaskIdAndMartsiaId(taskIdAndMartsiaId);
			choreography.fileAll(a, bpmnFile.getName());
			//System.out.println("Contract creation done");
			// System.out.println("Ruolii:" + Arrays.toString(roleFortask.toArray()));
			return finalContract;
		} catch (Exception e) {
			e.printStackTrace();
			return finalContract;
		}

	}

	public LinkedHashMap<String, String> getTaskIdAndRole(){
		return taskIdAndRole;
	}


	public ArrayList<String> getGatewayGuards() {
		return gatewayGuards;
	}

	public HashMap<String, String> getTaskIdAndName() {
		return taskIdAndName;
	}

	public void mergeMap(String id, String role, String name) {
		taskIdAndRole.put(id, role);
		taskIdAndName.put(id, name);
	}

	public void setMartsiaMaps(String id, int type){
		taskIdAndMartsiaId.put(id, (int) (Math.random() * (1000000 - 1)) + 1);
		taskIdAndMartsiaType.put(id, type);

	}



	public void readFile(File bpFile) throws IOException {
		//System.out.println("You chose to open this file: " + bpFile.getName());
		modelInstance = Bpmn.readModelFromFile(bpFile);
		allNodes = modelInstance.getModelElementsByType(FlowNode.class);
	}

	public void getParticipants() {
		Collection<Participant> parti = modelInstance.getModelElementsByType(Participant.class);
		for (Participant p : parti) {
			partecipants.add(p.getName());
		}
		participantsWithoutDuplicates = new ArrayList<>(new HashSet<>(partecipants));
	}

	private String initial(String filename, Map<String, User> participants, List<String> optionalRoles,
			List<String> mandatoryRoles) {
		String intro = "pragma solidity ^0.5.3; \n" + "	pragma experimental ABIEncoderV2;\n" + "	contract "
				+ ContractFunctions.parseName(filename, "") + "{\n" +
				//"		uint counter;\r\n"
				//+ "	event stateChanged(uint);  \n"
				 "	event functionDone(string);\n" +
				 "	enum State {DISABLED, ENABLED, DONE} State s; \n" +
				 "	struct Element{\n	" +
				 "		string ID;\n" +
				 "		State status;\n" +
				 "	}\n" +
				 "		struct StateMemory{\n	";
		for (String guard : gatewayGuards) {
			intro += guard + ";\n";
		}
		intro += "}\n" + "	Element["+(elementsID.size()+1)+"] elements;\n	  StateMemory currentMemory;\n" +
				"	string["+mandatoryRoles.size()+"] roleList = [ ";
		for (int i = 0; i < mandatoryRoles.size(); i++) {
			intro += "\"" + mandatoryRoles.get(i) + "\"";
			if ((i + 1) < mandatoryRoles.size())
				intro += ", ";
		}
		intro += " ]; \n";
		//intro += "	string["+ optionalRoles.size() +"] optionalList = [";
		if (!optionalRoles.isEmpty()) {
			intro += "	string["+ optionalRoles.size() +"] optionalList = [";
			for (int i = 0; i < optionalRoles.size(); i++) {
				intro += "\"" + optionalRoles.get(i) + "\"";
				if ((i + 1) < optionalRoles.size())
					intro += ", ";
			}
			intro += " ];\n" +
					"	 mapping(string=>address payable) optionalRoles; \r\n";
		}

		intro += "	mapping(string=>address payable) roles; \r\n";
		String constr = "constructor() public{\n" +
				  "        elements[" + taskIdInt.get(startEventAdd) + "] = Element(\""+ startEventAdd +"\", State.ENABLED);\n" +
				  "         //roles definition\r\n" + "         //mettere address utenti in base ai ruoli\r\n";
		int i = 0;
		for (Map.Entry<String, User> sub : participants.entrySet()) {

			constr += "	roles[\"" + sub.getKey() + "\"] = " + sub.getValue().getAddress() + ";\n";
			i++;
		}
		if(!optionalRoles.isEmpty()){
			for (String optional : optionalRoles) {
				constr += "	optionalRoles[\"" + optional + "\"] = 0x0000000000000000000000000000000000000000;";
			}
		}




		constr += "		//enable the start process\n" +
				  "		"+ startEventAdd +"();\n" +
				  "		emit functionDone(\"Contract creation\");\n" +
				  "	}\n";

		String other = "modifier checkRole(string memory role){ \n" +
				"	require(msg.sender == roles[role]";
				if(!optionalRoles.isEmpty()){
					other +=" || msg.sender == optionalRoles[role] \n";
				}
				other += ");\n" +
						"_; \n\n}"+
				/*+ "function init() internal{\r\n" + "       bool result=true;\r\n"
				+ "       	for(uint i=0; i<roleList.length;i++){\r\n"
				+ "       	     if(roles[roleList[i]]==0x0000000000000000000000000000000000000000){\r\n"
				+ "                result=false;\r\n" + "                break;\r\n" + "            }\r\n"
				+ "       	}\r\n" + "       	if(result){\r\n" + "       	    enable(\"" + startEventAdd + "\");\r\n"
				+ "				" + parseSid(startEventAdd) + "();\r\n" + "       	}\r\n"
				+ "			emit functionDone(\"Contract creation\"); \n "
				+ "  }\r\n"*/
				" function getRoles() public view returns( string[] memory, address[] memory){\n" +
				"    uint c = roleList.length;\n" +
				"    string[] memory allRoles = new string[](c);\n" +
				"    address[] memory allAddresses = new address[](c);\n" +
				"    \n" +
				"    for(uint i = 0; i < roleList.length; i ++){\n" +
				"        allRoles[i] = roleList[i];\n" +
				"        allAddresses[i] = roles[roleList[i]];\n" +
				"    }\n" +
				"    return (allRoles, allAddresses);\n" +
				"}\n";
				if(!optionalRoles.isEmpty()) {
					//System.out.println("optional empty?: " + optionalRoles.isEmpty());
					other += "   function getOptionalRoles() public view returns( string[] memory, address[] memory){\n" +
							"       require(optionalList.length > 0);\n" +
							"       uint c = optionalList.length;\n" +
							"       string[] memory allRoles = new string[](c);\n" +
							"       address[] memory allAddresses = new address[](c);\n" +
							"       \n" +
							"       for(uint i = 0; i < optionalList.length; i ++){\n" +
							"           allRoles[i] = optionalList[i];\n" +
							"           allAddresses[i] = optionalRoles[optionalList[i]];\n" +
							"       }\n" +
							"    \n" +
							"       return (allRoles, allAddresses);\n" +
							"   }\n"
							+ "\nfunction subscribe_as_participant(string memory _role) public {\r\n"
							+ "        if(optionalRoles[_role]==0x0000000000000000000000000000000000000000){\r\n"
							+ "          optionalRoles[_role]=msg.sender;\r\n" + "        }\r\n" + "    }\n";
				}
				other+= "function() external payable{\r\n" + "    \r\n" + "}";

		return intro + constr + other;
	}

	private String lastFunctions() {
		String descr = "	function enable(string memory _taskID, uint position) internal {\n" +
				"		elements[position] = Element(_taskID, State.ENABLED);\n" +
				"	}\n"+
				"    function disable(uint elementNum) internal {\n" +
				"		elements[elementNum].status=State.DISABLED; }\r\n"
				+ "\r\n"
				+ "    function done(uint elementNum) internal {\n" +
				" 		elements[elementNum].status=State.DONE; " +
				"			emit functionDone(elements[elementNum].ID);\n" +
				"		 }\r\n"
				+ "   \r\n"
				+ "    function getCurrentState()public view  returns(Element[" + (elementsID.size()+1) + "] memory, StateMemory memory){\r\n"
				+ "        // emit stateChanged(elements, currentMemory);\r\n"
				+ "        return (elements, currentMemory);\r\n" + "    }\r\n" + "    \r\n"
				+ "    function compareStrings (string memory a, string memory b) internal pure returns (bool) { \r\n"
				+ "        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); \r\n" + "    }\n}";

		return descr;
	}

	private  void fileAll(String a, String fileName) throws IOException, Exception {
		FileWriter wChor = new FileWriter(new File(ContractFunctions.projectPath + File.separator + "resources"
				+ File.separator + ContractFunctions.parseName(fileName, ".sol")));
		BufferedWriter bChor = new BufferedWriter(wChor);
		bChor.write(a);
		bChor.flush();
		bChor.close();
		//System.out.println("Solidity contract created.");

	}

	private  String typeParse(String toParse) {
		String n = toParse.replace("string", "").replace("uint", "").replace("bool", "");
		// String[] tokens = n.split(" ");
		return n;
	}

	private  String addMemory(String toParse) {
		// System.out.println(toParse);
		String n = toParse.replace("string ", "string memory ");
		// String[] tokens = n.split(" ");
		return n;
	}

	private  String addToMemory(String msg) {
		String add = "";
		String n = msg.replace("string", "").replace("uint", "").replace("bool", "").replace(" ", "");
		String r = n.replace(")", "");
		String[] t = r.split("\\(");
		String[] m = t[1].split(",");

		for (String value : m) {

			add += "currentMemory." + value + "=" + value + ";\n";
		}

		return add;
	}

	private  String createTransaction(ChoreographyTask task, List<String> optionalRoles,
                                            List<String> mandatoryRoles) {
		String ret = "";
		Participant toPay = task.getParticipantRef();
		if(mandatoryRoles.contains(toPay.getName())){
            ret = "roles[\"" + toPay.getName() + "\"].transfer(msg.value);";
        }
         else if(optionalRoles.contains(toPay.getName())){
            ret = "optionalRoles[\"" + toPay.getName() + "\"].transfer(msg.value);";
        }
		/*String n = msg.replace("address", "").replace("payable", "");
		String r = n.replace(")", "");
		String[] t = r.split("\\(");
		ret = t[1] + ".transfer(msg.value);";*/


		return ret;
	}

	private  String addGlobal(String name) {
		String r = name.replace(")", "");
		String[] t = r.split("\\(");
		String[] m = t[1].split(",");
		for (String param : m) {
			gatewayGuards.add(param);
		}

		return "";
	}

	// Function for getting the parameters of a function,
	// without the name of the choreography message
	private  String getPrameters(String messageName) {
		// System.out.println("GETPARAM: " + messageName);
		String[] parsedMsgName = messageName.split("\\(");
		

		return "(" + parsedMsgName[1];
	}

	// If the guard is a string (ex. var=="value") result is compare
	// string(currentMemory.var, "value")
	// if is var==var result is currentMemory.var, var
	private  String addCompareString(String guards) {
		//String guards = outgoing.getAttributeValue("name");

		String res = "";
		/*if(guards.contains("&&")){
			String and = addCompareString(guards.split("&&")[1]);
		}else if(guards.contains("||")){
			String or = addCompareString(guards.split("or")[1]);
		}*/
		if (guards.contains("\"")) {
			String[] guardValue = guards.split("==");
			res = "compareStrings(currentMemory." + guardValue[0] + ", " + guardValue[1] + ")==true";
		} else if(guards.contains("==")){
			res = "currentMemory." + guards;
		} else if(guards.contains(">=")){
			String[] guardValue = guards.split(">=");
			res = "currentMemory." + guardValue[0] + ">= currentMemory." + guardValue[1] ;
		} else if(guards.contains(">")){
			String[] guardValue = guards.split(">");
			res = "currentMemory." + guardValue[0] + "> currentMemory." + guardValue[1] ;
		} else if(guards.contains("<=")){
			String[] guardValue = guards.split("<=");
			res = "currentMemory." + guardValue[0] + "<= currentMemory." + guardValue[1] ;
		} else if(guards.contains("<")){
			String[] guardValue = guards.split("<");
			res = "currentMemory." + guardValue[0] + "< currentMemory." + guardValue[1] ;
		}

		// System.out.println("RESULTT: " + res);
		return res;
	}

	private  String parseSid(String sid) {
		return sid.replace("-", "_");
	}

	public String FlowNodeSearch(List<String> optionalRoles, List<String> mandatoryRoles) {
		String choreographyFile = " ";
		// check for all SequenceFlow elements in the BPMN model
		for (SequenceFlow flow : modelInstance.getModelElementsByType(SequenceFlow.class)) {
			// node to be processed, created by the target reference of the sequence flow
			ModelElementInstance node = modelInstance.getModelElementById(flow.getAttributeValue("targetRef"));
			// node containing the source of the flow, useful to get the start element
			ModelElementInstance start = modelInstance.getModelElementById(flow.getAttributeValue("sourceRef"));
			if (start instanceof StartEvent) {
				// checking and processing all the outgoing nodes
				String me = start.getAttributeValue("id");
				nodeSet.add(me);
				elementsID.add(me);
				mergeMap(start.getAttributeValue("id"), "internal", start.getAttributeValue("name"));
				roleFortask.add("internal");
				//tasks.add(start.getAttributeValue("name"));
				setMartsiaMaps(me, 2);

				if(taskIdInt.get(me) == null){
					globalCounter++;
					taskIdInt.put(me, globalCounter);
				}
				int myNumericID = taskIdInt.get(me);

				for (SequenceFlow outgoing : ((StartEvent) start).getOutgoing()) {
					ModelElementInstance nextNode = modelInstance
							.getModelElementById(outgoing.getAttributeValue("targetRef"));

					start.setAttributeValue("name", "startEvent_" + startCounter);
					startCounter++;

					String next = getNextId(nextNode, false);
					//counter representing the id of elements in the solidity array

					if(taskIdInt.get(next) == null){
						globalCounter++;
						taskIdInt.put(next, globalCounter);
					}
					int enableInt = taskIdInt.get(next);

					startEventAdd = start.getAttributeValue("id");

					String descr = "function " + parseSid(getNextId(start, false)) + "() private {\n"
							+ "	require(elements[" + myNumericID + "].status==State.ENABLED);\n" +
							"	done(" + myNumericID + ");\n"
							+ "\tenable(\"" + next +"\"," + enableInt + ");\n";
					if (nextNode instanceof Gateway)
						descr += parseSid(nextNode.getAttributeValue("id")) + " (); \n}\n\n";
					else
						descr += "\n}\n\n";
					choreographyFile = choreographyFile.concat(descr);
				}
			}
			if (node instanceof ExclusiveGateway && !nodeSet.contains(getNextId(node, false))) {
				if (node.getAttributeValue("name") == null) {
					node.setAttributeValue("name", "exclusiveGateway_" + xorCounter);
					xorCounter++;
				}



				//nodeSet.add(getNextId(node, false));
				String me = parseSid(getNextId(node, false));

				nodeSet.add(me);
				//int myNumericID = nodeSet.indexOf(me);
				if(taskIdInt.get(me) == null){
					globalCounter++;
					taskIdInt.put(me, globalCounter);
				}
				int myNumericID = taskIdInt.get(me);

				mergeMap(start.getAttributeValue("id"), "internal", start.getAttributeValue("name"));

				elementsID.add(getNextId(node, false));
				roleFortask.add("internal");

				mergeMap(getNextId(node, false), "internal", node.getAttributeValue("name"));
				//tasks.add(node.getAttributeValue("name"));

				String descr = "function " + parseSid(getNextId(node, false)) + "() private {\n"
						+ "		require(elements[" + myNumericID+ "].status==State.ENABLED);\n" +
						"		done(" + myNumericID + ");\n";
				int countIf = 0;
				//set type if split or join
				if(((ExclusiveGateway) node).getOutgoing().size() > 1){
					setMartsiaMaps(me, 3);
				}else if(((ExclusiveGateway) node).getIncoming().size() > 1){
					setMartsiaMaps(me, 4);
				}

				for (SequenceFlow outgoing : ((ExclusiveGateway) node).getOutgoing()) {

					ModelElementInstance nextElement = modelInstance
							.getModelElementById(outgoing.getAttributeValue("targetRef"));
					String next = getNextId(nextElement, false);

					//counter for representing the id of the element in the solidity array
					//mapping between the next element and the id in the sol array
					if(taskIdInt.get(next) == null){
						globalCounter++;
						taskIdInt.put(next, globalCounter);
					}
					int enableInt = taskIdInt.get(next);

					enableElements.add(next);

					// checking if there are conditions on the next element, conditions are set
					// in the name of the sequence flow
					if (outgoing.getAttributeValue("name") != null) {
						String condition = "";
						if(countIf > 0){
							condition = "else if";
						}else{
							condition = "if";
						}


						descr += condition +"(" + addCompareString(outgoing.getAttributeValue("name")) + "){" +
								"enable(\"" + next + "\", " + enableInt + "); \n ";
						if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
							descr += parseSid(getNextId(nextElement, false)) + "(); \n";
						}
						descr += "}\n";
						countIf++;
					} else {
						descr += "\tenable(\"" + next + "\", "+ enableInt + ");  \n";
						if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
							descr += parseSid(getNextId(nextElement, false)) + "(); \n";
						}
					}

				}
				descr += "}\n\n";
				choreographyFile = choreographyFile.concat(descr);
			} else if (node instanceof EventBasedGateway && !nodeSet.contains(getNextId(node, false))) {

				if (node.getAttributeValue("name") == null) {
					node.setAttributeValue("name", "eventBasedGateway_" + eventBasedCounter);
					eventBasedCounter++;
				}
				String me = getNextId(node, false);
				setMartsiaMaps(me, 7);
				nodeSet.add(me);
				//int myNumericID = nodeSet.indexOf(me);
				if(taskIdInt.get(me) == null){
					globalCounter++;
					taskIdInt.put(me, globalCounter);
				}
				int myNumericID = taskIdInt.get(me);
				mergeMap(start.getAttributeValue("id"), "internal", start.getAttributeValue("name"));


				elementsID.add(getNextId(node, false));

				roleFortask.add("internal");
				mergeMap(getNextId(node, false), "internal", node.getAttributeValue("name"));
				//tasks.add(node.getAttributeValue("name"));
				String descr = "function " + parseSid(getNextId(node, false)) + "() private {\n"
						+ "	require(elements[" + myNumericID + "].status==State.ENABLED);\n" +
						"	done(" + myNumericID + ");\n";
				for (SequenceFlow outgoing : ((EventBasedGateway) node).getOutgoing()) {
					ModelElementInstance nextElement = modelInstance
							.getModelElementById(outgoing.getAttributeValue("targetRef"));
					String next = getNextId(nextElement, false);

					//counter for representing the id of the element in the solidity array
					//mapping between the next element and the id in the sol array
					if(taskIdInt.get(next) == null){
						globalCounter++;
						taskIdInt.put(next, globalCounter);
					}
					int enableInt = taskIdInt.get(next);
					descr += "\tenable(\"" + next +  "\"," + enableInt+"); \n";
				}
				descr += "}\n\n";
				choreographyFile += descr;
			} else if (node instanceof ParallelGateway && !nodeSet.contains(getNextId(node, false))) {

				if (node.getAttributeValue("name") == null) {
					node.setAttributeValue("name", "parallelGateway_" + parallelCounter);
					parallelCounter++;
				}
				String me = getNextId(node, false);

				nodeSet.add(me);
				//int myNumericID = nodeSet.indexOf(me);
				if(taskIdInt.get(me) == null){
					globalCounter++;
					taskIdInt.put(me, globalCounter);
				}
				int myNumericID = taskIdInt.get(me);

				elementsID.add(getNextId(node, false));
				roleFortask.add("internal");

				mergeMap(getNextId(node, false), "internal", node.getAttributeValue("name"));
				//tasks.add(node.getAttributeValue("name"));
				String descr = "function " + parseSid(getNextId(node, false)) + "() private { \n"
						+ "	require(elements[" + myNumericID +"].status==State.ENABLED);\n" +
						"	done(" + myNumericID + ");\n";

				// if the size of incoming nodes is 1 -> flows split
				if (((ParallelGateway) node).getIncoming().size() == 1) {
					setMartsiaMaps(me, 5);

					for (SequenceFlow outgoing : ((ParallelGateway) node).getOutgoing()) {
						ModelElementInstance nextElement = modelInstance
								.getModelElementById(outgoing.getAttributeValue("targetRef"));
						String next = getNextId(nextElement, false);
						//counter for representing the id of the element in the solidity array

						//mapping between the next element and the id in the sol array
						if(taskIdInt.get(next) == null){
							globalCounter++;
							taskIdInt.put(next, globalCounter);
						}
						int enableInt = taskIdInt.get(next);

						descr += "\tenable(\"" + next +  "\", " + enableInt + "); \n";
						if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
							descr += parseSid(getNextId(nextElement, false)) + "(); \n";
						}
					}
					descr += "}\n\n";
					choreographyFile += descr;
					// if the size of the outgoing nodes is 1 -> flows converging
				} else if (((ParallelGateway) node).getOutgoing().size() == 1) {
					setMartsiaMaps(me, 6);
					descr += "\tif( ";
					int lastCounter = 0;
					for (SequenceFlow incoming : ((ParallelGateway) node).getIncoming()) {
						lastCounter++;
						ModelElementInstance prevElement = modelInstance
								.getModelElementById(incoming.getAttributeValue("sourceRef"));
						if(taskIdInt.get(getNextId(prevElement, false)) == null){
							globalCounter++;
							taskIdInt.put(getNextId(prevElement, false), globalCounter);
						}
						int prevNumericID = taskIdInt.get(getNextId(prevElement, false));

						descr += "elements[" + prevNumericID + "].status==State.DONE ";

						if (lastCounter == ((ParallelGateway) node).getIncoming().size()) {
							descr += "";
						} else {
							descr += "&& ";
						}
					}
					descr += ") { \n";
					for (SequenceFlow outgoing : ((ParallelGateway) node).getOutgoing()) {
						ModelElementInstance nextElement = modelInstance
								.getModelElementById(outgoing.getAttributeValue("targetRef"));
						String next = getNextId(nextElement, false);
						//counter for representing the id of the element in the solidity array

						//mapping between the next element and the id in the sol array
						if(taskIdInt.get(next) == null){
							globalCounter++;
							taskIdInt.put(next, globalCounter);
						}
						int enableInt = taskIdInt.get(next);


						descr += "\tenable(\"" + next +  "\", " + enableInt + "); \n";
						if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
							descr += parseSid(getNextId(nextElement, false)) + "(); \n";
						}

						descr += "}} \n\n";
						choreographyFile += descr;
					}
				}
			} else if (node instanceof EndEvent && !nodeSet.contains(getNextId(node, false))) {
				if (node.getAttributeValue("name") == null) {
					node.setAttributeValue("name", "endEvent_" + endEventCounter);
					endEventCounter++;
				}
				String me = getNextId(node, false);
				setMartsiaMaps(me, 8);

				nodeSet.add(me);
				//int myNumericID = nodeSet.indexOf(me);
				if(taskIdInt.get(me) == null){
					globalCounter++;
					taskIdInt.put(me, globalCounter);
				}
				int myNumericID = taskIdInt.get(me);

				elementsID.add(getNextId(node, false));
				roleFortask.add("internal");
				mergeMap(getNextId(node, false), "internal", node.getAttributeValue("name"));
				//tasks.add(node.getAttributeValue("name"));
				String descr = "function " + parseSid(getNextId(node, false)) + "() private {\n"
						+ "	require(elements[" + myNumericID + "].status==State.ENABLED);\n" +
						"	done(" + myNumericID + ");  }\n\n";
				choreographyFile += descr;
			} else if (node instanceof ModelElementInstanceImpl && !(node instanceof EndEvent)
					&& !(node instanceof ParallelGateway) && !(node instanceof ExclusiveGateway)
					&& !(node instanceof EventBasedGateway) && (checkTaskPresence(getNextId(node, false)) == false)) {

				boolean taskNull = false;
				String me = getNextId(node, false);
				nodeSet.add(me);
				//int myNumericID = nodeSet.indexOf(me);
				if(taskIdInt.get(me) == null){
					globalCounter++;
					taskIdInt.put(me, globalCounter);
				}
				int myNumericID = taskIdInt.get(me);
				request = "";
				response = "";

				String descr = "";
				Participant participant = null;
				String participantName = "";
				ChoreographyTask task = new ChoreographyTask((ModelElementInstanceImpl) node, modelInstance);
				getRequestAndResponse(task);

				participant = modelInstance.getModelElementById(task.getInitialParticipant().getId());

				participantName = participant.getAttributeValue("name");

				String[] req = response.split(" ");
				// String res = typeParse(request);
				String ret = "";
				String call = "";
				String eventBlock = "";

				if (start instanceof EventBasedGateway) {
					for (SequenceFlow block : ((EventBasedGateway) start).getOutgoing()) {
						ModelElementInstance nextElement = modelInstance
								.getModelElementById(block.getAttributeValue("targetRef"));
						if (!(getNextId(nextElement, false).equals(getNextId(node, false)))) {
							String prev = getNextId(nextElement, false);
							nodeSet.add(prev);
							if(taskIdInt.get(prev) == null){
								globalCounter++;
								taskIdInt.put(prev, globalCounter);
							}
							int prevNumericID = taskIdInt.get(prev);
							eventBlock += "disable(" + prevNumericID + ");\n";
						}
					}
				}
				// if there isn't a response the function created is void

				// da cambiare se funziona, levare 'if-else
				if (task.getType() == ChoreographyTask.TaskType.ONEWAY) {
					setMartsiaMaps(parseSid(getNextId(node, false)), 1);

					//taskIdAndMartsiaId.put(parseSid(getNextId(node, false)), (int) (Math.random() * (1000000 - 1)) + 1);
					taskNull = false;
					String pName = getRole(participantName, optionalRoles, mandatoryRoles);

					if (request.contains("payment")) {
						descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
								+ " public payable " + pName + ") {\n";
						descr += "	require(elements[" + myNumericID+ "].status==State.ENABLED);\n" +
								"	done(" + myNumericID + ");\n"
								+ createTransaction(task, optionalRoles, mandatoryRoles) + "\n" + eventBlock;
					} else {

						descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
								+ " public " + pName + ") {\n";
						descr += "	require(elements[" + myNumericID + "].status==State.ENABLED);  \n" +
								"	done(" + myNumericID + ");\n"
								+ addToMemory(request) + eventBlock;

						addGlobal(request);
					}
					// roleFortask.add(participantName);

				} else if (task.getType() == ChoreographyTask.TaskType.TWOWAY) {
					taskNull = false;

					String pName = getRole(participantName, optionalRoles, mandatoryRoles);
					
					if (!request.isEmpty()) {

						setMartsiaMaps(parseSid(getNextId(node, false)), 1);
						//taskIdAndMartsiaId.put(parseSid(getNextId(node, false)), (int) (Math.random() * (1000000 - 1)) + 1);
						if (request.contains("payment")) {
							String next = getNextId(node, true);


							//counter for representing the id of the element in the solidity array
							//mapping between the next element and the id in the sol array
							if(taskIdInt.get(next) == null){
								globalCounter++;
								taskIdInt.put(next, globalCounter);
							}
							int enableInt = taskIdInt.get(next);

							taskNull = false;
							descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
							+ " public payable " + pName + ") {\n";
					descr += "	require(elements[" + myNumericID + "].status==State.ENABLED);  \n" +
							"	done(" + myNumericID + ");\n"
							+ createTransaction(task, optionalRoles, mandatoryRoles) + "\n"
							+ "	enable(\"" + next + "\"," + enableInt + ");\n"
							+ eventBlock + "}\n";
						} else {
							String next = getNextId(node, true);
							//counter for representing the id of the element in the solidity array

							//mapping between the next element and the id in the sol array
							if(taskIdInt.get(next) == null){
								globalCounter++;
								taskIdInt.put(next, globalCounter);
							}
							int enableInt = taskIdInt.get(next);

							taskNull = false;

							descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
									+ " public " + pName + "){\n";
							descr += "	require(elements[" + myNumericID+"].status==State.ENABLED);  \n" +
									"	done(" + myNumericID + ");\n" +
									"	enable(\"" + next + "\"," + enableInt + ");\n" + addToMemory(request)
									+ eventBlock + "}\n";
							addGlobal(request);
						}
					} else {
						taskNull = true;
					}

					if (!response.isEmpty()) {
						//taskIdAndMartsiaId.put(parseSid(getNextId(node, true)), (int) (Math.random() * (1000000 - 1)) + 1);
						setMartsiaMaps(parseSid(getNextId(node, true)), 1);

						String meR = getNextId(node, true);
						nodeSet.add(meR);
						//int myNumericIDR = nodeSet.indexOf(meR);
						if(taskIdInt.get(meR) == null){
							globalCounter++;
							taskIdInt.put(me, globalCounter);
						}
						int myNumericIDR = taskIdInt.get(meR);
						if (response.contains("payment")) {
							taskNull = false;
							descr += "function " + parseSid(getNextId(node, true)) + addMemory(getPrameters(response))
							+ " public payable " + pName + ") {\n";
					descr += "	require(elements[" + myNumericIDR+"].status==State.ENABLED);  \n" +
							"	done(" + myNumericIDR + ");\n"
							+ createTransaction(task, optionalRoles, mandatoryRoles) + "\n" + eventBlock;
						} else {
							taskNull = false;
							pName = getRole(task.getParticipantRef().getName(), optionalRoles, mandatoryRoles);
							descr += "function " + parseSid(getNextId(node, true)) + addMemory(getPrameters(response))
									+ " public " + pName + "){\n" +
									"	require(elements[" + myNumericIDR + "].status==State.ENABLED);\n" +
									"	done(" + myNumericIDR + ");\n" + addToMemory(response) + eventBlock;
							addGlobal(response);
						}
					} else {
						taskNull = true;
					}

				}
				choreographyFile += descr;
				descr = "";
				// checking the outgoing elements from the task
				if (taskNull == false) {
					
					for (SequenceFlow out : task.getOutgoing()) {
						ModelElementInstance nextElement = modelInstance
								.getModelElementById(out.getAttributeValue("targetRef"));
						String next = getNextId(nextElement, false);

						//counter for representing the id of the element in the solidity array

						//mapping between the next element and the id in the sol array
						if(taskIdInt.get(next) == null){
							globalCounter++;
							taskIdInt.put(next, globalCounter);
						}
						int enableInt = taskIdInt.get(next);

						descr += "\tenable(\"" + next + "\","+enableInt+");\n";
						if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
							// nextElement = checkType(nextElement);
							// creates the call to the next function
							descr += parseSid(getNextId(nextElement, false)) + "(); \n";

						}
						descr += ret;
						descr += "}\n\n";
						choreographyFile += descr;

					}
				}

			}

		}
		return choreographyFile;
	}

	public String getRole(String part, List<String> optionalRoles, List<String> mandatoryRoles) {
		String res = "";
		for (int i = 0; i < mandatoryRoles.size(); i++) {

			if ((mandatoryRoles.get(i)).equals(part)) {
				res = "checkRole(roleList[" + i + "]";
				return res;
			}
		}
		for (int o = 0; o < optionalRoles.size(); o++) {
			if ((optionalRoles.get(o)).equals(part)) {
				res = "checkRole(optionalList[" + o + "]";
				return res;
			}
		}

		return res;
	}

	public void getRequestAndResponse(ChoreographyTask task) {
		// if there is only the response
		Participant participant = modelInstance.getModelElementById(task.getInitialParticipant().getId());
		String participantName = participant.getAttributeValue("name");

		if (task.getRequest() == null && task.getResponse() != null) {
			// System.out.println("task.getRequest() = null: " + task.getRequest());
			MessageFlow responseMessageFlowRef = task.getResponse();
			MessageFlow responseMessageFlow = modelInstance.getModelElementById(responseMessageFlowRef.getId());
			Message responseMessage = modelInstance
					.getModelElementById(responseMessageFlow.getAttributeValue("messageRef"));

			if (!responseMessage.getAttributeValue("name").isEmpty()) {
				elementsID.add(responseMessage.getId());
				response = responseMessage.getAttributeValue("name");
				//tasks.add(response);
				roleFortask.add(task.getParticipantRef().getName());
				mergeMap(responseMessage.getId(), task.getParticipantRef().getName(), response);
			}

		}
		// if there is only the request
		else if (task.getRequest() != null && task.getResponse() == null) {
			MessageFlow requestMessageFlowRef = task.getRequest();
			MessageFlow requestMessageFlow = modelInstance.getModelElementById(requestMessageFlowRef.getId());
			Message requestMessage = modelInstance
					.getModelElementById(requestMessageFlow.getAttributeValue("messageRef"));
			if (!requestMessage.getAttributeValue("name").isEmpty()) {
				elementsID.add(requestMessage.getId());
				request = requestMessage.getAttributeValue("name");
				//tasks.add(request);
				roleFortask.add(participantName);
				mergeMap(requestMessage.getId(), participantName, request);
			}

		}
		// if there are both
		else {
			MessageFlow requestMessageFlowRef = task.getRequest();
			MessageFlow responseMessageFlowRef = task.getResponse();
			MessageFlow requestMessageFlow = modelInstance.getModelElementById(requestMessageFlowRef.getId());
			MessageFlow responseMessageFlow = modelInstance.getModelElementById(responseMessageFlowRef.getId());
			Message requestMessage = modelInstance
					.getModelElementById(requestMessageFlow.getAttributeValue("messageRef"));
			Message responseMessage = modelInstance
					.getModelElementById(responseMessageFlow.getAttributeValue("messageRef"));
			if (requestMessage.getAttributeValue("name") != null) {
				elementsID.add(requestMessage.getId());
				request = requestMessage.getAttributeValue("name");
				//tasks.add(request);
				roleFortask.add(participantName);
				mergeMap(requestMessage.getId(), participantName, request);
			}
			if (responseMessage.getAttributeValue("name") != null) {
				
				elementsID.add(responseMessage.getId());
				response = responseMessage.getAttributeValue("name");
				//tasks.add(response);
				roleFortask.add(task.getParticipantRef().getName());
				mergeMap(responseMessage.getId(), task.getParticipantRef().getName(), response);
			}

		}

	}

	// Controller for the node type, if gateway it sets the next function name and
	// the counter
	private  ModelElementInstance checkType(ModelElementInstance nextNode) {
		if (nextNode instanceof ExclusiveGatewayImpl && !nodeSet.contains(getNextId(nextNode, false))) {
			nextNode.setAttributeValue("name", "exclusiveGateway_" + xorCounter);
			xorCounter++;
		} else if (nextNode instanceof EventBasedGatewayImpl && !nodeSet.contains(getNextId(nextNode, false))) {
			nextNode.setAttributeValue("name", "eventBasedGateway_" + eventBasedCounter);
			eventBasedCounter++;
		} else if (nextNode instanceof ParallelGatewayImpl && !nodeSet.contains(getNextId(nextNode, false))) {
			nextNode.setAttributeValue("name", "parallelGateway_" + parallelCounter);
			parallelCounter++;
		} else if (nextNode instanceof EndEventImpl && !nodeSet.contains(getNextId(nextNode, false))) {
			nextNode.setAttributeValue("name", "endEvent_" + endEventCounter);
			endEventCounter++;
		}
		return nextNode;
	}

	// return the next node id, useful to retrieve the first message id in case of
	// Choreography task
	private String getNextId(ModelElementInstance nextNode, boolean msg) {
		String id = "";
		// System.out.println(nextNode.getClass());
		if (nextNode instanceof ModelElementInstanceImpl && !(nextNode instanceof EndEvent)
				&& !(nextNode instanceof ParallelGateway) && !(nextNode instanceof ExclusiveGateway)
				&& !(nextNode instanceof EventBasedGateway) && !(nextNode instanceof StartEvent)) {
			ChoreographyTask task = new ChoreographyTask((ModelElementInstanceImpl) nextNode, modelInstance);
			if (task.getRequest() != null && msg == false) {
				//System.out.println("SONO DENTRO GETrEQUEST != NULL");
				MessageFlow requestMessageFlowRef = task.getRequest();
				MessageFlow requestMessageFlow = modelInstance.getModelElementById(requestMessageFlowRef.getId());
				// //System.out.println("MESSAGAE FLOW REF ID:" + requestMessageFlowRef.getId());
				Message requestMessage = modelInstance
						.getModelElementById(requestMessageFlow.getAttributeValue("messageRef"));
				if (requestMessage.getName() != null) {
					//System.out.println("SONO DENTRO REQUEST.GETNAME != NULL");
					id = requestMessage.getAttributeValue("id");
				} else {
					//System.out.println("SONO DENTRO LA RISPOSTA PERCH� REQUEST.GETNAME � NULL");
					MessageFlow responseMessageFlowRef = task.getResponse();
					MessageFlow responseMessageFlow = modelInstance.getModelElementById(responseMessageFlowRef.getId());
					Message responseMessage = modelInstance
							.getModelElementById(responseMessageFlow.getAttributeValue("messageRef"));
					// if(!responseMessage.getAttributeValue("name").isEmpty()) {
					id = responseMessage.getAttributeValue("id");
					// }

				}

				// System.out.println("ID MESSAGE REF: " + id + "uguale a?" +
				// requestMessageFlow.getAttributeValue("messageRef"));
				// System.out.println(requestMessage.getName());

			} else if (task.getRequest() == null && msg == false || task.getResponse() != null && msg == true) {
				//System.out.println("SONO DENTRO GETREQUEST == NULL");
				MessageFlow responseMessageFlowRef = task.getResponse();
				MessageFlow responseMessageFlow = modelInstance.getModelElementById(responseMessageFlowRef.getId());
				Message responseMessage = modelInstance
						.getModelElementById(responseMessageFlow.getAttributeValue("messageRef"));
				if (responseMessage.getName() != null) {
					id = responseMessage.getAttributeValue("id");
				}

			}//
			/*
			 * else if(task.getResponse()!= null && msg == true) { MessageFlow
			 * responseMessageFlowRef = task.getResponse(); id =
			 * responseMessageFlowRef.getId(); }
			 */
		} else {
			id = nextNode.getAttributeValue("id");
		}
		//System.out.println("GET ID RETURNS: " + id);
		return id;
	}
//
	private boolean checkTaskPresence(String sid) {
		// System.out.println(sid);
		boolean isPresent = false;
		for (String id : elementsID) {
			if (sid.equals(id)) {
				isPresent = true;
				return isPresent;
			}
		}
		return isPresent;
	}

}
