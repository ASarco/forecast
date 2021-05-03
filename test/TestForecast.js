const Forecast = artifacts.require("Forecast");
var BN = web3.utils.BN;

contract("Forecast", accounts => {

	let forecast;

	before(async () => {
		forecast = await Forecast.deployed()
	})

	describe('deployment', async () => {
		it('deploys successfully', async () => {
			const address = await forecast.address
			assert.notEqual(address, 0x0)
			assert.notEqual(address, '')
			assert.notEqual(address, null)
			assert.notEqual(address, undefined)
			assert.equal(await forecast.betValue(), 42, "BetValue should be 42");
		})
	});

	describe('betting', async () => {
		it("should place a bet for 42 wei", async () => {

			await forecast.bet(42, { from: accounts[0], value: 42 });
			assert.equal(await forecast.betCount(), '1', "Bet count should be 1");
			assert.equal(await forecast.accPot(), '42', "Accumulated pot should be 42");
		})
		it("should place another bet and get the total", async () => {

			await forecast.bet(42, { from: accounts[1], value: 42 });
			assert.equal(await forecast.betCount(), '2', "Bet count should be 2");
			assert.equal(await forecast.accPot(), '84', "Accumulated pot should be 84");
		})
	});
});
