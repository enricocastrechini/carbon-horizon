// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Prototype registry of TEST units. No certified environmental value.
contract EvidenceRegistry {
    address public immutable reviewer;
    mapping(bytes32 => bool) public anchored;
    mapping(bytes32 => bool) public approved;
    mapping(bytes32 => bool) public issued;
    mapping(bytes32 => bool) public evidenceUsed;
    mapping(bytes32 => uint256) public outstanding;
    mapping(bytes32 => uint256) public retired;

    event EvidenceAnchored(bytes32 indexed digest, address indexed submitter);
    event EvidenceApproved(bytes32 indexed digest);
    event TestUnitsIssued(bytes32 indexed projectVintage, bytes32 indexed digest, uint256 units);
    event TestUnitsRetired(bytes32 indexed projectVintage, uint256 units);

    constructor(address reviewer_) {
        require(reviewer_ != address(0), "Invalid reviewer");
        reviewer = reviewer_;
    }

    modifier onlyReviewer() {
        require(msg.sender == reviewer, "Reviewer only");
        _;
    }

    function anchor(bytes32 digest) external {
        require(digest != bytes32(0), "Empty digest");
        require(!anchored[digest], "Already anchored");
        anchored[digest] = true;
        emit EvidenceAnchored(digest, msg.sender);
    }

    function approve(bytes32 digest) external onlyReviewer {
        require(anchored[digest], "Evidence missing");
        require(!approved[digest], "Already approved");
        approved[digest] = true;
        emit EvidenceApproved(digest);
    }

    function issue(bytes32 projectVintage, bytes32 digest, uint256 units) external onlyReviewer {
        require(projectVintage != bytes32(0), "Empty project");
        require(approved[digest], "Review required");
        require(!issued[projectVintage], "Already issued");
        require(!evidenceUsed[digest], "Evidence already used");
        require(units > 0, "Zero units");
        issued[projectVintage] = true;
        evidenceUsed[digest] = true;
        outstanding[projectVintage] = units;
        emit TestUnitsIssued(projectVintage, digest, units);
    }

    function retire(bytes32 projectVintage, uint256 units) external onlyReviewer {
        require(units > 0 && outstanding[projectVintage] >= units, "Insufficient units");
        outstanding[projectVintage] -= units;
        retired[projectVintage] += units;
        emit TestUnitsRetired(projectVintage, units);
    }
}
