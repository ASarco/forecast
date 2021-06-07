var Forecast = artifacts.require("Forecast");

module.exports = function(deployer) {
  deployer.deploy(Forecast, 1623265200, 24, 10000000000000000n ); //0.01 BNB
};