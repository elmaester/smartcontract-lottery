const { ethers } = require("hardhat");

// const mainnetEthUsdFeedAddress = "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419";

const rinkeby = {
  fee: ethers.BigNumber.from("10000000"),
  keyHash: "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
  link: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
  priceFeed: "0x8a753747a1fa494ec906ce90e9f37563a8af630e",
  vrfCoordinator: "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
};

module.exports = rinkeby;
