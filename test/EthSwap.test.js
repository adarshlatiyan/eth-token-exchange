const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

require('chai')
    .use(require("chai-as-promised"))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract("EthSwap", ([deployer, investor]) => {
    let ethSwap, token

    before(async function () {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
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

    describe('Buy Tokens', async () => {
        let result

        before(async function () {
            // Purchase tokens before each test
            result = await ethSwap.buyTokens({from: investor, value: tokens('1')})
        })

        it('should allow users to instantly purchase tokens for fixed price', async function () {
            // Check investor token balance after purchase
            let investorBal = await token.balanceOf(investor)
            assert.equal(investorBal, tokens('100'))

            // Check EthSwap balance after purchase
            let ethSwapBal = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBal.toString(), tokens('999900'))
        });
    })
})