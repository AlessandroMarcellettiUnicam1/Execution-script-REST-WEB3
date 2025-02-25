const ConfidentialContract = artifacts.require("ConfidentialContract");
const StateContract = artifacts.require("StateContract");

module.exports = async function (deployer) {
  // Deploy ConfidentialContract
  await deployer.deploy(ConfidentialContract);
  const confidentialityInstance = await ConfidentialContract.deployed();

  // Deploy StateContract with the address of ConfidentialContract
  await deployer.deploy(StateContract, confidentialityInstance.address);
};