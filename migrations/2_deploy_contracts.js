var Splitter       = artifacts.require("./Splitter.sol");

module.exports = function(deployer) {
  deployer.deploy(Splitter, "0xfa5a11a3ebf2ded2fd00c1795bc2ad466cdcd4ca", "0xb8cef5ab3ec8dcfa560da2af46668c34c33d7d5e");
};
