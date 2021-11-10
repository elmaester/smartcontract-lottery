const hre = require("hardhat");
const deployLottery = require("./deploy");

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
  console.log(hre.ethers.utils.formatEther(await lottery.getEntranceFee()));
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
