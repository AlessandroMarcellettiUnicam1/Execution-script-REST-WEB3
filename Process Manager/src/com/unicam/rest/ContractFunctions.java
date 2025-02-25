package com.unicam.rest;

import java.io.BufferedReader;
import java.io.File;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.unicam.model.MartsiaInstance;
import com.unicam.translator.MartsiaTranslator;
import org.web3j.abi.datatypes.*;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint32;
import org.web3j.abi.datatypes.generated.Uint64;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.methods.response.*;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Numeric;
import com.unicam.model.ContractObject;
import com.unicam.model.Parameters;
import com.unicam.model.User;
import org.web3j.abi.FunctionEncoder;
import org.web3j.codegen.SolidityFunctionWrapperGenerator;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.crypto.WalletUtils;

public class ContractFunctions {


	private List<String> participants;
	public List<String> tasks;
	public List<ContractObject> allFunctions;
	public String CONTRACT_ADDRESS = "";
	//private static final String VirtualProsAccount = "0x7A224d367EB99e849dC80F3d7b9FAC9E03Fe8Be0";

	public static boolean pendingTransaction = false;
	
	//public static String projectPath = "/home/virtualpros/ChorChainStorage";
	public static String projectPath = System.getenv("ChorChain"); 

    Web3j web3j = Web3j.build(new HttpService("https://polygon-amoy.g.alchemy.com/v2/xSwh6Ed_TryIu1KO0oz3sdAKZABnDDfs"));




	public ContractObject createSolidity(String fileName, Map<String, User> participants, List<String> freeRoles, List<String> mandatoryRoles) {
		//wrapper("StateContract");
		MartsiaTranslator cho = new MartsiaTranslator();
		File f = new File(projectPath + File.separator + "bpmn"+ File.separator + fileName);
		ContractObject contract = new ContractObject();
		try {
			contract = cho.start(f, participants, freeRoles, mandatoryRoles);
		} catch (Exception e) {
			tasks = null;
			e.printStackTrace();
		}
		return contract;
	}

	public MartsiaInstance createMartsiaData(ContractObject existingContractObject, String fileName, Map<String, User> participants, List<String> freeRoles,
											 List<String> mandatoryRoles) throws IOException {

		File f = new File(projectPath + File.separator + "bpmn"+ File.separator + fileName);

		MartsiaTranslator cho = new MartsiaTranslator();
		MartsiaInstance m = cho.getMartsiaData(f, participants, freeRoles, mandatoryRoles, existingContractObject);
		return m;
	}
	
	
	public void compile(String fileName) {
		try {
			String fin = parseName(fileName, ".sol");

			String solPath = projectPath + File.separator + "resources" + File.separator + fin;
			//System.out.println("Solidity PATH: " + solPath);
			String destinationPath = projectPath +  File.separator + "resources";//sostituire compiled a resources
			//System.out.println("destination path "+destinationPath);solc_old
			String[] comm = { "solc_old", solPath, "--bin", "--abi", "--overwrite", "-o", destinationPath };
			
			
			//String comm = "solc " + solPath + "--bin --abi --optimize -o " + destinationPath;

			Runtime rt = Runtime.getRuntime();

			Process p = rt.exec(comm);
			BufferedReader bri = new BufferedReader(new InputStreamReader(p.getInputStream()));
			BufferedReader bre = new BufferedReader(new InputStreamReader(p.getErrorStream()));
			String line;
			while ((line = bri.readLine()) != null) {
			     System.out.println(line);
			}
			bri.close();
			while ((line = bre.readLine()) != null) {
			     System.out.println(line);
			}
			bre.close();
			p.waitFor();
			  
			
			//System.out.println("abi-bin done");

		} catch (Exception e) {
			e.printStackTrace();

		}
	}

	public void wrapper(String fileName) {
		String path = projectPath + File.separator + "resources" + File.separator;
		String p = Paths.get("").toAbsolutePath().normalize().toString();
  		String abiPath = path + parseName(fileName, ".abi");
		String binPath = path + parseName(fileName, ".bin");

		String[] args2 = {"-a", abiPath, "-b", binPath, "-o", "src", "-p",
				projectPath + File.separator + "resources" + File.separator, };

		SolidityFunctionWrapperGenerator.main(args2);
	}

	public Credentials getCredentialFromPrivateKey(String privateKey) throws IOException {
		// return WalletUtils.loadCredentials("psw",
		// "src/main/resources/UTC--2018-12-06T16-44-54.114315504Z--19a3f868355394b5423106fb31f201da646139af");
		return Credentials.create(privateKey);
	}

	public static String parseName(String name, String extension) {
		String[] oldName = name.split("\\.");

		String newName = oldName[0] + extension;
		return newName;
	}

	public String reflection(String toExec, String role) {
		String finalName = "";
		//System.out.println("sobo dentro al metodo");

		try {
			Class c = Class.forName("com.unicam.resources.Abstract");

			Method methods[] = c.getDeclaredMethods();

			Credentials credentials;

			credentials = WalletUtils.loadCredentials("123",
					projectPath + "/ChorChain/src/com/unicam/resources/UTC--2019-01-16T15-25-24.286179700Z--1adc6ea9d2ddc4dcb45bfc36f01ca8e266026155");
			//credentials = getCredentialFromPrivateKey("02D671CA1DC73973ED1E8FB53AA73235CC788DA792E41DB4170616EDED86D23D");
			
			//Credentials credentials1 = WalletUtils.loadCredentials("123", "C:/Users/Alessandro/Desktop/ChorChain/src/com/unicam/resources/UTC--2019-01-25T17-30-24.611307800Z--c3939b1fb6c589fc8636085dd4c52e9b61dab675");

			RemoteCall returnv;

			// controllo l'array contenente i metodi per cercare il deploy
			for (Method method : methods) {
				if (method.getName() == "deploy" && toExec == "deploy") {

					Parameter[] params = method.getParameters();

					if (params.length == 3
							&& !params[1].getType().toString().equals(TransactionManager.class.toString())) {

						Object arglist[] = new Object[3];
						arglist[0] = web3j;
						arglist[1] = credentials;
						arglist[2] = new DefaultGasProvider();
						//System.out.println(arglist.length);
						returnv = (RemoteCall) method.invoke(c, arglist);
						// invio la remote call generata dal deploy
						Object address = returnv.send();
						CONTRACT_ADDRESS = ((Contract) address).getContractAddress();

						//System.out.println("Contract deployed at --> " + CONTRACT_ADDRESS + "<--");
						return null;

					}
				} else if (method.getName() == "subscribe_as_participant" && toExec == "subscribe_as_participant") {
					Class[] parameterTypes = new Class[4];
					parameterTypes[0] = String.class;
					parameterTypes[1] = Web3j.class;
					parameterTypes[2] = Credentials.class;
					parameterTypes[3] = ContractGasProvider.class;

					Method loadContract = c.getMethod("load", parameterTypes);
					Contract contract = (Contract) loadContract.invoke(c, CONTRACT_ADDRESS, web3j, credentials,
							new DefaultGasProvider());


					Object arglist[] = new Object[2];
					arglist[0] = role;
					arglist[1] = new BigInteger("0");
					RemoteCall<TransactionReceipt> returnv1 = (RemoteCall<TransactionReceipt>) method.invoke(contract,
							arglist);
					TransactionReceipt t = returnv1.send();
				    if (t != null) {

						Class[] parameter = new Class[1];
						parameter[0] = TransactionReceipt.class;
						Method getEvent = c.getMethod("getInfoEvents", parameter);

						List<Object> events = (List<Object>) getEvent.invoke(contract, t);
						for (Object e : events) {
							Field fi = e.getClass().getDeclaredField("next");
							//System.out.println(fi.get(e));
							finalName = (String) fi.get(e);
							return finalName;
							/*for (ContractObject co : allFunctions) {
								if(co.getName() == finalName) {
									return co;
								}
							}*/
						}
					}
					return null;
				}
			}
		}

		catch (Exception e) {
			e.printStackTrace();
		}
		
		return null;

	}

	public String readLineByLineJava8(String filePath, boolean bin) {
		StringBuilder contentBuilder = new StringBuilder();

		try (Stream<String> stream = Files.lines(Paths.get(filePath), StandardCharsets.UTF_8)) {
			if(bin)
				stream.forEach(s -> contentBuilder.append(s));
			else
				stream.forEach(s -> contentBuilder.append(s).append("\n"));
		} catch (IOException e) {
			e.printStackTrace();
		}

		return contentBuilder.toString();
	}



	public String deploy(String bin) throws Exception {
		  /*if(pendingTransaction == true) {
			  System.out.println("C'è una transazione pendente");
			  return "ERROR";
		  }*/
		 

		//sostituire resources con compiled
		String binar = new String ( Files.readAllBytes( Paths.get(projectPath + "/resources/" + parseName(bin, ".bin"))));

		System.out.println("gas price preso dinamico " + web3j.ethGasPrice().send().getGasPrice());
		BigInteger GAS_PRICE = web3j.ethGasPrice().send().getGasPrice();
		//BigInteger GAS_PRICE = BigInteger.valueOf(60_500_000_000L);

		BigInteger GAS_LIMIT = web3j.ethGetBlockByNumber(DefaultBlockParameterName.LATEST, false).send().getBlock().getGasLimit();
		EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount("0xaeD0aBbD8C55caf1247ED157C5b7c7bB4F358354", DefaultBlockParameterName.LATEST).sendAsync().get();
		BigInteger nonce = ethGetTransactionCount.getTransactionCount();

		Credentials credentials = getCredentialFromPrivateKey("aacba4659f823b5c2a6ce40b17d5fbd2a32636d4e41baea4d71600252002b995");
		System.out.println("Deploy started with nonce: " + nonce + " e nonce pending: " + nonce);


		RawTransaction ta = RawTransaction.createContractTransaction(
				nonce,
				GAS_PRICE,
				GAS_LIMIT,
				BigInteger.valueOf(0),
				"0x" + binar

		);

		//TransactionEncoder.signMessage(ta, 11155111, credentials);5777
		byte[] signedMessage = TransactionEncoder.signMessage(ta, 80001, credentials);
		String hexValue = Numeric.toHexString(signedMessage);


		long startTime = System.nanoTime();




		 EthSendTransaction transactionResponse = web3j.ethSendRawTransaction(hexValue).sendAsync().get();
		  //da scommentare EthEstimateGas estimation = web3j.ethEstimateGas(transaction1).send();
		//da scommentare BigInteger amountUsed = estimation.getAmountUsed();
		  // System.out.println("AMOUNT OF GAS USED: " + amountUsed + "AND current gas block limit(not used): " + blockGasLimit);
		  //send sync
		//da scommentare EthSendTransaction transactionResponse = web3j.ethSendTransaction(transaction1).sendAsync().get();
		System.out.println("Transaction sent with reponse: " + transactionResponse.getTransactionHash());

		  pendingTransaction = true;
		 if(transactionResponse.hasError()) {
		 	  System.out.println(transactionResponse.getError().getData());
		 	  System.out.println(transactionResponse.getError().getMessage());

		   }
		   String transactionHash = transactionResponse.getTransactionHash();
		System.out.println("Thash: " + transactionHash);
       EthGetTransactionReceipt transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();
		 
		  //Optional<TransactionReceipt> receiptOptional = transactionReceipt.getTransactionReceipt();
		  for (int i = 0; i < 222220; i++) {
	            if (!transactionReceipt.getTransactionReceipt().isPresent()) {
	                //Thread.sleep(5000);
					System.out.println("iter...");
	                transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();
	            } else {
	                break;
	            }
		  }
		  TransactionReceipt transactionReceiptFinal = transactionReceipt.getTransactionReceipt().get();
		long endTime = System.nanoTime();
		long timeElapsed = endTime - startTime;


		//System.out.println("CONTRACT DEPLOY TIME ATOMIC: " + timeElapsed / 1000000);
		System.out.println(transactionReceipt.getError());
		System.out.println(transactionReceipt.getRawResponse());
		  //System.out.println(transactionReceiptFinal.getContractAddress());
		  
		  String contractAddress = transactionReceiptFinal.getContractAddress();
		  System.out.println(contractAddress);
		  pendingTransaction = false;
		  //System.out.println(contractAddress);
		  return contractAddress;


		
	}
	
	private static String getStringFromInputStream(InputStream is) {

		BufferedReader br = null;
		StringBuilder sb = new StringBuilder();

		String line;
		try {

			br = new BufferedReader(new InputStreamReader(is));
			while ((line = br.readLine()) != null) {
				sb.append(line);
			}

		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		return sb.toString();

	}
	
	public void signOffline(Parameters parameters, ContractObject contractDb, String account, String functionName) throws Exception {
		LinkedHashMap<String, String> hashed = contractDb.getTaskIdAndRole();
		HashMap<String, String> names = contractDb.getTaskIdAndName();
		//System.out.println("size di hashed: " + hashed.size());
		int b = 0;
		int z = 0;
		int i = 0;
		for(Map.Entry<String, String> taskId : names.entrySet()){
			if(taskId.equals(functionName)) {
				//System.out.println("task trovato : " + contractDb.getTasks().get(i));
				//System.out.println("VALORE DI I : " + i);
				z = i;
				break;
			}
			i++;
		}

		/*for(int i = 0; i < contractDb.getTasks().size(); i++) {
			if(contractDb.getTasks().get(i).equals(functionName)) {

				z = i;
				break;
			}
		}*/
		
		for(Map.Entry<String, String> params : hashed.entrySet()) {
			 //System.out.println("valore di b " + b + " e di i " + z);
			if(b == z) {
				functionName = params.getKey().split("\\(")[0];
				//System.out.println("chiave: " + params.getKey());
				break;
			}else {
				b++;
			}
		 }
		
		//System.out.println("NOME NUOVO DELLA FUNZIONE: " + functionName);
		
		BigInteger GAS_PRICE = BigInteger.valueOf(7_600_000_000L);
		BigInteger GAS_LIMIT = BigInteger.valueOf(6_700_000L);

		EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
				  account, DefaultBlockParameterName.LATEST).sendAsync().get();
		 BigInteger nonce = ethGetTransactionCount.getTransactionCount();
		 //System.out.println(nonce);
		 
		
		 List<Type> t = new ArrayList<Type>();
		 for(Map.Entry<String, String> params : parameters.getParamsAndValue().entrySet()) {
				if(params.getKey().equals("uint")) {
					int intValue = Integer.parseInt(params.getValue());
					t.add(new Uint(BigInteger.valueOf(intValue)));
				}else if(params.getKey().equals("string")) {
					t.add(new Utf8String(params.getValue()));
				}else if(params.getKey().equals("bool")) {
					boolean boolValue = Boolean.parseBoolean(params.getValue());
					t.add(new Bool(boolValue));
				}else if(params.getKey().equals("address")) {
					t.add(new Address(params.getValue()));
				}
			}
		
		 
		 
		 Function function = new Function(
				  functionName, 
				  t, 
				  Collections.emptyList()
				  );
		  
		  
		 String encoded = FunctionEncoder.encode(function);
		
		 
		 RawTransaction ta = RawTransaction.createTransaction(
				 nonce, 
				// BigInteger.valueOf(131),
				 GAS_PRICE, 
				 GAS_LIMIT,
				 //"0xcc8bdb5dd918c9ec86e31b416f627ad0cc5ea22d",
				 contractDb.getAddress(),
				 encoded
				 );

			Credentials credentials = getCredentialFromPrivateKey(parameters.getPrivateKey());
			byte[] signedMessage = TransactionEncoder.signMessage(ta, credentials);
			String hexValue = Numeric.toHexString(signedMessage);
			EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).sendAsync().get();
			//  if(ethSendTransaction.hasError()) {
				  //System.out.println(ethSendTransaction.getError().getData());
				  //System.out.println(ethSendTransaction.getError().getMessage());}
			String transactionHash = ethSendTransaction.getTransactionHash();
			EthGetTransactionReceipt transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();
			  
			  for (int u = 0; u < 222220; u++) {
				  //System.out.println("Wait: " + i);
		            if (!transactionReceipt.getTransactionReceipt().isPresent()) {
		                transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();
		            } else {
		                break;
		            }
			  }
			  TransactionReceipt transactionReceiptFinal = transactionReceipt.getTransactionReceipt().get();
			  //System.out.println(transactionReceiptFinal.getLogs());
			  //System.out.println(transactionReceiptFinal.getLogsBloom());
			
	}

}
