var Forecast = artifacts.require("Forecast");

module.exports = function(deployer) {
  deployer.deploy(Forecast, 1622055600, 10000000000000000n); //0.01 BNB
};