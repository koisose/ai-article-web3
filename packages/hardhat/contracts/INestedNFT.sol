
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface INestedNFT is IERC721 {
    function addChild(uint256 parentTokenId, uint256 childTokenId, address childTokenOwner) external;
}