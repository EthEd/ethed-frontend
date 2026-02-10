// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Mock NFT (ERC-721 lite)
/// @notice Minimal minting contract for testnet verification
contract MockNFT {
    uint256 public nextTokenId = 1;

    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => string) public tokenURI;

    event Minted(address indexed to, uint256 indexed tokenId);

    function mint(address to, string memory uri) external returns (uint256) {
        require(to != address(0), "Invalid recipient");

        uint256 tokenId = nextTokenId;
        nextTokenId += 1;

        ownerOf[tokenId] = to;
        tokenURI[tokenId] = uri;

        emit Minted(to, tokenId);
        return tokenId;
    }
}
