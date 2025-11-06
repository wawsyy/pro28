'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { FileText } from 'lucide-react';

interface SubmitOrderCountProps {
  contractAddress: `0x${string}`;
  userAddress?: string;
}

export default function SubmitOrderCount({ contractAddress, userAddress }: SubmitOrderCountProps) {
  const { isConnected } = useAccount();
  const { writeContract, isPending, error } = useWriteContract();
  const [orderCount, setOrderCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitOrderCount = async () => {
    if (!isConnected || !userAddress || orderCount <= 0) return;

    try {
      setIsLoading(true);
      // Note: In a real FHE implementation, this would encrypt the order count
      // For now, this is a placeholder that shows the UI flow
      // The actual encryption would happen using FHEVM before calling the contract
      
      // This is a simplified version - in production you'd need to:
      // 1. Encrypt the order count using FHEVM
      // 2. Generate input proof
      // 3. Call submitOrderCount with encrypted data
      
      console.log('Submitting encrypted order count:', orderCount);
      // Placeholder for actual encrypted submission
      
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please connect your wallet to submit order counts.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-800">Submit Order Count</h2>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Enter the number of orders completed this period.
        </p>

        <div>
          <label htmlFor="orderCount" className="block text-sm font-medium text-gray-700 mb-2">
            Enter order count
          </label>
          <input
            id="orderCount"
            type="number"
            min="0"
            value={orderCount}
            onChange={(e) => setOrderCount(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            value={orderCount}
            onChange={(e) => setOrderCount(parseInt(e.target.value) || 0)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter order count"
          />
          <button
            onClick={handleSubmitOrderCount}
            disabled={isPending || isLoading || orderCount <= 0}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-6 rounded-md hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isPending || isLoading ? 'Submitting...' : 'Submit (Encrypted)'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">
              Error: {error.message || 'Submission failed'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
