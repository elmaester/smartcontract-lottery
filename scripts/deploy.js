const hre = require("hardhat");
const { getContractFactory, BigNumber, utils } = hre.ethers;
const addresses = require("../chainlinkAddresses");
const network = hre.network.name;

async function getLocalhostValues() {
  const mockAgg = await getContractFactory("MockV3Aggregator");
  const mockVrf = await getContractFactory("VRFCoordinatorMock");
  const mockLink = await getContractFactory("LinkToken");
  const decimals = 8;
  const initial_value = BigNumber.from("2" + "0".repeat(11));
  const _feed = await mockAgg.deploy(decimals, initial_value);
  const _link = await mockLink.deploy();
  const _vrf = await mockVrf.deploy(_link.address);
  return {
    priceFeed: _feed.address,
    vrfCoordinator: _vrf.address,
    link: _link.address,
    fee: addresses.fee,
    keyHash: addresses.keyHash,
  };
}

function getValues() {
  if (network === "rinkeby") return addresses;
  if (network === "hardhat") return getLocalhostValues();
  throw new Error("Unsupported network:", network);
}

async function main() {
  const { priceFeed, vrfCoordinator, link, fee, keyHash } = await getValues();
  const Lottery = await getContractFactory("Lottery");
  const lottery = await Lottery.deploy(
    priceFeed,
    vrfCoordinator,
    link,
    fee,
    keyHash
  );

  await lottery.deployed();

  console.log("Lottery deployed to:", lottery.address);
  console.log(utils.formatEther(await lottery.getEntranceFee()));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
