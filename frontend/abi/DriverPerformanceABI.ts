
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const DriverPerformanceABI = {
  "abi": [
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "_targetThreshold",
          "type": "uint32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "driver",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "submitter",
          "type": "address"
        }
      ],
      "name": "OrderCountSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "driver",
          "type": "address"
        }
      ],
      "name": "PerformanceEvaluated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "oldThreshold",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "newThreshold",
          "type": "uint32"
        }
      ],
      "name": "TargetThresholdUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "driver",
          "type": "address"
        }
      ],
      "name": "evaluatePerformance",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "driver",
          "type": "address"
        }
      ],
      "name": "getDriverOrderCount",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "driver",
          "type": "address"
        }
      ],
      "name": "getPerformanceResult",
      "outputs": [
        {
          "internalType": "ebool",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "_newThreshold",
          "type": "uint32"
        }
      ],
      "name": "setTargetThreshold",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "driver",
          "type": "address"
        },
        {
          "internalType": "externalEuint32",
          "name": "encryptedOrderCount",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "submitOrderCount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "targetThreshold",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
} as const;

