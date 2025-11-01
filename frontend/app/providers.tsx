"use client";

import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, hardhat } from "wagmi/chains";
import { http } from "wagmi";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

// Note: Base Account SDK warnings can be ignored - they don't affect core wallet functionality
// FHEVM requires COOP: same-origin which conflicts with Base Account SDK requirements
const config = getDefaultConfig({
  appName: "Driver Performance Evaluation",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http("http://localhost:8545"),
    [sepolia.id]: http(),
  },
});

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

