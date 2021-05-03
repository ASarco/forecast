// SPDX-License-Identifier: GPL-3.0
    
pragma solidity >=0.5.0 <0.9.0;
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Forecast.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract TestContract {

    uint public initialBalance = 1 ether;
    
    Forecast forecast;

    /// 'beforeAll' runs before all other tests
    /// More special functions are: 'beforeEach', 'beforeAll', 'afterEach' & 'afterAll'
    function beforeAll() public {
        forecast = new Forecast(1619811147, 42);
        Assert.equal(uint(1), uint(1), "1 should be equal to 1");
    }
    
    
    /// #sender: account-1
    /// #value: 42
    function testBet() public payable {
        Assert.equal(forecast.betValue(), 42, "Bet value should be 42");
        Assert.equal(forecast.accPot(), 0, "Accumulated pot should start at 0");
        Assert.equal(forecast.betCount(), 0, "Bet count should start at 0");
        Assert.equal(msg.value, 42, "Msg value should be 42");
        
        forecast.bet(42, {from: accounts[0], value: 42});
        
        Assert.equal(forecast.betCount(), 1, "Bet count should be 1");
        //Assert.equal(forecast.bets(TestsAccounts.getAccount(1)), 42, "Predicted price for account 1 should be 42");
        Assert.equal(forecast.accPot(), 42, "Accumulated pot should be 42");
    }

    /// Custom Transaction Context
    /// See more: https://remix-ide.readthedocs.io/en/latest/unittesting.html#customization
    /// #sender: account-1
    /// #value: 100
    function checkSenderAndValue() public payable {
        // account index varies 0-9, value is in wei
        //Assert.equal(msg.sender, TestsAccounts.getAccount(1), "Invalid sender");
        Assert.equal(msg.value, 100, "Invalid value");
    }
}