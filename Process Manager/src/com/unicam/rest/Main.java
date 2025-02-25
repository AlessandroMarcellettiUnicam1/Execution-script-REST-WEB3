package com.unicam.rest;

import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.Ethereum;
import org.web3j.protocol.core.Response;
import org.web3j.protocol.core.methods.response.*;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.ChainId;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.utils.Numeric;
import org.web3j.crypto.Credentials;

import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Main {

    Web3j web3j = Web3j.build(new HttpService("https://rpc.sepolia.dev"));



    public static void main(String[] args) throws Exception {
        Main m = new Main();
        m.deploy();
    }




    public void deploy() throws Exception {



        BigInteger blockGasLimit = web3j.ethGetBlockByNumber(DefaultBlockParameterName.LATEST, false).send().getBlock().getGasLimit();


        EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount("0x7A8b4561691eE6f93402217aD7a9f379c1C2660d", DefaultBlockParameterName.LATEST).sendAsync().get();
        BigInteger nonce = ethGetTransactionCount.getTransactionCount();

        System.out.println(" deploy started with nonce: " + nonce);
        Credentials credentials = Credentials.create("dad1db4a930242b448e57c830cdda2445ca46ebb50103ea02427141f8a0fa58f");
        System.out.println(ChainId.RINKEBY);
        TransactionManager transactionManager = new RawTransactionManager(web3j, credentials, (byte) 11155111);


        //byte[] signedMessage = TransactionEncoder.signMessage(ta, credentials);
        //String hexValue = Numeric.toHexString(signedMessage);

        String hash = transactionManager.sendTransaction(
                BigInteger.valueOf(5_000_000_000L),
                BigInteger.valueOf(9_000_000L),
                null,
                "0x0x0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100d9565b60405180910390f35b610073600480360381019061006e919061009d565b61007e565b005b60008054905090565b8060008190555050565b60008135905061009781610103565b92915050565b6000602082840312156100b3576100b26100fe565b5b60006100c184828501610088565b91505092915050565b6100d3816100f4565b82525050565b60006020820190506100ee60008301846100ca565b92915050565b6000819050919050565b600080fd5b61010c816100f4565b811461011757600080fd5b5056fea2646970667358221220404e37f487a89a932dca5e77faaf6ca2de3b991f93d230604b1b8daaef64766264736f6c63430008070033",
                BigInteger.valueOf(0)
        ).getError().getMessage();

        System.out.println(hash);

        /*RawTransaction ta = RawTransaction.createContractTransaction(
                nonce,
                BigInteger.valueOf(0),
                BigInteger.valueOf(200_000),
                BigInteger.valueOf(0),
                "0x0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100d9565b60405180910390f35b610073600480360381019061006e919061009d565b61007e565b005b60008054905090565b8060008190555050565b60008135905061009781610103565b92915050565b6000602082840312156100b3576100b26100fe565b5b60006100c184828501610088565b91505092915050565b6100d3816100f4565b82525050565b60006020820190506100ee60008301846100ca565b92915050565b6000819050919050565b600080fd5b61010c816100f4565b811461011757600080fd5b5056fea2646970667358221220404e37f487a89a932dca5e77faaf6ca2de3b991f93d230604b1b8daaef64766264736f6c63430008070033"
        );

        Credentials credentials = Credentials.create("4b10c0509b8f7a8639b602d388510f88d9a95083008377ef7f795c19d6d595f4");
        byte[] signedMessage = TransactionEncoder.signMessage(ta, credentials);
        String hexValue = Numeric.toHexString(signedMessage);


        EthSendTransaction c = web3j.ethSendRawTransaction(hexValue).send();
        String transactionHash = c.getTransactionHash();
        EthGetTransactionReceipt transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();

        for (int i = 0; i < 222220; i++) {
            if (!transactionReceipt.getTransactionReceipt().isPresent()) {
                //Thread.sleep(5000);
                transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();
            } else {
                break;
            }
        }
        TransactionReceipt t = transactionReceipt.getTransactionReceipt().get();
        System.out.println(t.getContractAddress());
*/


      // System.out.println(t.getContractAddress());
        /*if(transactionResponse.hasError()) {
            System.out.println(transactionResponse.getError().getData());
            System.out.println(transactionResponse.getError().getMessage());
        }*/
        //String transactionHash = transactionResponse.getTransactionHash();


        //transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();


        /*for (int i = 0; i < 222220; i++) {
            if (!transactionReceipt.getTransactionReceipt().isPresent()) {
                //Thread.sleep(5000);
                transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();
            } else {
                break;
            }
        }

        TransactionReceipt transactionReceiptFinal = transactionReceipt.getTransactionReceipt().get();

        System.out.println(transactionReceipt);
        System.out.println(transactionReceipt.getRawResponse());

        String contractAddress = transactionReceiptFinal.getContractAddress();
        System.out.println(contractAddress);*/


    }
}
