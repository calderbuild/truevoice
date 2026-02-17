// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TrueVoice - On-chain review hash registry
/// @notice Stores review hashes for tamper-proof verification.
///         World ID verification happens off-chain via Cloud API.
contract TrueVoice {
    address public owner;

    struct ReviewRecord {
        bytes32 reviewHash;
        address submitter;
        uint256 timestamp;
    }

    // entityId => nullifierHash => ReviewRecord
    mapping(bytes32 => mapping(bytes32 => ReviewRecord)) public reviews;

    // Track all review hashes for enumeration
    bytes32[] public allReviewHashes;

    event ReviewSubmitted(
        bytes32 indexed entityId,
        bytes32 indexed nullifierHash,
        bytes32 reviewHash,
        address submitter,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Submit a review hash (called by backend after off-chain World ID verification)
    /// @param entityId keccak256 of the entity identifier string
    /// @param nullifierHash The World ID nullifier hash (ensures one review per person per entity)
    /// @param reviewHash keccak256(abi.encodePacked(entityId, rating, text))
    function submitReview(
        bytes32 entityId,
        bytes32 nullifierHash,
        bytes32 reviewHash
    ) external onlyOwner {
        require(
            reviews[entityId][nullifierHash].timestamp == 0,
            "Already reviewed"
        );

        reviews[entityId][nullifierHash] = ReviewRecord({
            reviewHash: reviewHash,
            submitter: msg.sender,
            timestamp: block.timestamp
        });

        allReviewHashes.push(reviewHash);

        emit ReviewSubmitted(
            entityId,
            nullifierHash,
            reviewHash,
            msg.sender,
            block.timestamp
        );
    }

    /// @notice Verify a review exists on-chain
    function verifyReview(
        bytes32 entityId,
        bytes32 nullifierHash,
        bytes32 reviewHash
    ) external view returns (bool) {
        return reviews[entityId][nullifierHash].reviewHash == reviewHash;
    }

    /// @notice Get total number of on-chain reviews
    function reviewCount() external view returns (uint256) {
        return allReviewHashes.length;
    }

    /// @notice Transfer ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
