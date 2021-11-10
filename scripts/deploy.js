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
    mockLinkToken: _link,
  };
}

function getValues() {
  if (network === "rinkeby") return addresses;
  if (["hardhat", "localhost"].includes(network)) return getLocalhostValues();
  throw new Error("Unsupported network:", network);
}

async function deployLottery() {
  const { priceFeed, vrfCoordinator, link, fee, keyHash, mockLinkToken } =
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

  return lottery;
}

async function startLottery(lottery) {
  await lottery.startLottery();
  console.log("The lottery is started!");
}

async function enterLottery(lottery) {
  const signers = await hre.ethers.getSigners();
  const entranceFee = await lottery.getEntranceFee();
  await lottery.enter({ value: entranceFee });
  const lotteryAsUser1 = await lottery.connect(signers[1]);
  await lotteryAsUser1.enter({ value: entranceFee });
  const lotteryAsUser2 = await lottery.connect(signers[2]);
  await lotteryAsUser2.enter({ value: entranceFee });
  console.log(await lottery.players(0));
  console.log(await lottery.players(1));
  console.log(await lottery.players(2));
  console.log(await lottery.owner());
}

async function fundWithLink(lottery) {
  if (lottery.mockLinkToken) {
    await lottery.mockLinkToken.transfer(
      lottery.address,
      Number.MAX_SAFE_INTEGER - 20
    );
    console.log("funding has worked?");
    console.log((await lottery.mockLinkToken.balanceOf(lottery.address)).toString());
  }
}

async function endLottery(lottery) {
  await fundWithLink(lottery);
  await lottery.endLottery();
  console.log(await lottery.lottery_state());
  console.log(await lottery.recentWinner());
}

async function main() {
  const lottery = await deployLottery();
  console.log(utils.formatEther(await lottery.getEntranceFee()));
  await startLottery(lottery);
  await enterLottery(lottery);
  await endLottery(lottery);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
