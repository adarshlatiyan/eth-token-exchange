pragma solidity ^0.8.0;

import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event TokenPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // Amount of ether*rate
        uint tokenAmount = msg.value * rate;

        // Check if tokens are available with EthSwap
        require(token.balanceOf(this) >= tokenAmount, "Token amount not available");

        // Transfer tokens to investor
        token.transfer(msg.sender, tokenAmount);

        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }
}
