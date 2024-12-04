const {Web3} = require('web3');

// Replace with your Ethereum node provider, e.g., Infura or Alchemy URL
//const providerUrl = 'https://eth-sepolia.g.alchemy.com/v2/aZ2f8OwVa3J2HcSEuQ2OncvsEiHQSNbW';
const providerUrl = 'https://fantom-mainnet.g.alchemy.com/v2/3d_iKpeXYvH7_kk1kfv5kvqxnsJgOCcZ';
//const providerUrl = 'https://polygon-mainnet.infura.io/v3/1bc1dd16772f41d08ec28b970c8c0d47';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

// Replace with your contract address
//const contractAddress = ''0x0c8AbF34c4184d94e5CF5254D30Cf493501d5381';

const transactionHashes = [
    '0x02129386830f29e0e8b099ef682814ff5fe3b7af4af097c03b3d48e1ce0365bc',
    '0xb01d9909eefc70c1b33805f708b0e82bac615cd29f4c07ac3974ca6bce94596f',
    '0x48aed9e8b711ce940f2aa67673f069a854a03a6f50f1b701f4ab59d41b6d2210',
    '0x596674517359811dbcb11162e71305e09f461c8ba0ecc15a6ef7497fd9b1868f',
    '0x554cc6e3f615a8e707c68e12ba22dd0fc145ad50f682dc6b39f9ec5c808cc381',
    '0xce89ad2fc8f73c8b030aa205044c4ef8377cd8fbc9ce269e0c22a42ce9fac508',
    '0xc8de727aaf2be1e1d89093d9234fd26c6c1bc49b0ae748e7153052f9a8e4321a',
    '0xf09fe28167913584cfd233f51953fb9f9bd89dc17fe2e176b1f0ea53246bf9c2',
    '0xdfa6aa6623c656546ee605927b39420364fe055aefd5a1d9c5bcd651b47b11ae',
    '0xe13ebd3f418ca5639732c017293b0bc69def3dbc8c5eb2c46c08b706231beec8',
    '0xd9b246bb658b656501be40c4b9fdd8847802e420fd4eafcfdafa692b69a78ea6',
    '0x876c443114bf6077ec9467bb8f0a44d586088e1fc16f1763ac46f8cf8130f38f',
    '0xdf2466b1ba62df724bf588a8d99564c8d8a77393152c5f026429c9d312a84640',
    '0x662a98aa1d0e75f641a551b419342a8567ee1b11aa4bec830c46f8040e848430',
    '0x0497cd692bbaa33ffd98ae7e61a15f46ebf7591ba2d1778a21abb4f0f3151439',
    '0x63f2136009352b2378a994f8b2f0556994736305bf285601a7846a8e9e8cb3b9',
    '0xd876436132dc751ddae49d23edf5a1afc72b710b32acff6b403cc7a71c257bfc',
    '0x81a82c36fed39ba680e65bfcdfd77a3185dc241d7349eab96011d6bcc4a51441',
    '0xb1cf28633f199399a6c595a63b94ec743f1452f4995669875b8e07a601073593',
    '0x58fb2a098b3bcf29d9f97df8c4ed6d7c979fb93d031bcd3b0e0f9030b0017ca7',
    '0x72e5db3b7e6d4d7ff4dfc848a0a1d7d84adcb26100aad2e893222422bcb26f55',
    '0x368e8c7dab0fe2227511326d0113165aa1e3d471bc53c73ea119f13738ae7f58',
    '0x0f25872e68a950eb8475b94a86ffb590c16629498f247bc7338bb47746c77384',
    '0xcca77d4e3741e3ff808c58e5414dab613d6000c4b6a25b9dac0a2d3ba03fd940',
    '0x8c982e029ff614df9874fadd76bfa2c6f1c99a10eea10cf26aa8d1b0ed59b0d9',
    '0x3e2fb1c885d9d4ea6ed32d02fa454c4ad18af68bab79ff718e32e8b309234d80',
    '0x65839febccd6a204fb1e361b666c6e76e99a8c6e3711954275b133f27a11726a',
    '0x563247e3e0f24c5d83712117bc52a66dcb4b510661212ccf56c4a8c325005296',
    '0xe0fea89978b129a3e983df1fe3eb7f898ee320e56d08e93775bd76ee135b7e79',
    '0xac8f9f5e79f931f3be28f587b9bf018be929c77c4554d7f6115cb72215821040',
    '0x18a638004b07f833f0466617c8e62ce2daae61f0fa9125197332aee55b3258d9',
    '0xc52c80c1bc2e4d370a08b4b4f71814b4b2d5f87a05958afa30367bffcfcd5a3a',
    '0xc50e3e6a9f9bf608462e32e98710d18eefbaf7768c00b1d3509790a0fd4b9097',
    '0x33987158fb33434815db4db7ba2a3f97d8138891aaa632b6b8c4568a9f4d7dc3',
    '0xc070aafddc3feca4dc6be1ca9b32d5013f9eed569385618266c5a7bfae5553f0',
    '0x44e02e85e5f5549305b4ded5d000dde7f97462655a3cf8144bd6e1ba86c25c1b',
    '0x97c3b8906521955cbe6f732a0745ad5f46df907610fbe362fdec983fa63b7bfd',
    '0x010a6db95b1ef05fbc717761d9e42711b6e5e5dc06a05806bdf12f990001d5ec',
    '0x755a2490e2476750c00c41384d741e48e2705cb5ceb0a1cdae77f30e24200e05',
    '0x25e1cde3129c4317948d567163bdda3053efee492b8f1f742fdc55784d836740',
    '0xbc64b4157569451c3a962bc5b36da15dfff362d5b32871428b7a4451c187ec56',
    '0x02cfda477f68612857252f7379cb367363d984a187034d07b04ee7efb50873cd',
    '0x1c36e56599f229da825bf7bcf3c01d8bc21fdb11a7dac20b2f878f00d95402bd',
    '0x142c6546c8ec5b94f2a312c32184dca98de2d93c6a40181d9ee7dba81917ba13',
    '0xf1ab4b4fd34eec4014eaabf0dcce72e911aeb967d52ec2f44ec6357a7df4b26e',
    '0x0f94a7366f509e624d72144d6d8b758a9ed36a00f4e9c514ebb1caaeac090b4b',
    '0x33b07a37c790d60c36b2bedc9d622f437b39b115ea9aadb0c7bc93323e3ef04e',
    '0x7f41937bf412b8974e809ff8b3d096b790e62348c270bf20ef4ddee042fbb3de',
    '0xd9c2e32f1292f44b677d0298485f7aa8f5cf892eb5eb821db15f757e6b0fec2c',
    '0x5ec914d1746a1b5910100187ea22d4059de74ce8d852acc9300514b7543d49de',
    '0x852f6ad16e64e02f9f02a3dfe044c441a48d2c73f778374b767f072a2b4c2799',
    '0x8155afd216543ddefcf4e69f891fbb84a8517965625bd35c29bb5df67fe6347f',
    '0xdf31f9e51dfaf31102a1e4e9b5cacdd04ae2f9e13de8a237ec68ac5e091596ae',
    '0x26f29870c52ec665d260923630b06eb8ad77f7408d78ea0fb8b48eab3710970a',
    '0xd06cd2633216bf64a4c5db299062b00b2bfeae772db4f3f0627000133d5d2680',
    '0x616713ceeab269528ad9c954d96da74d9c17b34b695b8653c58d58b6d234cd80',
    '0x0cfa4bf77560b7815928e19d18be5f9247b82a294bf473e8658d081080960725',
    '0x8a847f73e69485fb4c92f47e9f6cca2d09e085a5d402d2ed3127b90c17461237',
    '0x29d09604cb25bc0a512f8aa237eeebbd66a7be601e5694050a64526e338bd2f4',
    '0x7c7f3dee9c99c360e8835529e0a237cd483d69e6e263be5464cea1fc8bade85a',
    '0x1ce6805b8a719034a21eecb3c3313b764db281fca951f840247615f11811c5fc',
    '0xcdcb36ea64f8f1017515df9ac4cc71920333ccfb7115542ab4950ea26f22a6ed',
    '0xfb587cb25259710fb73516a344d2f7c1ac57bed538975a99bea95a1fff9b2ad3',
    '0x4d4e2edaecb092e6bcfe5f20a4b70fac4c3cb6e41d38eb78c1e36905938d6664',
    '0xd27d8d1d04ec0b3aaa6ef94d2d2834f0d645c0a44680423e53e872e5020b0ab6',
    '0x0d1f046cc79ff178369df6287a936ae7031e4b0a7211c4b155447aff299b64b5',
    '0xed03545271957ee6008846ad33c98241543d8d517787c612b4c80ea79b97da8e',
    '0xb250e1f29519333020bee1ec7c86560a626352380094b762b04b1cf400d21307',
    '0xa8289fda4e4e5dd40c0168616202dd70572d86c55dc4960f83ba14c362b43067',
    '0xdf01ff056595f9f0eac97c74f1ab6807a5e8db70ed0c42e8a919af5bdef428e5',
    '0xb5d2a49b3fab41d595e0708cb0c892b57dfb91d35dae29095d405ea5b41ed05c',
    '0x88b0a4e06c0a6fc55233e94a86de3f9ece43c023519092b9058d04888ed2769f',
    '0x730a93738345e6c782e02bae7c29bbab3416f9f192c965b8d16751c9e68409bf',
    '0x626e44abd60e875d2ff6b2b52c83e9522734eaf43871f767ae8f060aa4ab6229',
    '0x4db359bb99f7f30ba66de252ffa0730a856ad8ffd9fb7a4fe574fe3db2458e36',
    '0x1ce58bc1a991ab07fc805f611dbca8eb0e74689dee67dd55d4afa4c19cad412c',
    '0x77eb625d56bb61d8c84aa2a6b0d69e3c11adda463da2cf4fb1b2f09d5833ffc3',
    '0xc14f2b71d71d253108017fabb05d116d16ef2d245cb66dda8cc01e028213bfb4',
    '0xa2b8653bf7cf74aec9b028b6c9b1d21ee677d0a1bc0e1202488219d61910cdaf',
    '0xab8e624303e1384379e6bee80644269675f28d271f87f3465ecb14836419e037',
    '0x044200e0b07fec5e99b009689aff0e3fa73273f56a6dbe589818353b546b9f5c',
    '0x15f2689cf90615f858934afef77588afc1d6a4c4fa2f85ce6f1f42f4aeed06e5',
    '0x21882c6cb38dcc190365f409ec2243374e2cd1de6fee93605033f16a22dcd889',
    '0x1c63033fd102694c4fea6d06660759722b07337d4f8cc7b2bd1e279870be6d13',
    '0xffe5fd2bcb895087e19a2040b0380c2f279ce1570701c7584f1e15e4fa1b4581',
    '0x97c001e72ea85b22cdd37acd1eadc5b196052c84f748f78ff4e6b60763f15517',
    '0x5e5fa549598a78389988057b1fbe60483cadd59fb846be25ad4c8eedf4a0661c',
    '0x5fbde68224ec0b0dbca1aa6931551580aec553a0b6772eeb99dde1992965eae3',
    '0x518598b88a59169ac9535af4542816cc96c7594b4d51ad5d54e4a1c728905dfe',
    '0x0a8598934482e61e78d8bdbcf8d99a38ef3b84d1ae86831edbae712b03863544',
    '0xe34e9598d8c27ea64d057bbae993cb9f6b608f044035ebed15b41bb4ddc0082f',
    '0xbbf4473778e5143677a1a81eee5e8d7f2c24dfa3bca913ac3d4523e5694f6d2a',
    '0x8da1d0caab289a98847202ce2ceef20577c56f9fdaa7c476126f38a111ac89cf',
    '0x91ed0e8937c1de81e819f37b379d0b5b747f87e4c1c4160ae8e3e7f59ef0de5f',
    '0xb9cea6e8ade311a806bb6fb9efe3fa504904c7e219d8a35b7e7ee0650d3fb74b',
    '0x60faf571240b65d6d7c1ff50497dee62fe1ff6ec0028909583cba2b4925fd450',
    '0x1f1e7f5c8a6cfbad97c2c7158edc04814089d84d012262c1e7c4f4baeac45704',
    '0x25fc550a183eefd215e9ebb7ac3ddef0ba4a550eac471de9ae9be740989745af',
    '0xd6d6ea3339b40d0e3656d3f6e98cce8f3bff0b2b7e54295b6ab0dfec5137bc6c',
    '0x592d5a52189ba053b49c2179c6774e4ce4b9cd524cce83223ee6c4d262edfac3'
];

// This function calculates the gas used for each transaction hash and sums them
async function calculateTotalGasUsed(txHashes) {
    let totalGasUsed = BigInt(0);  // Initialize as BigInt

    for (const txHash of txHashes) {
        try {
            // Get the transaction receipt to get the gas used
            const receipt = await web3.eth.getTransactionReceipt(txHash);
            if (receipt) {
                const gasUsed = BigInt(receipt.gasUsed); // Convert to BigInt
                console.log(`Transaction: ${txHash} used: ${gasUsed}`);
                totalGasUsed += gasUsed;  // Use BigInt addition
            } else {
                console.log(`No receipt found for transaction: ${txHash}`);
            }
        } catch (error) {
            console.error(`Error fetching receipt for transaction ${txHash}:`, error);
        }
    }

    console.log(`Total gas used for the provided transactions: ${totalGasUsed}`);
    return totalGasUsed;
}

// Main function to execute the process
(async () => {
    try {
        if (transactionHashes.length === 0) {
            console.log('No transaction hashes provided.');
            return;
        }

        console.log(`Calculating total gas used for ${transactionHashes.length} transactions...`);
        await calculateTotalGasUsed(transactionHashes);
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
