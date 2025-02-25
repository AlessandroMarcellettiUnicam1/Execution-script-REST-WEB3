package com.unicam.translator;

import java.io.BufferedWriter;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.impl.instance.EndEventImpl;
import org.camunda.bpm.model.bpmn.impl.instance.EventBasedGatewayImpl;
import org.camunda.bpm.model.bpmn.impl.instance.ExclusiveGatewayImpl;
import org.camunda.bpm.model.bpmn.impl.instance.ParallelGatewayImpl;
import org.camunda.bpm.model.bpmn.instance.Message;
import org.camunda.bpm.model.bpmn.instance.MessageFlow;
import org.camunda.bpm.model.bpmn.instance.ParallelGateway;
import org.camunda.bpm.model.bpmn.instance.Participant;
import org.camunda.bpm.model.bpmn.instance.FlowNode;
import org.camunda.bpm.model.bpmn.instance.Gateway;
import org.camunda.bpm.model.bpmn.instance.SequenceFlow;
import org.camunda.bpm.model.bpmn.instance.StartEvent;
import org.camunda.bpm.model.xml.impl.instance.ModelElementInstanceImpl;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import com.unicam.model.ContractObject;
import com.unicam.model.User;
import com.unicam.rest.ContractFunctions;

import org.camunda.bpm.model.bpmn.instance.EndEvent;
import org.camunda.bpm.model.bpmn.instance.EventBasedGateway;
import org.camunda.bpm.model.bpmn.instance.ExclusiveGateway;

public class OLD_Choreography {
	public static int startint;
	private static BpmnModelInstance modelInstance;
	public static ArrayList<String> participantsWithoutDuplicates;
	public static ArrayList<String> partecipants;
	public static ArrayList<String> functions;
	public static Collection<FlowNode> allNodes;
	public static int startCounter;
	public static Integer xorCounter;
	public static Integer parallelCounter;
	public static Integer eventBasedCounter;
	public static Integer endEventCounter;
	public static String choreographyFile;
	public ArrayList<DomElement> participantsTask;
	public ArrayList<DomElement> msgTask;
	public ArrayList<SequenceFlow> taskIncoming, taskOutgoing;
	public static ArrayList<String> nodeSet;
	public static String request;
	public static String response;
	public static ArrayList<String> gatewayGuards;
	public static ArrayList<String> toBlock;
	public static List<String> tasks;
	public static ContractObject finalContract;
	public static List<String> elementsID;
	private static String startEventAdd;
	private static List<String> roleFortask;
	private static LinkedHashMap<String, String> taskIdAndRole;
	private static LinkedHashMap<String, Integer> taskIdAndMartsiaId;
	// static String projectPath = System.getProperty("user.dir")+ "/workspace";

	public boolean start(File bpmnFile, Map<String, User> participants, List<String> optionalRoles,
			List<String> mandatoryRoles) throws Exception {
		try {
			OLD_Choreography choreography = new OLD_Choreography();
			choreography.readFile(bpmnFile);
			choreography.getParticipants();
			choreography.FlowNodeSearch(optionalRoles, mandatoryRoles);
			choreographyFile = choreography.initial(bpmnFile.getName(), participants, optionalRoles, mandatoryRoles)
					+ choreographyFile;
			choreographyFile += choreography.lastFunctions();
			finalContract = new ContractObject(null, null, null, null, gatewayGuards, taskIdAndRole, taskIdAndMartsiaId);
			choreography.fileAll(bpmnFile.getName());
			System.out.println("messagesvalue:" + Arrays.toString(taskIdAndMartsiaId.values().toArray()));
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

	}

	public void mergeMap(String id, String role) {
		taskIdAndRole.put(id, role);

	}

	public OLD_Choreography() {
		roleFortask = new ArrayList<String>();
		elementsID = new ArrayList<String>();
		tasks = new ArrayList<String>();
		gatewayGuards = new ArrayList<String>();
		partecipants = new ArrayList<String>();
		startint = 0;
		startCounter = 0;
		xorCounter = 0;
		eventBasedCounter = 0;
		parallelCounter = 0;
		endEventCounter = 0;
		choreographyFile = "";
		this.participantsTask = new ArrayList<DomElement>();
		this.msgTask = new ArrayList<DomElement>();
		this.taskIncoming = new ArrayList<SequenceFlow>();
		this.taskOutgoing = new ArrayList<SequenceFlow>();
		nodeSet = new ArrayList<>();
		request = "";
		response = "";
		startEventAdd = "";
		taskIdAndRole = new LinkedHashMap<String, String>();
		taskIdAndMartsiaId = new LinkedHashMap<>();
	}

	public void readFile(File bpFile) throws IOException {
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

	private static String initial(String filename, Map<String, User> participants, List<String> optionalRoles,
			List<String> mandatoryRoles) {
		String intro = "pragma solidity ^0.5.3; \n" + "	pragma experimental ABIEncoderV2;\n" + "	contract "
				+ ContractFunctions.parseName(filename, "") + "{\n" +
				//"		uint counter;\r\n"
				//+ "	event stateChanged(uint);  \n"
				 "	event functionDone(string);\n"
				+ "	mapping (string=>uint) position;\n"
				+ "\n	enum State {DISABLED, ENABLED, DONE} State s; \n" + "	mapping(string => string) operator; \n"
				+ "	struct Element{\n	string ID;\n	State status;\n}\n" + "	struct StateMemory{\n	";
		for (String guard : gatewayGuards) {
			intro += guard + ";\n";
		}
		intro += "}\n" + "	Element[] elements;\n	  StateMemory currentMemory;\n" + "	string[] elementsID = [";
		for (String elID : elementsID) {
			// System.out.println();
			if (elID.equals(elementsID.get(elementsID.size() - 1))) {
				// System.out.println("sono uguale: " + elID + " e: " +
				// elementsID.get(elementsID.size()-1));
				intro += "\"" + elID + "\"];\n";
			} else
				intro += "\"" + elID + "\", ";

		}

		intro += "	string[] roleList = [ ";

		for (int i = 0; i < mandatoryRoles.size(); i++) {
			intro += "\"" + mandatoryRoles.get(i) + "\"";
			if ((i + 1) < mandatoryRoles.size())
				intro += ", ";
		}
		intro += " ]; \n";
		intro += "	string[] optionalList = [";
		if (optionalRoles.isEmpty()) {
			intro += "\"\"";
		} else {
			for (int i = 0; i < optionalRoles.size(); i++) {
				intro += "\"" + optionalRoles.get(i) + "\"";
				if ((i + 1) < optionalRoles.size())
					intro += ", ";
			}
		}

		intro += " ]; \n" + "	mapping(string=>address payable) roles; \r\n"
				+ "	mapping(string=>address payable) optionalRoles; \r\n";
		String constr = "constructor() public{\r\n" + "    //struct instantiation\r\n"
				+ "    for (uint i = 0; i < elementsID.length; i ++) {\r\n"
				+ "        elements.push(Element(elementsID[i], State.DISABLED));\r\n"
				+ "        position[elementsID[i]]=i;\r\n" + "    }\r\n" + "         \r\n"
				+ "         //roles definition\r\n" + "         //mettere address utenti in base ai ruoli\r\n";
		int i = 0;
		for (Map.Entry<String, User> sub : participants.entrySet()) {

			constr += "	roles[\"" + sub.getKey() + "\"] = " + sub.getValue().getAddress() + ";\n";
			i++;
		}
		for (String optional : optionalRoles) {
			constr += "	optionalRoles[\"" + optional + "\"] = 0x0000000000000000000000000000000000000000;";
		}

		/*
		 * "         roles[\"Buyer\"] = 0x0000000000000000000000000000000000000000;\r\n"
		 * +
		 * "         roles[\"Buyer\"] = 0x0000000000000000000000000000000000000000;\r\n"
		 * +
		 * "         roles[\"Buyer\"] = 0x0000000000000000000000000000000000000000;\r\n"
		 * +
		 * "         roles[\"Buyer\"] = 0x0000000000000000000000000000000000000000;\r\n"
		 * +
		 */

		constr += "         \r\n" + "         //enable the start process\r\n" + "         init();\r\n" + "    }\r\n"
				+ "    ";

		String other = "modifier checkMand(string memory role){ \n" +
				"	require(msg.sender == roles[role]); \n\t_; }\n" +
				"modifier checkOpt(string memory role){\n" +
				"	require(msg.sender == optionalRoles[role]); \n\t_; }\n" +
				"modifier Owner(string memory task) \n"
				+ "{ \n\trequire(elements[position[task]].status==State.ENABLED);\n\t_;\n}\n"
				+ "function init() internal{\r\n" + "       bool result=true;\r\n"
				+ "       	for(uint i=0; i<roleList.length;i++){\r\n"
				+ "       	     if(roles[roleList[i]]==0x0000000000000000000000000000000000000000){\r\n"
				+ "                result=false;\r\n" + "                break;\r\n" + "            }\r\n"
				+ "       	}\r\n" + "       	if(result){\r\n" + "       	    enable(\"" + startEventAdd + "\");\r\n"
				+ "				" + parseSid(startEventAdd) + "();\r\n" + "       	}\r\n"
				+ "			emit functionDone(\"Contract creation\"); \n "
				+ "  }\r\n"
				+ " function getRoles() public view returns( string[] memory, address[] memory){\n" +
				"    uint c = roleList.length;\n" +
				"    string[] memory allRoles = new string[](c);\n" +
				"    address[] memory allAddresses = new address[](c);\n" +
				"    \n" +
				"    for(uint i = 0; i < roleList.length; i ++){\n" +
				"        allRoles[i] = roleList[i];\n" +
				"        allAddresses[i] = roles[roleList[i]];\n" +
				"    }\n" +
				"    return (allRoles, allAddresses);\n" +
				"}" +
                "   function getOptionalRoles() public view returns( string[] memory, address[] memory){\n" +
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
				+ "          optionalRoles[_role]=msg.sender;\r\n" + "        }\r\n" + "    }\n"
				+ "function() external payable{\r\n" + "    \r\n" + "}";

		return intro + constr + other;
	}

	private String lastFunctions() {
		String descr = " function enable(string memory _taskID) internal {\n" +
				"	elements[position[_taskID]].status=State.ENABLED; }\n"
				//+ "     emit stateChanged(counter++);\r\n" + "}\r\n" + "\r\n"
				+ "    function disable(string memory _taskID) internal { elements[position[_taskID]].status=State.DISABLED; }\r\n"
				+ "\r\n"
				+ "    function done(string memory _taskID) internal { elements[position[_taskID]].status=State.DONE; " +
				"			emit functionDone(_taskID);\n" +
				"		 }\r\n"
				+ "   \r\n"
				+ "    function getCurrentState()public view  returns(Element[] memory, StateMemory memory){\r\n"
				+ "        // emit stateChanged(elements, currentMemory);\r\n"
				+ "        return (elements, currentMemory);\r\n" + "    }\r\n" + "    \r\n"
				+ "    function compareStrings (string memory a, string memory b) internal pure returns (bool) { \r\n"
				+ "        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); \r\n" + "    }\n}";

		return descr;
	}

	private static void fileAll(String fileName) throws IOException, Exception {
		FileWriter wChor = new FileWriter(new File(ContractFunctions.projectPath + File.separator + "resources"
				+ File.separator + ContractFunctions.parseName(fileName, ".sol")));
		BufferedWriter bChor = new BufferedWriter(wChor);
		bChor.write(choreographyFile);
		bChor.flush();
		bChor.close();
		//System.out.println("Solidity contract created.");

	}

	private static String typeParse(String toParse) {
		String n = toParse.replace("string", "").replace("uint", "").replace("bool", "");
		// String[] tokens = n.split(" ");
		return n;
	}

	private static String addMemory(String toParse) {
		// System.out.println(toParse);
		String n = toParse.replace("string ", "string memory ");
		// String[] tokens = n.split(" ");
		return n;
	}

	private static String addToMemory(String msg) {
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

	private static String createTransaction(ChoreographyTask task, List<String> optionalRoles,
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

	private static String addGlobal(String name) {
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
	private static String getPrameters(String messageName) {
		// System.out.println("GETPARAM: " + messageName);
		String[] parsedMsgName = messageName.split("\\(");
		

		return "(" + parsedMsgName[1];
	}

	// If the guard is a string (ex. var=="value") result is compare
	// string(currentMemory.var, "value")
	// if is var==var result is currentMemory.var, var
	private static String addCompareString(String guards) {
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

	private static String parseSid(String sid) {
		return sid.replace("-", "_");
	}

	public void FlowNodeSearch(List<String> optionalRoles, List<String> mandatoryRoles) {
		// check for all SequenceFlow elements in the BPMN model
		for (SequenceFlow flow : modelInstance.getModelElementsByType(SequenceFlow.class)) {
			// node to be processed, created by the target reference of the sequence flow
			ModelElementInstance node = modelInstance.getModelElementById(flow.getAttributeValue("targetRef"));

			// node containing the source of the flow, useful to get the start element
			ModelElementInstance start = modelInstance.getModelElementById(flow.getAttributeValue("sourceRef"));
			if (start instanceof StartEvent) {
				// checking and processing all the outgoing nodes
				for (SequenceFlow outgoing : ((StartEvent) start).getOutgoing()) {
					ModelElementInstance nextNode = modelInstance
							.getModelElementById(outgoing.getAttributeValue("targetRef"));

					start.setAttributeValue("name", "startEvent_" + startCounter);
					startCounter++;
					nodeSet.add(start.getAttributeValue("id"));
					mergeMap(start.getAttributeValue("id"), "internal");
					elementsID.add(start.getAttributeValue("id"));
					roleFortask.add("internal");
					tasks.add(start.getAttributeValue("name"));

					startEventAdd = start.getAttributeValue("id");
					//

					// nextNode = checkType(nextNode);

					// System.out.println("NEXT NODE ID AFTER CHECK TYPE: " +
					// nextNode.getAttributeValue("id"));
					// id = getNextId(nextNode);
					String descr = "function " + parseSid(getNextId(start, false)) + "() private {\n"
							+ "	require(elements[position[\"" + start.getAttributeValue("id")
							+ "\"]].status==State.ENABLED);\n" + "	done(\"" + start.getAttributeValue("id") + "\");\n"
							+ "\tenable(\"" + getNextId(nextNode, false) + "\");  \n\t";
					if (nextNode instanceof Gateway)
						descr += parseSid(nextNode.getAttributeValue("id")) + " (); \n}\n\n";
					else
						descr += "\n}\n\n";
					choreographyFile += descr;
				}
			}
			if (node instanceof ExclusiveGateway && !nodeSet.contains(getNextId(node, false))) {
				if (node.getAttributeValue("name") == null) {
					node.setAttributeValue("name", "exclusiveGateway_" + xorCounter);
					xorCounter++;
				}

				nodeSet.add(getNextId(node, false));
				elementsID.add(getNextId(node, false));
				roleFortask.add("internal");
				mergeMap(getNextId(node, false), "internal");
				tasks.add(node.getAttributeValue("name"));
				String descr = "function " + parseSid(getNextId(node, false)) + "() private {\n"
						+ "	require(elements[position[\"" + node.getAttributeValue("id")
						+ "\"]].status==State.ENABLED);\n" + "	done(\"" + node.getAttributeValue("id") + "\");\n";
				int countIf = 0;
				for (SequenceFlow outgoing : ((ExclusiveGateway) node).getOutgoing()) {
					ModelElementInstance nextElement = modelInstance
							.getModelElementById(outgoing.getAttributeValue("targetRef"));
					// checking if there are conditions on the next element, conditions are setted
					// in the name of the sequence flow
					if (outgoing.getAttributeValue("name") != null) {
						String condition = "";
						if(countIf > 0){
							condition = "else if";
						}else{
							condition = "if";
						}


						descr += condition +"(" + addCompareString(outgoing.getAttributeValue("name")) + "){" + "enable(\"" + getNextId(nextElement, false)
								+ "\"); \n ";
						if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
							descr += parseSid(getNextId(nextElement, false)) + "(); \n";
						}
						descr += "}\n";
						countIf++;
					} else {
						descr += "\tenable(\"" + getNextId(nextElement, false) + "\");  \n";
						if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
							descr += parseSid(getNextId(nextElement, false)) + "(); \n";
						}
					}

				}
				descr += "}\n\n";
				choreographyFile += descr;
			} else if (node instanceof EventBasedGateway && !nodeSet.contains(getNextId(node, false))) {

				if (node.getAttributeValue("name") == null) {
					node.setAttributeValue("name", "eventBasedGateway_" + eventBasedCounter);
					eventBasedCounter++;
				}
				nodeSet.add(getNextId(node, false));
				elementsID.add(getNextId(node, false));
				roleFortask.add("internal");
				mergeMap(getNextId(node, false), "internal");
				tasks.add(node.getAttributeValue("name"));
				String descr = "function " + parseSid(getNextId(node, false)) + "() private {\n"
						+ "	require(elements[position[\"" + node.getAttributeValue("id")
						+ "\"]].status==State.ENABLED);\n" + "	done(\"" + node.getAttributeValue("id") + "\");\n";
				for (SequenceFlow outgoing : ((EventBasedGateway) node).getOutgoing()) {
					ModelElementInstance nextElement = modelInstance
							.getModelElementById(outgoing.getAttributeValue("targetRef"));
					descr += "\tenable(\"" + getNextId(nextElement, false) + "\"); \n";
				}
				descr += "}\n\n";
				choreographyFile += descr;
			} else if (node instanceof ParallelGateway && !nodeSet.contains(getNextId(node, false))) {

				if (node.getAttributeValue("name") == null) {
					node.setAttributeValue("name", "parallelGateway_" + parallelCounter);
					parallelCounter++;
				}
				nodeSet.add(getNextId(node, false));
				elementsID.add(getNextId(node, false));
				roleFortask.add("internal");
				mergeMap(getNextId(node, false), "internal");
				tasks.add(node.getAttributeValue("name"));
				String descr = "function " + parseSid(getNextId(node, false)) + "() private { \n"
						+ "	require(elements[position[\"" + node.getAttributeValue("id")
						+ "\"]].status==State.ENABLED);\n" + "	done(\"" + node.getAttributeValue("id") + "\");\n";
				// if the size of incoming nodes is 1 -> flows split
				if (((ParallelGateway) node).getIncoming().size() == 1) {
					for (SequenceFlow outgoing : ((ParallelGateway) node).getOutgoing()) {
						ModelElementInstance nextElement = modelInstance
								.getModelElementById(outgoing.getAttributeValue("targetRef"));
						descr += "\tenable(\"" + getNextId(nextElement, false) + "\"); \n";
						if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
							descr += parseSid(getNextId(nextElement, false)) + "(); \n";
						}
					}
					descr += "}\n\n";
					choreographyFile += descr;
					// if the size of the outgoing nodes is 1 -> flows converging
				} else if (((ParallelGateway) node).getOutgoing().size() == 1) {
					descr += "\tif( ";
					int lastCounter = 0;
					for (SequenceFlow incoming : ((ParallelGateway) node).getIncoming()) {
						lastCounter++;
						ModelElementInstance prevElement = modelInstance
								.getModelElementById(incoming.getAttributeValue("sourceRef"));
						descr += "elements[position[\"" + getNextId(prevElement, false) + "\"]].status==State.DONE ";

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
						descr += "\tenable(\"" + getNextId(nextElement, false) + "\"); \n";
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
				nodeSet.add(getNextId(node, false));
				elementsID.add(getNextId(node, false));
				roleFortask.add("internal");
				mergeMap(getNextId(node, false), "internal");
				tasks.add(node.getAttributeValue("name"));
				String descr = "function " + parseSid(getNextId(node, false)) + "() private {\n"
						+ "	require(elements[position[\"" + node.getAttributeValue("id")
						+ "\"]].status==State.ENABLED);\n" + "	done(\"" + node.getAttributeValue("id") + "\");  }\n\n";
				choreographyFile += descr;
			} else if (node instanceof ModelElementInstanceImpl && !(node instanceof EndEvent)
					&& !(node instanceof ParallelGateway) && !(node instanceof ExclusiveGateway)
					&& !(node instanceof EventBasedGateway) && (checkTaskPresence(getNextId(node, false)) == false)) {

				boolean taskNull = false;
				nodeSet.add(getNextId(node, false));

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
							eventBlock += "disable(\"" + getNextId(nextElement, false) + "\");\n";
						}
					}
				}
				// if there isn't a response the function created is void

				// da cambiare se funziona, levare 'if-else
				if (task.getType() == ChoreographyTask.TaskType.ONEWAY) {
					taskIdAndMartsiaId.put(parseSid(getNextId(node, false)), (int) (Math.random() * (1000000 - 1)) + 1);
					//System.out.println("Task � 1 way");
					taskNull = false;
					String pName = getRole(participantName, optionalRoles, mandatoryRoles);

					if (request.contains("payment")) {
						//System.out.println("nome richiesta: " + request);
						descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
								+ " public payable " + pName + ") {\n";
						descr += "	require(elements[position[\"" + getNextId(node, false)
								+ "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node, false) + "\");\n"
								+ createTransaction(task, optionalRoles, mandatoryRoles) + "\n" + eventBlock;
					} else {

						descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
								+ " public " + pName + ") {\n";
						descr += "	require(elements[position[\"" + getNextId(node, false)
								+ "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node, false) + "\");\n"
								+ addToMemory(request) + eventBlock;

						addGlobal(request);
					}
					// roleFortask.add(participantName);

				} else if (task.getType() == ChoreographyTask.TaskType.TWOWAY) {
					taskNull = false;
					//System.out.println("Task � 2 way");

					String pName = getRole(participantName, optionalRoles, mandatoryRoles);
					
					if (!request.isEmpty()) {
						taskIdAndMartsiaId.put(parseSid(getNextId(node, false)), (int) (Math.random() * (1000000 - 1)) + 1);
						if (request.contains("payment")) {
							//System.out.println(request);
							//System.out.println("RICHIESTA CONTIENE PAGAMENTO");
							taskNull = false;
							descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
							+ " public payable " + pName + ") {\n";
					descr += "	require(elements[position[\"" + getNextId(node, false)
							+ "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node, false) + "\");\n"
							+ createTransaction(task, optionalRoles, mandatoryRoles) + "\n"
							+ "	enable(\"" + getNextId(node, true) + "\");\n"
							+ eventBlock + "}\n";
						} else {
							taskNull = false;

							descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
									+ " public " + pName + "){\n";
							descr += "	require(elements[position[\"" + getNextId(node, false)
									+ "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node, false)
									+ "\");\n" + "	enable(\"" + getNextId(node, true) + "\");\n" + addToMemory(request)
									+ eventBlock + "}\n";
							addGlobal(request);
						}
					} else {
						taskNull = true;
					}

					if (!response.isEmpty()) {
						taskIdAndMartsiaId.put(parseSid(getNextId(node, true)), (int) (Math.random() * (1000000 - 1)) + 1);
						if (response.contains("payment")) {
							//System.out.println(response);
							//System.out.println("RISPOSTA CONTIENE PAGAMENTO");
							taskNull = false;
							descr += "function " + parseSid(getNextId(node, true)) + addMemory(getPrameters(response))
							+ " public payable " + pName + ") {\n";
					descr += "	require(elements[position[\"" + getNextId(node, true)
							+ "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node, true) + "\");\n"
							+ createTransaction(task, optionalRoles, mandatoryRoles) + "\n" + eventBlock;
						} else {
							taskNull = false;
							pName = getRole(task.getParticipantRef().getName(), optionalRoles, mandatoryRoles);
							descr += "function " + parseSid(getNextId(node, true)) + addMemory(getPrameters(response))
									+ " public " + pName + "){\n" + "	require(elements[position[\""
									+ getNextId(node, true) + "\"]].status==State.ENABLED);\n" + "	done(\""
									+ getNextId(node, true) + "\");\n" + addToMemory(response) + eventBlock;
							addGlobal(response);
						}
					} else {
						taskNull = true;
					}

				}
				choreographyFile += descr;
				descr = "";
				// checking the outgoing elements from the task
				//System.out.println("TASK NULL � : " + taskNull);
				if (taskNull == false) {
					
					for (SequenceFlow out : task.getOutgoing()) {
						ModelElementInstance nextElement = modelInstance
								.getModelElementById(out.getAttributeValue("targetRef"));
						descr += "\tenable(\"" + getNextId(nextElement, false) + "\");\n";
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
	}

	public String getRole(String part, List<String> optionalRoles, List<String> mandatoryRoles) {
		String res = "";
		for (int i = 0; i < mandatoryRoles.size(); i++) {

			if ((mandatoryRoles.get(i)).equals(part)) {
				res = "checkMand(roleList[" + i + "]";
				return res;
			}
		}
		for (int o = 0; o < optionalRoles.size(); o++) {
			if ((optionalRoles.get(o)).equals(part)) {
				res = "checkOpt(optionalList[" + o + "]";
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
				tasks.add(response);
				roleFortask.add(task.getParticipantRef().getName());
				mergeMap(responseMessage.getId(), task.getParticipantRef().getName());
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
				tasks.add(request);
				roleFortask.add(participantName);
				mergeMap(requestMessage.getId(), participantName);
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
				tasks.add(request);
				roleFortask.add(participantName);
				mergeMap(requestMessage.getId(), participantName);
			}
			if (responseMessage.getAttributeValue("name") != null) {
				
				elementsID.add(responseMessage.getId());
				response = responseMessage.getAttributeValue("name");
				tasks.add(response);
				roleFortask.add(task.getParticipantRef().getName());
				mergeMap(responseMessage.getId(), task.getParticipantRef().getName());
			}

		}

	}

	// Controller for the node type, if gateway it sets the next function name and
	// the counter
	private static ModelElementInstance checkType(ModelElementInstance nextNode) {
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
	private static String getNextId(ModelElementInstance nextNode, boolean msg) {
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
