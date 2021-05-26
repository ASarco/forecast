function bet(contract, account) {
    let info = $("#newInfo").val();
    let betValue = $("#betValue").text();
    console.log(`Placing bet ${betValue} ${info}`);
    contract.methods.bet(info).send({ from: account, value: betValue }).then(function (tx) {
        console.log(`Transaction: ${tx}`);
    });
    $("#newInfo").val('');
}

function reset(contract, account) {
    console.log("Reset...");
    contract.methods.sweepstakeReset().send({ from: account }).then(function (tx) {
        console.log(`Transaction: ${tx}`);
        printAcc("0");
    })
}

function getSweepstakeEndTime(contract) {
    contract.methods.sweepstakeEndTime().call().then(function (endTime) {
        console.log(`end: ${endTime}`);
        var date = new Date(endTime * 1000);
        $('#endTime').text(date.toString());
    })
}

function getBetValue(contract) {
    contract.methods.betValue().call().then(function (wei) {
        $('#betValue').text(wei);
        $('#betValueBNB').text(web3.utils.fromWei(wei));
    });
}


function getAccPot(contract) {
    contract.methods.accPot().call().then(function (wei) {
        console.log(`acc: ${wei}`);
        printAcc(wei);
    });
}

function printAcc(wei) {
    $('#accPot').text(wei);
    $('#accPotBNB').text(web3.utils.fromWei(wei));
    getPriceAPI();
}


function getBetCount(contract) {
    contract.methods.betCount().call().then(function (betCount) {
        console.log(`count: ${betCount}`);
        $('#totalBets').text(betCount);
    });
}

function getPriceAPI() {
    $.get("https://testnet.binance.vision/api/v3/ticker/price?symbol=BNBUSDT", function (data) {
        $('#betValueUSD').text(Math.round(data.price * $('#betValueBNB').text() * 100) / 100);
        $('#accPotUSD').text(Math.round(data.price * $('#accPotBNB').text() * 100) / 100);
        console.log(`Price ${data}`, data);
    });
}



export { bet, reset, getAccPot, getBetCount, getSweepstakeEndTime, getBetValue, printAcc };