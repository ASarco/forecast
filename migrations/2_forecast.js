var Forecast = artifacts.require("Forecast");

module.exports = function(deployer) {
  deployer.deploy(Forecast, 1620654584, 50);
};