const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert, expectEvent, time, constants } = require('@openzeppelin/test-helpers'); 

var expect = require('chai').expect;
var assert = require('chai').assert;

const Forecast = contract.fromArtifact("Forecast");

	let forecast;

	before(async () => {
		forecast = await Forecast.new(1622142000, 42n);
	})

	describe('Betting', async () => {
		it("should place a bet for 42 wei", async () => {

			await forecast.bet("142", { from: accounts[0], value: 42} );
			assert.equal(await forecast.betCount(), '1', "Bet count should be 1");
			assert.equal(await forecast.accPot(), 42, "Accumulated pot should be 42");
		})
		
		it("should place another bet with more money, but only should increase by 42", async () => {
			await forecast.bet("284", { from: accounts[1], value: 52 });
			assert.equal(await forecast.betCount(), 2, "Bet count should be 2");
			assert.equal(await forecast.accPot(), 84, "Accumulated pot should be 84");
		})
	});

	describe("Finish sweepstake", async () => {
		it("should emit Finished event", async () => {
			const finisedReceipt = await forecast.sweepstakeEnd("145");
			assert.equal(await forecast.ended(), true, "Should have ended");
			expectEvent(finisedReceipt, 'Finished', { finalPrice: "145", betCount: "2" });
		})

		it("should refuse another bet", async () => {
			await expectRevert(
				forecast.bet("142", { from: accounts[0], value: 42} ), "The sweepstake has finished." );
		})
	})

	describe("Reset sweepstake", async () => {
		it("should reset everything back to 0", async () => {
			await forecast.sweepstakeReset();
			assert.equal(await forecast.ended(), false, "Should be reopened");
			assert.equal(await forecast.betCount(), 0, "Bet count is 0");
			assert.equal(await forecast.accPot(), 0, "Acc pot should be 0");
		})

		it("should accept another bet (and be the first one)", async () => {
			await forecast.bet("300", { from: accounts[2], value: 42 });
			assert.equal(await forecast.betCount(), '1', "Bet count should be 1");
			assert.equal(await forecast.accPot(), 42, "Accumulated pot should be 42");
			expect(await forecast.bets(0)).deep.equal( { punterAddress: accounts[2], price: "300", "0": accounts[2], "1": "300" } );

		})

	})

