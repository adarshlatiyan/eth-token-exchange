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

            // EthSwap should have 100 less tokens after purchase
            let ethSwapBal = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBal.toString(), tokens('999900'))

            // EthSwap should get 1 ethereum
            ethSwapBal = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBal, web3.utils.toWei('1', 'Ether'))

            // Test if correct event is emitted
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount, tokens('100').toString())
            assert.equal(event.rate, (await ethSwap.rate()).toString())
        });
    })

    describe('Sell Tokens', async () => {
        let result

        before(async function () {
            await token.approve(ethSwap.address, tokens('100'), {from: investor})
            result = await ethSwap.sellTokens(tokens('100'), {from: investor})
        })

        it('should allow users to instantly sell tokens to EthSwap for a fixed price', async function () {
            // Check investor token balance after selling
            let investorBal = await token.balanceOf(investor)
            assert.equal(investorBal, tokens('0'))

            // EthSwap should have 100 more tokens after exchange
            let ethSwapBal = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBal.toString(), tokens('1000000'))
            //
            // // EthSwap should lose 1 ether
            ethSwapBal = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBal, web3.utils.toWei('0', 'Ether'))

            // Test if correct event is emitted
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount, tokens('100').toString())
            assert.equal(event.rate, (await ethSwap.rate()).toString())

            await ethSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected
        })
    })
})