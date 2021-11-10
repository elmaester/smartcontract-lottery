const hre = require("hardhat");
const { getContractFactory, BigNumber } = hre.ethers;
const addresses = require("../chainlinkAddresses");
const network = hre.network.name;

async function getLocalhostValues() {
  const mockAgg = await getContractFactory("MockV3Aggregator");
  const mockVrf = await getContractFactory("VRFCoordinatorMock");
  const mockLink = await getContractFactory("LinkToken");
  const decimals = 8;
  const initial_value = BigNumber.from("472369500000"); // 4723.695 USD
  const _feed = await mockAgg.deploy(decimals, initial_value);
  const _link = await mockLink.deploy();
  const _vrf = await mockVrf.deploy(_link.address);
  return {
    priceFeed: _feed.address,
    vrfCoordinator: _vrf.address,
    link: _link.address,
    fee: addresses.fee,
    keyHash: addresses.keyHash,
    mockLinkToken: _link,
    mockVRF: _vrf
  };
}

function getValues() {
  if (network === "rinkeby") return addresses;
  if (["hardhat", "localhost"].includes(network)) return getLocalhostValues();
  throw new Error("Unsupported network:", network);
}

async function deployLottery() {
  const { priceFeed, vrfCoordinator, link, fee, keyHash, mockLinkToken, mockVRF } =
    await getValues();
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

  if (mockLinkToken) {
    lottery.mockLinkToken = mockLinkToken;
  }
  if (mockVRF) {
    lottery.mockVRF = mockVRF;
  }

  return lottery;
}

module.exports = deployLottery;
