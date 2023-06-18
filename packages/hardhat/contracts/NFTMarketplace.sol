// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./INestedNFT.sol";
contract NFTMarketplace is ERC721Holder, ReentrancyGuard {
    struct Offer {
        bool isForSale;
        uint256 price;
        address seller;
    }
mapping(address => uint256) public callerIndex;
    uint256 public nextIndex = 1;
    mapping(uint256 => Offer) public tokenIdToOffer;
mapping(address => mapping(uint256 => uint256)) public buyMe;

   INestedNFT public nftContract;

    event NFTOffered(uint256 indexed tokenId, uint256 price, address indexed seller);
    event NFTSold(uint256 indexed tokenId, uint256 price, address indexed seller, address indexed buyer);

    constructor(address _nftAddress) {
        nftContract = INestedNFT(_nftAddress);
    }

    function offerNFT(uint256 _tokenId, uint256 _price) public {
        require(msg.sender == nftContract.ownerOf(_tokenId), "Only the owner can offer the NFT");
        tokenIdToOffer[_tokenId] = Offer({isForSale: true, price: _price, seller: msg.sender});
        emit NFTOffered(_tokenId, _price, msg.sender);
    }
 
    function buyNFT(uint256 _tokenId) public payable nonReentrant {
        Offer storage offer = tokenIdToOffer[_tokenId];
        require(offer.isForSale, "NFT is not for sale");
        require(msg.value >= offer.price, "Insufficient funds to buy NFT");
require(buyMe[msg.sender][_tokenId] == 0, "You already buy this NFT");
 
            
 address seller = offer.seller;
        uint256 price = offer.price;

        payable(seller).transfer(price);
        nftContract.addChild(_tokenId, nextIndex,msg.sender);
buyMe[msg.sender][_tokenId]=1;
        emit NFTSold(_tokenId, price, seller, msg.sender);
        
       
    }

   
}
