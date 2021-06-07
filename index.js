import { bet, reset, getAccPot, getBetCount, getSweepstakeEndTime, getBetValue, printAcc, printFinalPrice } from "./modules/contractFunctions.js";

// Source code to interact with smart contract
// Accounts
var account;
// Contract
var contract;

// web3 provider with fallback for old version

window.addEventListener('load', async () => {
    // New web3 provider
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
    }
    // Old web3 provider
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        console.log('Using old web3 provider');
        // no need to ask for permission
    }
    // No web3 provider
    else {
        $("#alertWallet").removeClass("d-none")
        console.log('No web3 provider detected');
    }

    console.log(window.web3.currentProvider)

    // contractAddress and abi are setted after contract 
    //var contractAddress = '0xc916b138D9A471DfD3D54A55F4C883968996D743';   //RSK
    var contractAddress = '0x5661B20C3aA744428793Ba1B1D66E1269CcBF750';     //BSC
    var abi = JSON.parse(`
        [{"inputs":[{"internalType":"uint256","name":"_betEndTime","type":"uint256"},{"internalType":"uint256","name":"_hoursAfter","type":"uint256"},{"internalType":"uint256","name":"_betValue","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"finalPrice","type":"string"},{"indexed":false,"internalType":"uint8","name":"nbrWinners","type":"uint8"},{"indexed":false,"internalType":"uint256","name":"sharedPot","type":"uint256"}],"name":"Finished","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"accPot","type":"uint256"}],"name":"PotIncreased","type":"event"},{"inputs":[],"name":"accPot","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"betCount","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"betEndTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"betValue","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"bets","outputs":[{"internalType":"address","name":"punterAddress","type":"address"},{"internalType":"string","name":"price","type":"string"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"contractOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"relayAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[],"name":"sweepstakeEndTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"string","name":"_price","type":"string"}],"name":"bet","outputs":[],"stateMutability":"payable","type":"function","payable":true},{"inputs":[{"internalType":"uint256","name":"_betEndTime","type":"uint256"},{"internalType":"uint256","name":"_hoursAfter","type":"uint256"},{"internalType":"uint256","name":"_betValue","type":"uint256"}],"name":"sweepstakeReset","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"winners","type":"address[]"},{"internalType":"string","name":"finalPrice","type":"string"}],"name":"payWinners","outputs":[{"internalType":"uint256","name":"payedAmount","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}]
    `);


    $("#walletButton").click(async () => {
        try {
            // ask user for permission
            var connected = await ethereum.request({ method: 'eth_requestAccounts' });
            // user approved permission
            //contract instance
            wallectConnected(connected)
            //setInterval(checkActive, 5000)
        } catch (error) {
            // user rejected permission
            console.log('user rejected permission');
        }
    })

    $("#betButton").click(async () => {
        bet(contract, account);
    })

    $("#resetButton").click(async () => {
        reset(contract, account);
    })

    initContract(abi, contractAddress);


});

function wallectConnected(connected) {
    console.log(`Connected: ${connected}`);
    $("#betButton").prop("disabled", !connected);
    if (connected) {
        $("#walletButton").text("Conectado a la billetera").removeClass("btn-primary").addClass("btn-success");
    } else {
        $("#walletButton").text("Conectar a la billetera").removeClass("btn-success").addClass("btn-primary");
    }
}

function initContract(abi, contractAddress) {
    contract = new web3.eth.Contract(abi, contractAddress);
    web3.eth.getAccounts(function (err, accounts) {
        if (err != null) {
            alert("Error retrieving accounts.");
            return;
        }
        wallectConnected(accounts.length > 0)
        if (accounts.length == 0) {
            alert("No account found! Make sure the Ethereum client is configured properly.");
            return;
        }
        account = accounts[0];
        console.log(`Account: ${account}`);
        web3.eth.defaultAccount = account;
    });


    contract.events.PotIncreased({
        filter: {}, // Using an array means OR: e.g. 20 or 23
        fromBlock: "earliest"
    })
        .on("connected", function (subscriptionId) {
            console.log(`PotIncreased SubscriptionId: ${subscriptionId}`);
        })
        .on("data", function (event) {
            console.log("Event PotIncreased");
            printAcc(event.returnValues.accPot);
            getBetCount(contract);
        })
        .on("error", function (error) {
            console.log(`PotIncreased Error: ${error}`);
        });

    contract.events.Finished({
        filter: {}, // Using an array means OR: e.g. 20 or 23
        fromBlock: "earliest"
    })
        .on("connected", function (subscriptionId) {
            console.log(`Finished SubscriptionId: ${subscriptionId}`);
        })
        .on("data", function (event) {
            printFinalPrice(event.returnValues.finalPrice, event.returnValues.nbrWinners, event.returnValues.sharedPot);
        })
        .on("error", function (error) {
            console.log(`Finished Error: ${error}`);
        });

    initData();
}


function initData() {
    $("#contractLink").attr("href", `https://testnet.bscscan.com/address/${contract.options.address}`);
    getBetValue(contract);
    getSweepstakeEndTime(contract);
    getAccPot(contract);
    getBetCount(contract);
}
//module.exports = findWinners;
