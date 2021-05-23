const { Relayer } = require('defender-relay-client');
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers');
const Web3 = require('web3');
const { ethers } = require("ethers");
var contract;

exports.handler = async function(credentials) {
	const relayer = new Relayer(credentials);
    const provider = new DefenderRelayProvider(credentials);
  	const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
	console.log('Starting ...')
    
    var contractAddress = '0x76dDeD3007186650e39C072A7DC90D49F0634805';     //BSC
    var abi = JSON.parse('[    {      "inputs": [        {          "internalType": "uint256",          "name": "_finishingTime",          "type": "uint256"        },        {          "internalType": "uint256",          "name": "_betValue",          "type": "uint256"        }      ],      "stateMutability": "nonpayable",      "type": "constructor"    },    {      "anonymous": false,      "inputs": [        {          "indexed": false,          "internalType": "address",          "name": "bets",          "type": "address"        }      ],      "name": "Finished",      "type": "event"    },    {      "anonymous": false,      "inputs": [        {          "indexed": false,          "internalType": "uint256",          "name": "accPot",          "type": "uint256"        }      ],      "name": "PotIncreased",      "type": "event"    },    {      "inputs": [],      "name": "accPot",      "outputs": [        {          "internalType": "uint256",          "name": "",          "type": "uint256"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [],      "name": "betCount",      "outputs": [        {          "internalType": "uint8",          "name": "",          "type": "uint8"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [],      "name": "betValue",      "outputs": [        {          "internalType": "uint256",          "name": "",          "type": "uint256"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [        {          "internalType": "uint256",          "name": "",          "type": "uint256"        }      ],      "name": "bets",      "outputs": [        {          "internalType": "address",          "name": "punterAddress",          "type": "address"        },        {          "internalType": "string",          "name": "price",          "type": "string"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [],      "name": "sweepstakeEndTime",      "outputs": [        {          "internalType": "uint256",          "name": "",          "type": "uint256"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [        {          "internalType": "uint256",          "name": "_endTime",          "type": "uint256"        }      ],      "name": "sendQuery",      "outputs": [],      "stateMutability": "nonpayable",      "type": "function"    },    {      "inputs": [        {          "internalType": "string",          "name": "_price",          "type": "string"        }      ],      "name": "bet",      "outputs": [],      "stateMutability": "payable",      "type": "function",      "payable": true    },    {      "inputs": [        {          "internalType": "string",          "name": "finalPrice",          "type": "string"        }      ],      "name": "sweepstakeEnd",      "outputs": [],      "stateMutability": "nonpayable",      "type": "function"    },    {      "inputs": [],      "name": "allBets",      "outputs": [],      "stateMutability": "nonpayable",      "type": "function"    }  ]');

  	contract = new ethers.Contract(contractAddress, abi, signer);
  	//TODO: find real price
  	//const price = "2.98";		
  	var result = await fetch('https://testnet.binance.vision/api/v3/ticker/price?symbol=BTCUSDT');
  	var priceJson = await result.json(); 
    console.log(`Price: ${priceJson.price}`);
  	
 	//TODO: end the contract
  	winners = await end(result.price);
  	//TODO: pay the winners
  
  	console.log("Ended.");
  
  	return winners;
}

async function end(finalPrice) {
  	const totalBets = await contract.betCount();
    console.log(`Total Bets: ${totalBets}`);
    let allBets = {};
    for (let i = 0; i < totalBets; i++) {
      let betResult = await contract.bets(i);
      allBets[i] = { addr: betResult.punterAddress, price: betResult.price };
      console.log(`A Bet ${i}: ${allBets[i].addr} ${allBets[i].price}`);
    }
    var winners = findWinners(finalPrice, allBets);
  	return winners;
}

function findWinners(finalPrice, allBets) {
    let diff = Number.MAX_SAFE_INTEGER;
    let winners = [];
    for (const key in allBets) {
        let close = Math.abs(allBets[key].price - finalPrice);
        if (close < diff) {
            diff = close;
            winners = [];
            winners.push({ addr: allBets[key].addr, price: allBets[key].price });
        } else if (close == diff) {
            diff = close;
            winners.push({ addr: allBets[key].addr, price: allBets[key].price });
        }
    }
    console.log(`And the winner is... ${winners[0].addr} ${winners[0].price}`);
    return winners;
}

