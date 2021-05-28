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
    
    // finishing time
    uint public sweepstakeEndTime;
    
    //bet value
    uint public betValue;
    
    // Set to true at the end, disallows any further submission.
    // By default initialized to `false`.
    bool public ended = false;
    
    // Amount accumulated
    uint public accPot = 0;


    constructor (uint _finishingTime, uint _betValue) {
        sweepstakeEndTime = _finishingTime;
        betValue = _betValue;
        contractOwner = msg.sender;
        //sendQuery(120); //for now
    }
    
    event PotIncreased(
        uint accPot
    );
    
    event Finished(
        string finalPrice,
        uint8 betCount
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

    modifier notFinished(bool _ended) {
        require (!_ended, "The sweepstake has finished.");
        _;
    }

    //function __callback(bytes32 _myid, string memory _result) public {
    //    sweepstakeEnd(_result);
    //}    
    
    function bet(string memory _price) public payable costs(betValue) notFinished(ended) {
        
        accPot +=  betValue; //bet should always be betValue, even if sender sent more
        Punter memory newPunter;
        newPunter.price = _price;
        newPunter.punterAddress = msg.sender;
        bets.push(newPunter);
        betCount++;
        emit PotIncreased(accPot);
    } 
    
    function sweepstakeEnd(string memory _finalPrice) public onlyBy(contractOwner, relayAddress) notFinished(ended) {
        ended = true;
        emit Finished(_finalPrice, betCount);
        //uint toTransfer = accPot;
    }

    function sweepstakeReset() public onlyBy(contractOwner, relayAddress) notFinished(!ended) {
        payable(contractOwner).transfer(accPot);
        ended = false;
        betCount = 0;
        accPot = 0;
        delete bets;
        //uint toTransfer = accPot;
    }
    
    function payWinner(address[] memory winners) public onlyBy(contractOwner, relayAddress) returns (uint payedAmount) {

        uint sharedPot = (accPot * 95) / 100;
        uint eachPrize = sharedPot / winners.length;
        uint fees = accPot - sharedPot;
        for (uint8 i = 0; i < winners.length; i++) {
            payable(winners[i]).transfer(eachPrize);
        }
        payable(contractOwner).transfer(fees);
        accPot = 0;
        return sharedPot;
    }      
}