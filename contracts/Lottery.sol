//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Lottery {
    address[] public players;
    uint256 public usdEntryFee;
    AggregatorV3Interface internal ethUsdPriceFeed;

    // look up feed addresses at
    // https://docs.chain.link/docs/ethereum-addresses/
    constructor(address priceFeed) {
        console.log(priceFeed);
        ethUsdPriceFeed = AggregatorV3Interface(priceFeed);
        usdEntryFee = 50 * (10**18);
    }

    function enter() public payable {
        // $50 minimum
        // require();
        players.push(msg.sender);
    }

    function getEntranceFee() public view returns (uint256) {
        (, int256 price, , , ) = ethUsdPriceFeed.latestRoundData();
        uint adjustedPrice = uint256(price) * 10**10; // 18 decimals
        uint256 costToEnter = (usdEntryFee * 10**18) / adjustedPrice;
        return costToEnter;
    }

    function startLottery() public {}

    function endLottery() public {}
}
