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
        })
    });

    describe('betting', async () => {
        it("should place a bet for 42 wei", async () => {

            await forecast.bet(42, { from: accounts[0], value: 42 });
            betCount = await forecast.betCount();
            accPot = await forecast.accPot()
            assert.strictEqual(betCount.toString(), '1', "Bet count should be 1");
            assert.strictEqual(accPot.toString(), '42', "Accumulated pot should be 42");
        })
    });
});
