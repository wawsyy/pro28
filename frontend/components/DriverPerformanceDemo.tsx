"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { DriverPerformanceDemoContent } from "./DriverPerformanceDemoContent";

export const DriverPerformanceDemo = () => {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Driver Performance Evaluation</h1>
        <p className="text-lg mb-8 text-white/90">
          Encrypted performance evaluation system using FHEVM
        </p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Driver Performance Evaluation</h1>
        <p className="text-lg mb-8 text-white/90">
          Encrypted performance evaluation system using FHEVM
        </p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return <DriverPerformanceDemoContent driverAddress={address} />;
};

