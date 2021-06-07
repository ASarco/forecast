// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.8.0;

//import "../contractsV5/BridgePublicAPI.sol";

contract Forecast {//is BridgePublicAPI {
    
    address immutable public contractOwner;
    address constant public relayAddress = address(0x14860a73b98990CCBD8D61279E02C315EC0D4Da3);

    struct Punter {
        address punterAddress;
        string price;
    }

    // the bets
    Punter[] public bets; 
    
    // number of bets
    uint8 public betCount = 0;
    
    // bet end time
    uint public betEndTime;
    // sweepstake expired
    uint public sweepstakeEndTime;
    
    //bet value
    uint public betValue;
    
    // Amount accumulated
    uint public accPot = 0;


    constructor (uint _betEndTime, uint _hoursAfter, uint _betValue) {
        betEndTime = _betEndTime;
        sweepstakeEndTime = betEndTime + _hoursAfter * 1 hours;
        betValue = _betValue;
        contractOwner = msg.sender;
        //sendQuery(120); //for now
    }
    
    event PotIncreased(
        uint accPot
    );
    
    event Finished(
        string finalPrice,
        uint8 nbrWinners,
        uint sharedPot
    );

    modifier onlyBy(address _accountOwner, address _relayAddress) {
        require (msg.sender == _accountOwner || msg.sender == _relayAddress , "Unauthorised, only owner can call");
        _;
    }

    modifier costs(uint _amount) {
        require (msg.value >= _amount, "Not enough funds to bet");

        _;
        if (msg.value > _amount)
            payable(msg.sender).transfer(msg.value - _amount);
    }

    modifier notFinished() {
        require (block.timestamp <= betEndTime, "The betting period has finished.");
        _;
    }
 
    
    function bet(string memory _price) public payable notFinished() costs(betValue) {
        
        accPot +=  betValue; //bet should always be betValue, even if sender sent more
        Punter memory newPunter;
        newPunter.price = _price;
        newPunter.punterAddress = msg.sender;
        bets.push(newPunter);
        betCount++;
        emit PotIncreased(accPot);
    } 
    
/*     function sweepstakeEnd(string memory _finalPrice) public onlyBy(contractOwner, relayAddress) notFinished(ended) {
        ended = true;
        emit Finished(_finalPrice, betCount);
        //uint toTransfer = accPot;
    } */

    function sweepstakeReset(uint _betEndTime, uint _hoursAfter, uint _betValue) public onlyBy(contractOwner, relayAddress) {
        payable(contractOwner).transfer(accPot);
        betCount = 0;
        accPot = 0;
        betValue = _betValue;
        delete bets;
        betEndTime = _betEndTime;
        sweepstakeEndTime = betEndTime + _hoursAfter * 1 hours;
        //uint toTransfer = accPot;
    }
    
    function payWinners(address[] memory winners, string memory finalPrice) public onlyBy(contractOwner, relayAddress) returns (uint payedAmount) {

        uint sharedPot = (accPot * 95) / 100;
        uint eachPrize = sharedPot / winners.length;
        uint fees = accPot - sharedPot;
        for (uint8 i = 0; i < winners.length; i++) {
            payable(winners[i]).transfer(eachPrize);
        }
        payable(contractOwner).transfer(fees);
        accPot = 0;
        emit Finished(finalPrice, uint8(winners.length), sharedPot);
        return sharedPot;
    }      
}