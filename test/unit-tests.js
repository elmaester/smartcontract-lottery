const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers } = require("hardhat");
const deployLottery = require("../scripts/deploy");

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
    const lottery = await deployLottery();

    // set this manually before running the test
    // const targetEthUsdPrice = 3885; // on October 20, 2021
    // const targetEthUsdPrice = 4732; // on November 8, 2021
    const targetEthUsdPrice = 4723; // on November 10, 2021
    const getUsdInWei = (usd) =>
      parseInt(utils.parseEther((usd / targetEthUsdPrice).toFixed(18)));
    const entranceFee = await lottery.getEntranceFee();
    const usd50inWei = getUsdInWei(50);
    expect(entranceFee).to.be.above(`${usd50inWei * 0.95}`);
    expect(entranceFee).to.be.below(`${usd50inWei * 1.05}`);
  });

  it("Should not be able to enter unless lottery has started", async function () {
    const lottery = await deployLottery();
    const signers = await ethers.getSigners();
    const entranceFee = await lottery.getEntranceFee();
    const lotteryAsUser1 = await lottery.connect(signers[1]);
    await expect(
      lotteryAsUser1.enter({ value: entranceFee })
    ).to.be.revertedWith("The lottery is not open at this time");
  });

  it("Should be able to start lottery and then enter", async function () {
    const lottery = await deployLottery();
    await lottery.startLottery();
    const signers = await ethers.getSigners();
    const entranceFee = await lottery.getEntranceFee();
    const expectedUser1Address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    expect(signers[1].address).to.equal(expectedUser1Address);
    const lotteryAsUser1 = await lottery.connect(signers[1]);
    await expect(lotteryAsUser1.enter({ value: entranceFee })).to.not.be
      .reverted;
    expect(await lottery.players(0)).to.equal(expectedUser1Address);
  });

  it("Should be able to end lottery", async function () {
    const lottery = await deployLottery();
    await lottery.startLottery();
    const signers = await ethers.getSigners();
    const entranceFee = await lottery.getEntranceFee();
    const lotteryAsUser1 = await lottery.connect(signers[1]);
    await lotteryAsUser1.enter({ value: entranceFee });
    expect(lottery.mockLinkToken).to.not.be.undefined;
    await lottery.mockLinkToken.transfer(
      lottery.address,
      Number.MAX_SAFE_INTEGER - 20
    );
    const linkBalance = (
      await lottery.mockLinkToken.balanceOf(lottery.address)
    ).toString();
    expect(linkBalance).to.equal("9007199254740971");
    await lottery.endLottery();
    expect(await lottery.lottery_state()).to.equal(2);
  });
});
