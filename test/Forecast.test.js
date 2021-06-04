const { accounts, defaultSender, contract } = require('@openzeppelin/test-environment');
const { expectRevert, expectEvent, time, balance, constants } = require('@openzeppelin/test-helpers');

const expect = require('chai').expect;
const assert = require('chai').assert;
const Web3 = require('web3');

const Forecast = contract.fromArtifact("Forecast");

let betValue = Web3.utils.toWei("1", 'ether');

let forecast;
let senderTracker;

before(async () => {
	let now = Math.floor(Date.now() / 1000);
	//console.log(now);
	forecast = await Forecast.new(now + 3600, 2, betValue); //finishes in 1 hour, expires in 2 hours, bet value 100 milliether
})

describe("Betting", async () => {
	senderTracker = await balance.tracker(defaultSender, "wei");
	it(`should place a bet for ${betValue} wei`, async () => {
		let tracker0 = await balance.tracker(accounts[0], "wei");
		await tracker0.get();

		await forecast.bet("142", { from: accounts[0], value: betValue });
		
		assert.equal(await forecast.betCount(), '1', "Bet count should be 1");
		assert.equal(await forecast.accPot(), betValue, `Accumulated pot should be ${betValue}`);
		assert.approximately(parseFloat(Web3.utils.fromWei(await tracker0.delta(), "ether")), -1, 0.1, `Spend0 should be aprox 1 eth`);

	})

	it(`should place another bet with more money, but only should increase by ${betValue}`, async () => {
		await forecast.bet("284", { from: accounts[1], value: betValue * 1 + 1000000 });
		
		assert.equal(await forecast.betCount(), 2, "Bet count should be 2");
		assert.equal(await forecast.accPot(), betValue * 2, `Accumulated pot should be ${betValue * 2}`);
	})
	
	it(`should fail to bet because not enough money`, async () => {
		await expectRevert(
			forecast.bet("333", { from: accounts[0], value: betValue  * 1 - 1000000}), "Not enough funds to bet");
	})

	it(`should place yet another bet`, async () => {
		await forecast.bet("666", { from: accounts[3], value: betValue * 1 + 1000000 });
		
		assert.equal(await forecast.betCount(), 3, "Bet count should be 2");
		assert.equal(await forecast.accPot(), betValue * 3, `Accumulated pot should be ${betValue * 3}`);
	})
});


describe("End betting period", async () => {
	it("shouldn't be possible to bet if betting period finished", async () => {
		await time.increase(time.duration.minutes(61));
		await expectRevert(
			forecast.bet("142", { from: accounts[0], value: betValue }), "The betting period has finished.");
	})
})

describe("Pay two Winners", async () => {
	it("should pay the winners", async () => {
		let tracker0 = await balance.tracker(accounts[0], "wei");
		await tracker0.get();
		let tracker1 = await balance.tracker(accounts[1], "wei");
		await tracker1.get();
		
		let sharedPot = await forecast.payWinners([accounts[1], accounts[0]]);
		
		assert.equal(parseFloat(Web3.utils.fromWei(await tracker0.delta(), "ether")), 1.425, `Balance0 should be aprox ${betValue * 3 * 0.475} }`); // can't calculate exact value due to gas
		assert.equal(parseFloat(Web3.utils.fromWei(await tracker1.delta(), "ether")), 1.425, `Balance1 should be aprox ${betValue * 3 * 0.475} }`); // can't calculate exact value due to gas
		assert.approximately(parseFloat(Web3.utils.fromWei(await senderTracker.delta(), "ether")), 0.15, 0.1, `Fees should be aprox 0.15 eth`); // can't calculate exact value due to gas
	})
})

describe("Reset sweepstake", async () => {

	it("should reset everything back to 0", async () => {
		let now = Math.floor(Date.now() / 1000);
		await forecast.sweepstakeReset(now + 60 + 3600, 2, betValue);	// 61 minutes since it's what I andvanced before

		assert.equal(await forecast.betCount(), 0, "Bet count is 0");
		assert.equal(await forecast.accPot(), 0, "Acc pot should be 0");
		let betEndTime = await forecast.betEndTime();
		let sweepstakeEndTime = await forecast.sweepstakeEndTime();
		assert.equal(betEndTime.toString(), now + 3660, `Bet end time should be ${now + 3660}`);
		assert.equal(sweepstakeEndTime.toString(), now + 10860 , `Sweepstake end time should be ${now + 10860}`); // 1 hour + 1 minute + 2 hours

	})

	it("should accept another bet (and be the first one)", async () => {
		let tracker2 = await balance.tracker(accounts[2], "wei");
		await tracker2.get();
		
		await forecast.bet("300", { from: accounts[2], value: betValue });
		
		assert.equal(await forecast.betCount(), '1', "Bet count should be 1");
		assert.equal(await forecast.accPot(), betValue, `Accumulated pot should be ${betValue}`);
		expect(await forecast.bets(0)).deep.equal({ punterAddress: accounts[2], price: "300", "0": accounts[2], "1": "300" });

		assert.approximately(parseFloat(Web3.utils.fromWei(await tracker2.delta(), "ether")), -1, 0.1, `Spend0 should be aprox 1 eth`);	})
})

describe("End betting period again", async () => {
	it("shouldn't be possible to bet if betting period finished", async () => {
		await time.increase(time.duration.minutes(61));
		await expectRevert(
			forecast.bet("142", { from: accounts[0], value: 42 }), "The betting period has finished.");
	})
})


describe("Pay single Winner", async () => {
	it("should pay the winner", async () => {
		let tracker2 = await balance.tracker(accounts[2], "wei");
		await tracker2.get();
		
		let sharedPot = await forecast.payWinners([accounts[2]]);
		
		assert.equal(parseFloat(Web3.utils.fromWei(await tracker2.delta(), "ether")), 0.95, `Gains2 should be aprox 0.95 eth`);
		assert.approximately(parseFloat(Web3.utils.fromWei(await senderTracker.delta(), "ether")), 0.05, 0.01, `Fees should be aprox 5 milli`); // can't calculate exact value due to gas
	})
})


/* describe("Finish sweepstake", async () => {
	it("should emit Finished event", async () => {
		const finisedReceipt = await forecast.sweepstakeEnd("145");
		assert.equal(await forecast.ended(), true, "Should have ended");
		expectEvent(finisedReceipt, 'Finished', { finalPrice: "145", betCount: "2" });
	})
}) */

