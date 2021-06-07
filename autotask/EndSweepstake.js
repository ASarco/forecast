const { Relayer } = require('defender-relay-client');
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers');
const Web3 = require('web3');
const { ethers } = require("ethers");
var contract;

exports.handler = async function (credentials) {
  const relayer = new Relayer(credentials);
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });
  console.log('Starting ...')

  var contractAddress = '0x5661B20C3aA744428793Ba1B1D66E1269CcBF750';     //BSC
  var abi = JSON.parse(`
    [{"inputs":[{"internalType":"uint256","name":"_betEndTime","type":"uint256"},{"internalType":"uint256","name":"_hoursAfter","type":"uint256"},{"internalType":"uint256","name":"_betValue","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"finalPrice","type":"string"},{"indexed":false,"internalType":"uint8","name":"nbrWinners","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"sharedPot","type":"uint256"}],"name":"Finished","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"accPot","type":"uint256"}],"name":"PotIncreased","type":"event"},{"inputs":[],"name":"accPot","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"betCount","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"betEndTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"betValue","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"bets","outputs":[{"internalType":"address","name":"punterAddress","type":"address"},{"internalType":"string","name":"price","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"contractOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"relayAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"sweepstakeEndTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"string","name":"_price","type":"string"}],"name":"bet","outputs":[],"stateMutability":"payable","type":"function","payable":true},{"inputs":[{"internalType":"uint256","name":"_betEndTime","type":"uint256"},{"internalType":"uint256","name":"_hoursAfter","type":"uint256"},{"internalType":"uint256","name":"_betValue","type":"uint256"}],"name":"sweepstakeReset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"winners","type":"address[]"},{"internalType":"string","name":"finalPrice","type":"string"}],"name":"payWinners","outputs":[{"internalType":"uint256","name":"payedAmount","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}]
	`);

  contract = new ethers.Contract(contractAddress, abi, signer);
  var result = await fetch('https://testnet.binance.vision/api/v3/ticker/price?symbol=BTCUSDT');
  var priceJson = await result.json();

  winners = await end(priceJson.price);
  await contract.payWinners(winners, priceJson.price);

  console.log("Ended.");
  return winners;
}

async function end(finalPrice) {
  console.log(`Price: ${finalPrice}`);
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
      //winners.push({ addr: allBets[key].addr, price: allBets[key].price });
      winners.push(allBets[key].addr);
    } else if (close == diff) {
      diff = close;
      //winners.push({ addr: allBets[key].addr, price: allBets[key].price });
      winners.push(allBets[key].addr);
    }
  }
  console.log(`And the winner is... ${winners[0].addr}`);
  return winners;
}

