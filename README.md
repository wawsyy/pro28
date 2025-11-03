# Driver Performance Evaluation System

A Fully Homomorphic Encryption (FHE) enabled system for evaluating driver performance without exposing sensitive order completion data.

## Overview

This system allows drivers to submit encrypted daily order completion counts. The system can evaluate performance (checking if completed orders meet a threshold) without decrypting the actual numbers. Only the final performance status (Good/Not Met) is revealed to authorized parties.

## Features
- **Enhanced Security**: Improved encryption handling
- **Enhanced Security**: Improved encryption handling
- **Enhanced Security**: Improved encryption handling
- **Enhanced Security**: Improved encryption handling

- **Encrypted Data Submission**: Drivers submit order counts in encrypted form
- **Privacy-Preserving Evaluation**: Performance evaluation happens on encrypted data
- **Selective Decryption**: Only performance results are decrypted, not raw counts
- **Rainbow Wallet Integration**: Modern wallet connection using RainbowKit

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd frontend
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Run Frontend**

   ```bash
   cd frontend
   npm run genabi
   npm run dev
   ```

## Project Structure

```
pro28/
├── contracts/              # Smart contract source files
�?  └── DriverPerformance.sol   # Main FHE contract
├── deploy/                 # Deployment scripts
├── tasks/                 # Hardhat custom tasks
├── test/                  # Test files
├── frontend/              # Next.js frontend application
�?  ├── app/              # Next.js app directory
�?  ├── components/       # React components
�?  ├── hooks/            # Custom React hooks
�?  └── fhevm/            # FHEVM integration
├── hardhat.config.ts     # Hardhat configuration
└── package.json          # Dependencies and scripts
```

## Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run test:sepolia` | Run tests on Sepolia |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## Contract Functions

### DriverPerformance.sol

- `submitOrderCount(address driver, encryptedOrderCount, inputProof)`: Submit encrypted order count for a driver
- `evaluatePerformance(address driver)`: Evaluate if driver meets performance threshold
- `getDriverOrderCount(address driver)`: Get encrypted order count
- `getPerformanceResult(address driver)`: Get encrypted performance evaluation result
- `setTargetThreshold(uint32 newThreshold)`: Update performance threshold (owner only)

## Testing

### Local Testing

```bash
npm run test
```

### Sepolia Testing

```bash
npm run test:sepolia
```

## Frontend Development

The frontend uses Next.js with Rainbow wallet integration:

1. Generate ABI files from deployments:
   ```bash
   cd frontend
   npm run genabi
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Connect with Rainbow wallet in the browser

## Business Flow

1. **Driver Submission**: Driver encrypts and submits their daily order completion count
2. **Performance Evaluation**: System evaluates `completedOrders > targetThreshold` on encrypted data
3. **Result Decryption**: Driver or authorized party decrypts only the performance result (Good/Not Met)
4. **Privacy**: Raw order counts remain encrypted and private

## License

This project is licensed under the BSD-3-Clause-Clear License.

## Support

- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with FHEVM by Zama**

