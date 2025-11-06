'use client';

import { useReadContract } from 'wagmi';
import { Info } from 'lucide-react';

interface SystemInfoProps {
  contractAddress: `0x${string}`;
  userAddress?: string;
}

export default function SystemInfo({ contractAddress, userAddress }: SystemInfoProps) {
  const { data: targetThreshold } = useReadContract({
    address: contractAddress,
    abi: [
      {
        name: 'targetThreshold',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint32' }],
        stateMutability: 'view',
      },
    ],
    functionName: 'targetThreshold',
  });

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">System Information</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Threshold
          </label>
          <p className="text-lg text-gray-900">
            {targetThreshold ? `${targetThreshold.toString()} orders` : 'Loading...'}
          </p>
        </div>

        {userAddress && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver Address
            </label>
            <p className="text-sm text-gray-600 font-mono break-all">
              {userAddress}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Transaction
          </label>
          <p className="text-sm text-gray-600 font-mono">
            {userAddress ? `${userAddress.slice(0, 10)}...${userAddress.slice(-8)}` : 'No transactions yet'}
          </p>
        </div>
      </div>
    </div>
  );
}
