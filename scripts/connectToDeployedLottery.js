const file = require("../artifacts/build-info/e3805dc195f30343c0b3b4d1ce6479d7.json");
const hre = require("hardhat");
const abi = file.output.contracts["contracts/Lottery.sol"].Lottery.abi;
const contractAddress = "0xF484189e57A7e1E852b74626c28Ca0eccD10Ee29";

async function main() {
  const lottery = new hre.ethers.Contract(
    contractAddress,
    abi,
    hre.ethers.provider
  );
  console.log(await lottery.lottery_state());
  console.log(await lottery.recentWinner());
  console.log(await lottery.randomness());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
