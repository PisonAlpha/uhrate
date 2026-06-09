// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UHRATECertificate is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    struct Certificate {
        string certificateId;
        string fileHash;
        string fileName;
        string rating;
        uint256 timestamp;
        address owner;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(string => uint256) public certificateToToken;

    event CertificateMinted(
        uint256 indexed tokenId,
        string certificateId,
        string fileHash,
        address owner
    );

    constructor() ERC721("UHRATE Certificate", "UHRC") Ownable(msg.sender) {}

    function mintCertificate(
        address to,
        string memory certificateId,
        string memory fileHash,
        string memory fileName,
        string memory rating,
        string memory tokenURIData
    ) public onlyOwner returns (uint256) {
        require(certificateToToken[certificateId] == 0, "Certificate already minted");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURIData);

        certificates[tokenId] = Certificate({
            certificateId: certificateId,
            fileHash: fileHash,
            fileName: fileName,
            rating: rating,
            timestamp: block.timestamp,
            owner: to
        });

        certificateToToken[certificateId] = tokenId;

        emit CertificateMinted(tokenId, certificateId, fileHash, to);

        return tokenId;
    }

    function getCertificate(uint256 tokenId) public view returns (Certificate memory) {
        return certificates[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}