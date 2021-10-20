const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers } = require("hardhat");
const priceFeeds = require("../priceFeeds");

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });

describe("Lottery", function () {
  it("Should correctly fetch the ETH/USD exchange ratio", async function () {
    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(priceFeeds.mainnet);
    await lottery.deployed();

    // set this manually before running the test
    const targetEthUsdPrice = 3885; // on October 20, 2021
    const getUsdInWei = (usd) => parseInt(utils.parseEther((usd / targetEthUsdPrice).toFixed(18)));
    expect(await lottery.getEntranceFee()).to.be.above(`${getUsdInWei(50) * 0.95}`);
    expect(await lottery.getEntranceFee()).to.be.below(`${getUsdInWei(50) * 1.05}`);
  });
});
