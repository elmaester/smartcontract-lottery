const hre = require("hardhat");
const addresses = require("../chainlinkAddresses");

async function main() {
  const network = hre.network.name;
  if (network !== "rinkeby") {
    throw new Error("Use the rinkeby network only!");
  }
  
  const { priceFeed, vrfCoordinator, link, fee, keyHash } = addresses.rinkeby;
  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(
    priceFeed,
    vrfCoordinator,
    link,
    fee,
    keyHash
  );

  await lottery.deployed();

  console.log("Lottery deployed to:", lottery.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
