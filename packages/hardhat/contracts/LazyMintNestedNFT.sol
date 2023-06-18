// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract LazyMintNestedNFT is ERC721Enumerable, Ownable, ERC721URIStorage {
    uint256 private _nextTokenId = 1;

    mapping(uint256 => uint256[]) private _ownedChildTokens;
    mapping(uint256 => uint256) private _parentToken;
    mapping(uint256 => bool) private _isMinted;
mapping(address => mapping(uint256=>uint256)) private _childTokenOwners;
event NFTMinted(uint256 tokenId);
    constructor() ERC721("LazyMintNestedNFT", "LMNNFT") {}

 function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
    return super.supportsInterface(interfaceId);
}
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId,
    uint256 operatorTokens
)
    internal
override(ERC721, ERC721Enumerable)
{
    super._beforeTokenTransfer(from, to, tokenId, operatorTokens);
}


    function lazyMint( address to, string memory tokenURI) public {
        require(!_isMinted[_nextTokenId], "Token has already been minted");

        _safeMint(to, _nextTokenId);
        _setTokenURI(_nextTokenId, tokenURI);
        _isMinted[_nextTokenId] = true;

        _nextTokenId += 1;
emit NFTMinted(_nextTokenId-1);

    }

    // Override required due to multiple inheritance (ERC721Enumerable and ERC721URIStorage)
    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    // Override required due to multiple inheritance (ERC721Enumerable and ERC721URIStorage)
    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

     function addChild(uint256 parentTokenId, uint256 childTokenId, address childTokenOwner) public {
     require(_childTokenOwners[childTokenOwner][parentTokenId] != 1, "Child token already owned by another parent");

     _childTokenOwners[childTokenOwner][parentTokenId] = 1;


}

    

  
function getChildTokenOwner(address ownerAddress,uint256 childTokenId) public view returns (uint256) {
       
        return _childTokenOwners[ownerAddress][childTokenId];
    }

   
}
