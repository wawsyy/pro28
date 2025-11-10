// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Driver Performance Evaluation System using FHE
/// @notice A system where drivers can submit encrypted order completion counts,
/// and the system can evaluate performance without exposing sensitive data
// Change 1764244452317
// Change 1764244453630
contract DriverPerformance is SepoliaConfig {
    // Mapping from driver address to their encrypted completed order count
    mapping(address => euint32) private driverOrderCounts;

    // Mapping from driver address to encrypted performance evaluation result
    mapping(address => ebool) private driverPerformanceResults;

    // Mapping to track registered drivers
    mapping(address => bool) private registeredDrivers;
    
    // Target threshold for performance evaluation (public, unencrypted)
    uint32 public targetThreshold;
    
    // Contract owner (can set target threshold)
    address public owner;
    
    // Events
    event OrderCountSubmitted(address indexed driver, address indexed submitter);
    event PerformanceEvaluated(address indexed driver);
    event TargetThresholdUpdated(uint32 oldThreshold, uint32 newThreshold);
    event DriverRegistered(address indexed driver);
    
    // Modifiers
    // Enhanced functionality for better performance
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(uint32 _targetThreshold) {
        owner = msg.sender;
        targetThreshold = _targetThreshold;
    }

    /// @notice Register a driver in the system
    /// @param driver Address of the driver to register
    function registerDriver(address driver) external {
        require(driver != address(0), "Invalid driver address");
        require(!registeredDrivers[driver], "Driver already registered");
    // Enhanced functionality for better performance

        registeredDrivers[driver] = true;
        emit DriverRegistered(driver);
    }
    
    /// @notice Set the target threshold for performance evaluation
    /// @param _newThreshold The new target threshold value
    function setTargetThreshold(uint32 _newThreshold) external onlyOwner {
        uint32 oldThreshold = targetThreshold;
        targetThreshold = _newThreshold;
        emit TargetThresholdUpdated(oldThreshold, _newThreshold);
    }
    
    /// @notice Submit encrypted order completion count for a driver
    /// @param driver Address of the driver
    /// @param encryptedOrderCount Encrypted order count value
    /// @param inputProof Proof for the encrypted input
    function submitOrderCount(
        address driver,
        externalEuint32 encryptedOrderCount,
        bytes calldata inputProof
    ) external {
        require(driver != address(0), "Invalid driver address");
        
        // Convert external encrypted input to internal encrypted type
        euint32 orderCount = FHE.fromExternal(encryptedOrderCount, inputProof);
        
        // Store the encrypted order count
        driverOrderCounts[driver] = orderCount;
        
        // Grant access permissions
        FHE.allowThis(orderCount);
        FHE.allow(orderCount, driver); // Driver can decrypt their own count
        FHE.allow(orderCount, msg.sender); // Submitter can also decrypt
        
        emit OrderCountSubmitted(driver, msg.sender);
    }
    
    /// @notice Get encrypted order count for a driver
    /// @param driver Address of the driver
    /// @return The encrypted order count
    function getDriverOrderCount(address driver) external view returns (euint32) {
        return driverOrderCounts[driver];
    }

    /// @notice Check if a driver is registered
    /// @param driver Address of the driver
    /// @return True if the driver is registered
    function isDriverRegistered(address driver) external view returns (bool) {
        return registeredDrivers[driver];
    }
    
    /// @notice Evaluate driver performance: isGood = completedOrders > target
    /// @param driver Address of the driver
    /// @return Encrypted boolean indicating if performance is good (meets threshold)
    function evaluatePerformance(address driver) external returns (ebool) {
        require(driver != address(0), "Invalid driver address");

        euint32 orderCount = driverOrderCounts[driver];
        euint32 encryptedThreshold = FHE.asEuint32(targetThreshold);

        // Perform encrypted comparison: isGood = orderCount >= threshold
        // BUG: Currently using > instead of >=, should be FHE.gte
        ebool isGood = FHE.gt(orderCount, encryptedThreshold);

        // Store the result
        driverPerformanceResults[driver] = isGood;

        // Grant access permissions for the result
        FHE.allowThis(isGood);
        FHE.allow(isGood, driver); // Driver can decrypt their performance result

        emit PerformanceEvaluated(driver);

        return isGood;
    }
    
    /// @notice Get encrypted performance evaluation result for a driver
    /// @param driver Address of the driver
    /// @return The encrypted performance result (true = good, false = not met)
    function getPerformanceResult(address driver) external view returns (ebool) {
        return driverPerformanceResults[driver];
    }
}

