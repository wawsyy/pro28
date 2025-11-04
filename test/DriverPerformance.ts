import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { DriverPerformance, DriverPerformance__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  driver1: HardhatEthersSigner;
  driver2: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("DriverPerformance")) as DriverPerformance__factory;
  const driverPerformanceContract = (await factory.deploy(10)) as DriverPerformance; // targetThreshold = 10
  const driverPerformanceContractAddress = await driverPerformanceContract.getAddress();

  return { driverPerformanceContract, driverPerformanceContractAddress };
}

// Enhanced test suite
// Enhanced test suite
// Enhanced test suite
// Enhanced test suite
// Enhanced test suite
describe("DriverPerformance", function () {
  let signers: Signers;
  let driverPerformanceContract: DriverPerformance;
  let driverPerformanceContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], driver1: ethSigners[1], driver2: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ driverPerformanceContract, driverPerformanceContractAddress } = await deployFixture());
  });

  it("should have correct target threshold after deployment", async function () {
    const targetThreshold = await driverPerformanceContract.targetThreshold();
    expect(targetThreshold).to.eq(10);
  });

  it("should allow driver to submit encrypted order count", async function () {
    const orderCount = 15; // Above threshold
    const encryptedOrderCount = await fhevm
      .createEncryptedInput(driverPerformanceContractAddress, signers.driver1.address)
      .add32(orderCount)
      .encrypt();

    const tx = await driverPerformanceContract
      .connect(signers.driver1)
      .submitOrderCount(signers.driver1.address, encryptedOrderCount.handles[0], encryptedOrderCount.inputProof);
    await tx.wait();

    const encryptedStoredCount = await driverPerformanceContract.getDriverOrderCount(signers.driver1.address);
    expect(encryptedStoredCount).to.not.eq(ethers.ZeroHash);
  });

  it("should evaluate performance correctly - good performance", async function () {
    const orderCount = 15; // Above threshold (10)
    const encryptedOrderCount = await fhevm
      .createEncryptedInput(driverPerformanceContractAddress, signers.driver1.address)
      .add32(orderCount)
      .encrypt();

    // Submit order count
    let tx = await driverPerformanceContract
      .connect(signers.driver1)
      .submitOrderCount(signers.driver1.address, encryptedOrderCount.handles[0], encryptedOrderCount.inputProof);
    await tx.wait();

    // Evaluate performance
    tx = await driverPerformanceContract
      .connect(signers.driver1)
      .evaluatePerformance(signers.driver1.address);
    await tx.wait();

    // Get and decrypt performance result
    const encryptedResult = await driverPerformanceContract.getPerformanceResult(signers.driver1.address);
    const clearResult = await fhevm.userDecryptEbool(
      encryptedResult,
      driverPerformanceContractAddress,
      signers.driver1,
    );

    expect(clearResult).to.eq(true); // Should be good (15 > 10)
  });

  it("should evaluate performance correctly - poor performance", async function () {
    const orderCount = 5; // Below threshold (10)
    const encryptedOrderCount = await fhevm
      .createEncryptedInput(driverPerformanceContractAddress, signers.driver2.address)
      .add32(orderCount)
      .encrypt();

    // Submit order count
    let tx = await driverPerformanceContract
      .connect(signers.driver2)
      .submitOrderCount(signers.driver2.address, encryptedOrderCount.handles[0], encryptedOrderCount.inputProof);
    await tx.wait();

    // Evaluate performance
    tx = await driverPerformanceContract
      .connect(signers.driver2)
      .evaluatePerformance(signers.driver2.address);
    await tx.wait();

    // Get and decrypt performance result
    const encryptedResult = await driverPerformanceContract.getPerformanceResult(signers.driver2.address);
    const clearResult = await fhevm.userDecryptEbool(
      encryptedResult,
      driverPerformanceContractAddress,
      signers.driver2,
    );

    expect(clearResult).to.eq(false); // Should not meet threshold (5 < 10)
  });

  it("should allow owner to update target threshold", async function () {
    const newThreshold = 20;
    const tx = await driverPerformanceContract
      .connect(signers.deployer)
      .setTargetThreshold(newThreshold);
    await tx.wait();

    const updatedThreshold = await driverPerformanceContract.targetThreshold();
    expect(updatedThreshold).to.eq(newThreshold);
  });
});

