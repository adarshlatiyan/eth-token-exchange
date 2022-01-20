const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

require('chai')
    .use(require("chai-as-promised"))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract("EthSwap", (accounts) => {
    let ethSwap, token

    before(async function () {
        ethSwap = await EthSwap.new()
        token = await Token.new()
        await token.transfer(ethSwap.address, tokens('1000000'))
    })

    describe('Token deployment', async () => {
        it('contract has a name', async function () {
            const name = await token.name()
            assert.equal(name, "DApp Token")
        })
    })

    describe('EthSwap deployment', async () => {
        it('contract has a name', async function () {
            const name = await ethSwap.name()
            assert.equal(name, "EthSwap Instant Exchange")
        })

        it('should have all the token balance', async function () {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        });
    })
})