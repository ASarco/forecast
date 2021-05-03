// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title Forecast
 * @dev Forecast a price in a future date
 */
contract Forecast {
    
    address immutable contractOwner;
 
    // the bets
    mapping(address => uint) bets;
    
    // number of bets
    uint8 public betCount = 0;
    
    // finishing time
    uint public sweepstakeEndTime;
    
    //bet value
    uint public betValue;
    
    // Set to true at the end, disallows any further submission.
    // By default initialized to `false`.
    bool ended = false;
    
    // Amount accumulated
    uint public accPot = 0;
    
    /// The sweepstake has finished.
    error SweepstakeAlreadyEnded();
    /// Not enough funds to bet
    error NotEnoughFunds();


    constructor (uint _finishingTime, uint32 _betValue) {
        sweepstakeEndTime = _finishingTime;
        betValue = _betValue;
        contractOwner = msg.sender;
    }
    
    event PotIncreased(
        uint accPot
    );
    
    event Finished(
        //uint winnerPrice,
        uint currentPrice
    );

    modifier onlyBy(address _account) {
        require (msg.sender == _account, "Unauthorised, only owner can call");
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
    
    
    function bet(uint price) public payable costs(betValue) notFinished(ended) {
        
        accPot =  accPot + msg.value;
        bets[msg.sender] = price;
        betCount++;
        emit PotIncreased(accPot);
    } 
    
    function sweepstakeEnd(uint currentPrice) public onlyBy(contractOwner) notFinished(ended) {
        ended = true;
        
        uint toTransfer = accPot;
        accPot = 0;
        
        emit Finished(currentPrice);
    }

    function allBets() public onlyBy(contractOwner)  {
        //how do I return the bets? 
    }
    
    function payWinner(address winner) private onlyBy(contractOwner) returns (uint payedAmount) {

        //TODO: Calculate fees here
        payable(winner).transfer(accPot);
        return accPot;
    }      
}