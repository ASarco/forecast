// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title Forecast
 * @dev Forecast a price in a future date
 */
contract Forecast {
    
    address contractOwner;
 
    // the bets
    mapping(address => uint) public bets;
    
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
    
    
    function bet(uint price) public payable {
        
        //require (ended, "The sweepstake has finished.");
            
        require (betValue > msg.value, "Not enough funds to bet");
        
        accPot =  accPot + msg.value;
        bets[msg.sender] = price;
        betCount++;
        emit PotIncreased(accPot);
    } 
    
    function sweepstakeEnd(uint currentPrice) public {
        if (ended) 
            revert SweepstakeAlreadyEnded();
        ended = true;
        
        address payable winner = calculateWinner(currentPrice);

        uint toTransfer = accPot;
        accPot = 0;
        winner.transfer(toTransfer);
        emit Finished(currentPrice);
    }
    
    
    function calculateWinner(uint currentPrice) pure private returns (address payable) {
        address payable winner;
        uint winnerPrice = currentPrice;
        winnerPrice += 1; //nonsense
        //uint minimumDiff = type(uint).max;
        return winner;
    }
    
        
        
}