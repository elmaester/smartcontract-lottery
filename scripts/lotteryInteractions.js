const hre = require("hardhat");
const deployLottery = require("./deploy");

async function startLottery(lottery) {
  await lottery.startLottery();
  console.log("The lottery is started!");
}

async function enterLottery(lottery) {
  const signers = await hre.ethers.getSigners();
  const entranceFee = await lottery.getEntranceFee();
  await signers.slice(1, 8).forEach(async (signer) => {
    const lotteryAsCurrentUser = await lottery.connect(signer);
    console.log(lotteryAsCurrentUser.signer.address);
    await lotteryAsCurrentUser.enter({ value: entranceFee });
  });
}

async function fundWithLink(lottery) {
  if (lottery.mockLinkToken) {
    await lottery.mockLinkToken.transfer(
      lottery.address,
      Number.MAX_SAFE_INTEGER - 20
    );
  }
}

async function endLottery(lottery) {
  await fundWithLink(lottery);
  await lottery.endLottery();
}

async function main() {
  const lottery = await deployLottery();
  console.log(hre.ethers.utils.formatEther(await lottery.getEntranceFee()));
  await startLottery(lottery);
  await enterLottery(lottery);
  await endLottery(lottery);
  console.log(
    "lottery balance before:",
    (await hre.ethers.provider.getBalance(lottery.address)).toString()
  );
  const requestId = (await lottery.queryFilter("RequestedRandomness"))[0].args
    .requestId;
  const getRandom = () => parseInt(Math.random() * 1000);
  await lottery.mockVRF.callBackWithRandomness(
    requestId,
    getRandom(),
    lottery.address
  );
  const eligiblePlayers = (await hre.ethers.getSigners())
    .slice(1, 8)
    .map((s) => s.address);
  console.log(
    "lottery balance after:",
    (await hre.ethers.provider.getBalance(lottery.address)).toString()
  );
  console.log("eligible players:", eligiblePlayers);
  console.log("winner", await lottery.recentWinner());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
