

package com.unicam.rest;

import io.reactivex.Flowable;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;
/*
/**
 * <p>Auto generated code.
 * <p><strong>Do not modify!</strong>
 * <p>Please use the <a href="https://docs.web3j.io/command_line.html">web3j command line tools</a>,
 * or the org.web3j.codegen.SolidityFunctionWrapperGenerator in the 
 * <a href="https://github.com/web3j/web3j/tree/master/codegen">codegen module</a> to update.
 *
 * <p>Generated with web3j version 4.0.3.
 */
public class Test_event extends Contract {
    private static final String BINARY = "608060405234801561001057600080fd5b5061019d806100206000396000f3fe608060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806301d2775514610046575b600080fd5b61004e6100c9565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561008e578082015181840152602081019050610073565b50505050905090810190601f1680156100bb5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b60607fcd598c56ed9a93d530ea75505196aa21154522cb354fe8f294edb82be31870483334604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a16040805190810160405280600c81526020017f68656c6c6f20776f726c6421000000000000000000000000000000000000000081525090509056fea165627a7a723058201967445e3c9cfaf781411475b5dac40d1ed761ff3f109bdf19c96aac92fd5e6e0029";

    public static final String FUNC_EVENTOUT = "eventOut";

    public static final Event EVENTO1_EVENT = new Event("Evento1", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}, new TypeReference<Uint256>() {}));
    ;

    @Deprecated
    protected Test_event(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected Test_event(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected Test_event(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected Test_event(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public RemoteCall<TransactionReceipt> eventOut(BigInteger weiValue) {
        final Function function = new Function(
                FUNC_EVENTOUT, 
                Arrays.<Type>asList(), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function, weiValue);
    }

    public List<Evento1EventResponse> getEvento1Events(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(EVENTO1_EVENT, transactionReceipt);
        ArrayList<Evento1EventResponse> responses = new ArrayList<Evento1EventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            Evento1EventResponse typedResponse = new Evento1EventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse._from = (String) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse._value = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<Evento1EventResponse> evento1EventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, Evento1EventResponse>() {
            @Override
            public Evento1EventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(EVENTO1_EVENT, log);
                Evento1EventResponse typedResponse = new Evento1EventResponse();
                typedResponse.log = log;
                typedResponse._from = (String) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse._value = (BigInteger) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<Evento1EventResponse> evento1EventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(EVENTO1_EVENT));
        return evento1EventFlowable(filter);
    }

    @Deprecated
    public static Test_event load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new Test_event(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static Test_event load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new Test_event(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static Test_event load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new Test_event(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static Test_event load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new Test_event(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<Test_event> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(Test_event.class, web3j, credentials, contractGasProvider, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<Test_event> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(Test_event.class, web3j, credentials, gasPrice, gasLimit, BINARY, "");
    }

    public static RemoteCall<Test_event> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(Test_event.class, web3j, transactionManager, contractGasProvider, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<Test_event> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(Test_event.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, "");
    }

    public static class Evento1EventResponse {
        public Log log;

        public String _from;

        public BigInteger _value;
    }
}
