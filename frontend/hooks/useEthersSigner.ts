import { useEffect, useState } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { ethers } from "ethers";
import type { JsonRpcSigner } from "ethers";

function walletClientToSigner(walletClient: any): JsonRpcSigner {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.BrowserProvider(transport, network);
  const signer = new ethers.JsonRpcSigner(provider, account.address);
  return signer;
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);

  useEffect(() => {
    if (walletClient) {
      try {
        const newSigner = walletClientToSigner(walletClient);
        setSigner(newSigner);
      } catch (error) {
        console.error("Error creating signer:", error);
        setSigner(undefined);
      }
    } else {
      setSigner(undefined);
    }
  }, [walletClient]);

  return signer;
}

export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
  const publicClient = usePublicClient({ chainId });
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(
    undefined
  );

  useEffect(() => {
    if (publicClient && publicClient.transport) {
      const network = {
        chainId: publicClient.chain.id,
        name: publicClient.chain.name,
        ensAddress: publicClient.chain.contracts?.ensRegistry?.address,
      };
      const ethProvider = new ethers.BrowserProvider(
        publicClient.transport,
        network
      );
      setProvider(ethProvider);
    } else {
      setProvider(undefined);
    }
  }, [publicClient]);

  return provider;
}

