// Change 1764244452557
// Enhanced component functionality
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useChainId, useAccount } from "wagmi";
import { ethers } from "ethers";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { DriverPerformanceAddresses } from "@/abi/DriverPerformanceAddresses";
import { DriverPerformanceABI } from "@/abi/DriverPerformanceABI";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";

function getDriverPerformanceByChainId(
  chainId: number | undefined
): { abi: typeof DriverPerformanceABI.abi; address?: `0x${string}`; chainId?: number } {
  if (!chainId) {
    return { abi: DriverPerformanceABI.abi };
  }

  const entry =
    DriverPerformanceAddresses[chainId.toString() as keyof typeof DriverPerformanceAddresses];

  if (!("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: DriverPerformanceABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    abi: DriverPerformanceABI.abi,
  };
}

export const DriverPerformanceDemoContent = ({ driverAddress }: { driverAddress?: string }) => {
  const [orderCount, setOrderCount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [performanceResult, setPerformanceResult] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const chainId = useChainId();
  const { address } = useAccount();
  const ethersSigner = useEthersSigner({ chainId });
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get provider from window.ethereum for FHEVM
  const provider = typeof window !== "undefined" ? (window as any).ethereum : undefined;

  // Initialize FHEVM instance
  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    enabled: Boolean(provider && chainId),
  });

  const contractInfo = useMemo(() => getDriverPerformanceByChainId(chainId), [chainId]);
  const isDeployed = useMemo(() => {
    return Boolean(contractInfo.address && contractInfo.address !== ethers.ZeroAddress);
  }, [contractInfo.address]);
  
  const targetThreshold = 10;

  if (!mounted) {
    return (
      <div className="mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Loading...</h1>
      </div>
    );
  }

  if (!isDeployed) {
    return errorNotDeployed(chainId);
  }

  const handleSubmitOrderCount = async () => {
    if (isSubmittingRef.current || !orderCount || !fhevmInstance || !ethersSigner || !address || !contractInfo.address) {
      if (!fhevmInstance) {
        setMessage("FHEVM instance not ready. Please wait...");
      } else if (!ethersSigner) {
        setMessage("Wallet not connected. Please connect your wallet.");
      } else if (!orderCount) {
        setMessage("Please enter an order count.");
      }
      return;
    }

    const orderCountNum = parseInt(orderCount);
    if (isNaN(orderCountNum) || orderCountNum < 0) {
      setMessage("Please enter a valid positive number.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setMessage("Encrypting order count...");

    try {
      // Create encrypted input
      const input = fhevmInstance.createEncryptedInput(
        contractInfo.address,
        address
      );
      input.add32(orderCountNum);

      // Encrypt (CPU-intensive)
      const encrypted = await input.encrypt();
      setMessage("Submitting encrypted order count to contract...");

      // Create contract instance
      const contract = new ethers.Contract(
        contractInfo.address,
        contractInfo.abi,
        ethersSigner
      );

      // Submit to contract
      const tx = await contract.submitOrderCount(
        address, // driver address
        encrypted.handles[0],
        encrypted.inputProof
      );

      setMessage(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      setMessage(`Order count submitted successfully! (Block: ${receipt.blockNumber})`);
      setOrderCount(""); // Clear input
      
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (error: any) {
      console.error("Error submitting order count:", error);
      let errorMessage = error?.message || "Failed to submit order count";
      
      // Check if it's a relayer error
      if (errorMessage.includes("Relayer") || errorMessage.includes("relayer") || 
          errorMessage.includes("Bad JSON") || errorMessage.includes("CONNECTION_CLOSED")) {
        errorMessage = "FHEVM Relayer service is currently unavailable. This is a network issue with Zama's relayer service (relayer.testnet.zama.cloud). Please try again later or use the local Hardhat network for testing.";
      }
      setMessage(`Error: ${errorMessage}`);
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleEvaluatePerformance = async () => {
    if (!ethersSigner || !address || !contractInfo.address) {
      setMessage("Wallet not connected or contract not deployed.");
      return;
    }

    setIsEvaluating(true);
    setMessage("Evaluating performance...");

    try {
      const contract = new ethers.Contract(
        contractInfo.address,
        contractInfo.abi,
        ethersSigner
      );

      const tx = await contract.evaluatePerformance(address);
      setMessage(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);

      const receipt = await tx.wait();
      setMessage(`Performance evaluated successfully! (Block: ${receipt.blockNumber})`);
      
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } catch (error: any) {
      console.error("Error evaluating performance:", error);
      let errorMessage = error?.message || "Failed to evaluate performance";
      
      // Check if it's a relayer error
      if (errorMessage.includes("Relayer") || errorMessage.includes("relayer") || 
          errorMessage.includes("Bad JSON") || errorMessage.includes("CONNECTION_CLOSED")) {
        errorMessage = "FHEVM Relayer service is currently unavailable. This is a network issue with Zama's relayer service. Please try again later or use the local Hardhat network for testing.";
      }
      
      setMessage(`Error: ${errorMessage}`);
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleDecryptResult = async () => {
    if (!fhevmInstance || !ethersSigner || !address || !contractInfo.address) {
      setMessage("FHEVM instance not ready or wallet not connected.");
      return;
    }

    setIsDecrypting(true);
    setMessage("Getting encrypted performance result...");

    try {
      const contract = new ethers.Contract(
        contractInfo.address,
        contractInfo.abi,
        ethersSigner
      );

      // Get encrypted result (ebool)
      const encryptedResult = await contract.getPerformanceResult(address);
      const resultHandle = encryptedResult;

      // Check if result is zero (not evaluated yet)
      if (resultHandle === ethers.ZeroHash || resultHandle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        setMessage("Performance has not been evaluated yet. Please evaluate first.");
        setPerformanceResult(null);
        setIsDecrypting(false);
        return;
      }

      setMessage("Preparing decryption signature...");

      // Get decryption signature
      const sig: FhevmDecryptionSignature | null =
        await FhevmDecryptionSignature.loadOrSign(
          fhevmInstance,
          [contractInfo.address as `0x${string}`],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

      if (!sig) {
        setMessage("Unable to build FHEVM decryption signature");
        setIsDecrypting(false);
        return;
      }

      setMessage("Decrypting performance result...");

      // Decrypt the ebool result
      const decryptedResult = await fhevmInstance.userDecrypt(
        [{ handle: resultHandle, contractAddress: contractInfo.address }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      setMessage("Decryption completed!");

      // Get the decrypted boolean value
      const isGood = decryptedResult[resultHandle];
      
      // Convert to human-readable format
      const resultText = isGood ? "Good" : "Not Met";
      setPerformanceResult(resultText);

      setTimeout(() => {
        setMessage("");
      }, 3000);
      
    } catch (error: any) {
      console.error("Error decrypting result:", error);
      let errorMessage = error?.message || "Failed to decrypt result";
      
      // Check if it's a relayer error
      if (errorMessage.includes("Relayer") || errorMessage.includes("relayer") || 
          errorMessage.includes("Bad JSON") || errorMessage.includes("CONNECTION_CLOSED")) {
        errorMessage = "FHEVM Relayer service is currently unavailable. This is a network issue with Zama's relayer service. Please try again later or use the local Hardhat network for testing.";
        setMessage(`Error: ${errorMessage}`);
      } else if (errorMessage.includes("revert") || errorMessage.includes("invalid")) {
        // Check if it's because performance hasn't been evaluated
        setMessage("Performance has not been evaluated yet. Please evaluate first.");
      } else {
        setMessage(`Error: ${errorMessage}`);
      }
      
      setPerformanceResult(null);
      setTimeout(() => {
        setMessage("");
      }, 5000);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="grid w-full gap-4">
      <div className="col-span-full mx-20 bg-black/80 text-white rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-3xl mb-2">
              Driver Performance Evaluation System
            </p>
            <p className="text-gray-300">
              Submit encrypted order counts and evaluate performance privately
            </p>
          </div>
          <ConnectButton />
        </div>
      </div>

      <div className="col-span-full mx-20 mt-4 px-5 pb-4 rounded-lg bg-white border-2 border-black">
        <p className="font-semibold text-black text-lg mt-4">System Information</p>
        <p className="text-black">
          Target Threshold: <span className="font-mono font-semibold text-black">{targetThreshold} orders</span>
        </p>
        <p className="text-black">
          Driver Address: <span className="font-mono font-semibold text-black">{driverAddress || "Not connected"}</span>
        </p>
      </div>

      <div className="col-span-full mx-20 px-4 pb-4 rounded-lg bg-white border-2 border-black">
        <p className="font-semibold text-black text-lg mt-4">Submit Order Count</p>
        <div className="mt-4 flex gap-4">
          <input
            type="number"
            value={orderCount}
            onChange={(e) => setOrderCount(e.target.value)}
            placeholder="Enter order count"
            className="flex-1 px-4 py-2 border-2 border-black rounded"
            disabled={isSubmitting || fhevmStatus !== "ready"}
          />
          <button
            onClick={handleSubmitOrderCount}
            disabled={isSubmitting || !orderCount || fhevmStatus !== "ready" || !ethersSigner}
            className="px-6 py-2 bg-black text-white rounded font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit (Encrypted)"}
          </button>
        </div>
        {fhevmStatus !== "ready" && (
          <p className="text-sm text-gray-500 mt-2">
            FHEVM Status: {fhevmStatus} {fhevmError && `- ${fhevmError.message}`}
          </p>
        )}
      </div>

      {message && (
        <div className="col-span-full mx-20 p-4 rounded-lg bg-blue-50 border-2 border-blue-300">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      )}

      <div className="grid grid-cols-2 mx-20 gap-4">
        <button
          onClick={handleEvaluatePerformance}
          disabled={isEvaluating || !ethersSigner || !address}
          className="px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEvaluating ? "Evaluating..." : "Evaluate Performance"}
        </button>
        <button
          onClick={handleDecryptResult}
          disabled={isDecrypting || fhevmStatus !== "ready" || !ethersSigner}
          className="px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDecrypting ? "Decrypting..." : "Decrypt Result"}
        </button>
      </div>

      {performanceResult && (
        <div className="col-span-full mx-20 p-4 rounded-lg bg-white border-2 border-black">
          <p className="font-semibold text-black text-lg">Performance Result</p>
          <p className="text-black mt-2">
            Status: <span className="font-mono font-semibold text-black">{performanceResult}</span>
          </p>
        </div>
      )}
    </div>
  );
};

