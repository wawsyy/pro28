import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { DriverPerformance } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  driver1: HardhatEthersSigner;
};

describe("DriverPerformanceSepolia", function () {
  let signers: Signers;
  let driverPerformanceContract: DriverPerformance;
  let driverPerformanceContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const DriverPerformanceDeployment = await deployments.get("DriverPerformance");
      driverPerformanceContractAddress = DriverPerformanceDeployment.address;
      driverPerformanceContract = await ethers.getContractAt("DriverPerformance", DriverPerformanceDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { driver1: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should submit order count and evaluate performance", async function () {
    steps = 12;

    this.timeout(4 * 40000);

    const orderCount = 15; // Above threshold

    progress("Encrypting order count...");
    const encryptedOrderCount = await fhevm
      .createEncryptedInput(driverPerformanceContractAddress, signers.driver1.address)
      .add32(orderCount)
      .encrypt();

    progress(
      `Call submitOrderCount() DriverPerformance=${driverPerformanceContractAddress} handle=${ethers.hexlify(encryptedOrderCount.handles[0])} signer=${signers.driver1.address}...`,
    );
    let tx = await driverPerformanceContract
      .connect(signers.driver1)
      .submitOrderCount(signers.driver1.address, encryptedOrderCount.handles[0], encryptedOrderCount.inputProof);
    await tx.wait();

    progress(`Call DriverPerformance.getDriverOrderCount()...`);
    const encryptedStoredCount = await driverPerformanceContract.getDriverOrderCount(signers.driver1.address);
    expect(encryptedStoredCount).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting DriverPerformance.getDriverOrderCount()=${encryptedStoredCount}...`);
    const clearStoredCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedStoredCount,
      driverPerformanceContractAddress,
      signers.driver1,
    );
    progress(`Clear DriverPerformance.getDriverOrderCount()=${clearStoredCount}`);

    progress(`Call evaluatePerformance()...`);
    tx = await driverPerformanceContract
      .connect(signers.driver1)
      .evaluatePerformance(signers.driver1.address);
    await tx.wait();

    progress(`Call DriverPerformance.getPerformanceResult()...`);
    const encryptedResult = await driverPerformanceContract.getPerformanceResult(signers.driver1.address);

    progress(`Decrypting DriverPerformance.getPerformanceResult()=${encryptedResult}...`);
    const clearResult = await fhevm.userDecryptEbool(
      encryptedResult,
      driverPerformanceContractAddress,
      signers.driver1,
    );
    progress(`Clear DriverPerformance.getPerformanceResult()=${clearResult}`);

    expect(clearResult).to.eq(true); // Should be good (15 > 10)
    expect(clearStoredCount).to.eq(orderCount);
  });
});

