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

    event TokenSold(
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
        require(token.balanceOf(address(this)) >= tokenAmount, "Token amount not available");

        // Transfer tokens to investor
        token.transfer(msg.sender, tokenAmount);

        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        // Calculate etherAmount for tokens to be sold
        uint etherAmount = _amount / rate;

        // Check for ether balance of EthSwap
        require(address(this).balance >= etherAmount);

        // Transfer token from investor to EthSwap
        token.transferFrom(msg.sender, address(this), _amount);

        // Transfer ether to investor
        payable(msg.sender).transfer(etherAmount);

        emit TokenSold(msg.sender, address(token), _amount, rate);
    }
}
