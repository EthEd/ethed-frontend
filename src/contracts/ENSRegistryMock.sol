// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ENS Registry Mock
/// @notice Simulates ENS subdomain assignment for users
contract ENSRegistryMock {
    mapping(address => string) public ensNames;

    event SubdomainRegistered(string indexed subdomain, address indexed owner);

    function register(
        string memory subdomain,
        address owner,
        uint256 /* duration */
    ) external payable {
        string memory fullDomain = string(abi.encodePacked(subdomain, ".ethed.eth"));
        ensNames[owner] = fullDomain;
        emit SubdomainRegistered(subdomain, owner);
    }

    function getSubdomain(address user) external view returns (string memory) {
        return ensNames[user];
    }
}
