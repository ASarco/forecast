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
    var contractAddress = '0x76dDeD3007186650e39C072A7DC90D49F0634805';     //BSC
    var abi = JSON.parse('[    {      "inputs": [        {          "internalType": "uint256",          "name": "_finishingTime",          "type": "uint256"        },        {          "internalType": "uint256",          "name": "_betValue",          "type": "uint256"        }      ],      "stateMutability": "nonpayable",      "type": "constructor"    },    {      "anonymous": false,      "inputs": [        {          "indexed": false,          "internalType": "address",          "name": "bets",          "type": "address"        }      ],      "name": "Finished",      "type": "event"    },    {      "anonymous": false,      "inputs": [        {          "indexed": false,          "internalType": "uint256",          "name": "accPot",          "type": "uint256"        }      ],      "name": "PotIncreased",      "type": "event"    },    {      "inputs": [],      "name": "accPot",      "outputs": [        {          "internalType": "uint256",          "name": "",          "type": "uint256"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [],      "name": "betCount",      "outputs": [        {          "internalType": "uint8",          "name": "",          "type": "uint8"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [],      "name": "betValue",      "outputs": [        {          "internalType": "uint256",          "name": "",          "type": "uint256"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [        {          "internalType": "uint256",          "name": "",          "type": "uint256"        }      ],      "name": "bets",      "outputs": [        {          "internalType": "address",          "name": "punterAddress",          "type": "address"        },        {          "internalType": "string",          "name": "price",          "type": "string"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [],      "name": "sweepstakeEndTime",      "outputs": [        {          "internalType": "uint256",          "name": "",          "type": "uint256"        }      ],      "stateMutability": "view",      "type": "function",      "constant": true    },    {      "inputs": [        {          "internalType": "uint256",          "name": "_endTime",          "type": "uint256"        }      ],      "name": "sendQuery",      "outputs": [],      "stateMutability": "nonpayable",      "type": "function"    },    {      "inputs": [        {          "internalType": "string",          "name": "_price",          "type": "string"        }      ],      "name": "bet",      "outputs": [],      "stateMutability": "payable",      "type": "function",      "payable": true    },    {      "inputs": [        {          "internalType": "string",          "name": "finalPrice",          "type": "string"        }      ],      "name": "sweepstakeEnd",      "outputs": [],      "stateMutability": "nonpayable",      "type": "function"    },    {      "inputs": [],      "name": "allBets",      "outputs": [],      "stateMutability": "nonpayable",      "type": "function"    }  ]');


    /*     var endEvent = contract.Finished();
        endEvent.watch(
            function(error, result) {
                if (!error) {
                    console.log("Winner price: ", result);
                    document.getElementById('lastPrice').innerHTML = result;
                }
            }
        ) */
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
        fromBlock: "earliest"})
    .on("connected", function (subscriptionId) {
        console.log(`SubscriptionId ${subscriptionId}`);
    })
    .on("data", function (event) {
        printAcc(event.returnValues.accPot);
        getBetCount();
    })
    .on("error", function (error) {
        console.log(`Error: ${error}`);
    });
    
    initData();
}


function initData() {
    getAccPot();
    getBetCount();
    getSweepstakeEndTime();
}

function printAcc(wei) {
    $('#accPot').text(wei);
    $('#accPotBNB').text(web3.utils.fromWei(wei));
    getBetValue();
}

//Smart contract functions
function bet() {
    info = $("#newInfo").val();
    let betValue = $("#betValue").text();
    console.log(`Placing bet ${betValue} ${info}`);
    contract.methods.bet(info).send({ from: account, value: betValue }).then(function (tx) {
        console.log(`Transaction: ${tx}`);
    });
    $("#newInfo").val('');
}

function getAccPot() {
    contract.methods.accPot().call().then(function (info) {
        console.log(`acc: ${info}`);
        printAcc(info);
    });
}

function getBetCount() {
    contract.methods.betCount().call().then(function (info) {
        console.log(`count: ${info}`);
        $('#totalBets').text(info);
    });
}

function getSweepstakeEndTime() {
    contract.methods.sweepstakeEndTime().call().then(function (info) {
        console.log(`end: ${info}`);
        var date = new Date(info * 1000);
        $('#endTime').text(date.toString());
    })
}


function getBetValue() {
    contract.methods.betValue().call().then(function (wei) {
        $('#betValue').text(wei);
        $('#betValueBNB').text(web3.utils.fromWei(wei));
        getPriceAPI();
    });
}

function getPriceAPI() {
    $.get("https://testnet.binance.vision/api/v3/ticker/price?symbol=BNBUSDT", function (data) {
        $('#accPotUSD').text(Math.round(data.price * $('#accPotBNB').text() * 100) / 100);
        $('#betValueUSD').text(Math.round(data.price * $('#betValueBNB').text() * 100) / 100);
        console.log(`Price ${data}`, data);
    });
}



//module.exports = findWinners;
