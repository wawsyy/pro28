'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';

interface DriverRegistrationProps {
  contractAddress: `0x${string}`;
}

export default function DriverRegistration({ contractAddress }: DriverRegistrationProps) {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending, error } = useWriteContract();
  const [driverAddress, setDriverAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterDriver = async () => {
    if (!isConnected || !driverAddress) return;

    try {
      setIsLoading(true);
      // Note: This is a simplified version. In a real FHE implementation,
      // you would need to handle encrypted inputs and proofs
      writeContract({
        address: contractAddress,
        abi: [
          {
            name: 'registerDriver',
            type: 'function',
            inputs: [{ name: 'driver', type: 'address' }],
            outputs: [],
            stateMutability: 'nonpayable',
          },
        ],
        functionName: 'registerDriver',
        args: [driverAddress as `0x${string}`],
      });
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please connect your wallet to register drivers.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Driver Registration</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="driverAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Driver Address
          </label>
          <input
            id="driverAddress"
            type="text"
            value={driverAddress}
            onChange={(e) => setDriverAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleRegisterDriver}
          disabled={isPending || isLoading || !driverAddress}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending || isLoading ? 'Registering...' : 'Register Driver'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">
              Error: {error.message || 'Registration failed'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
