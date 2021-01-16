const KltStore = artifacts.require("KltStore");

module.exports = function(deployer) {
  deployer.deploy(KltStore);
};
