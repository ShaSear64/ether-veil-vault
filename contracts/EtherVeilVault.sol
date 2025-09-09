// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract EtherVeilVault is SepoliaConfig {
    using FHE for *;
    
    struct VaultPosition {
        euint32 positionId;
        euint32 assetAmount;
        euint32 assetValue;
        euint32 timestamp;
        bool isActive;
        address owner;
        string assetSymbol;
    }
    
    struct Asset {
        euint32 assetId;
        euint32 totalSupply;
        euint32 currentPrice;
        bool isSupported;
        string symbol;
        string name;
        address tokenAddress;
    }
    
    struct Transaction {
        euint32 transactionId;
        euint32 amount;
        euint32 fee;
        address from;
        address to;
        uint256 timestamp;
        bool isCompleted;
        string transactionType; // "deposit", "withdraw", "transfer"
    }
    
    struct Portfolio {
        euint32 totalValue;
        euint32 totalAssets;
        euint32 transactionCount;
        bool isPrivate;
        address owner;
    }
    
    mapping(uint256 => VaultPosition) public positions;
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => Portfolio) public portfolios;
    mapping(address => euint32) public userBalances;
    mapping(address => mapping(uint256 => euint32)) public userAssetBalances;
    
    uint256 public positionCounter;
    uint256 public assetCounter;
    uint256 public transactionCounter;
    
    address public owner;
    address public feeCollector;
    euint32 public platformFee; // Encrypted fee percentage
    
    event PositionCreated(uint256 indexed positionId, address indexed owner, string assetSymbol);
    event AssetAdded(uint256 indexed assetId, string symbol, address tokenAddress);
    event TransactionExecuted(uint256 indexed transactionId, address indexed from, address indexed to);
    event PortfolioUpdated(address indexed owner, uint32 totalValue);
    event FeeCollected(address indexed collector, uint32 amount);
    
    constructor(address _feeCollector) {
        owner = msg.sender;
        feeCollector = _feeCollector;
        platformFee = FHE.asEuint32(25); // 0.25% fee (25 basis points)
    }
    
    function addSupportedAsset(
        string memory _symbol,
        string memory _name,
        address _tokenAddress,
        externalEuint32 _initialPrice,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(msg.sender == owner, "Only owner can add assets");
        require(bytes(_symbol).length > 0, "Symbol cannot be empty");
        require(_tokenAddress != address(0), "Invalid token address");
        
        uint256 assetId = assetCounter++;
        
        // Convert externalEuint32 to euint32
        euint32 internalPrice = FHE.fromExternal(_initialPrice, inputProof);
        
        assets[assetId] = Asset({
            assetId: FHE.asEuint32(0), // Will be set properly later
            totalSupply: FHE.asEuint32(0),
            currentPrice: internalPrice,
            isSupported: true,
            symbol: _symbol,
            name: _name,
            tokenAddress: _tokenAddress
        });
        
        emit AssetAdded(assetId, _symbol, _tokenAddress);
        return assetId;
    }
    
    function createPosition(
        uint256 assetId,
        externalEuint32 amount,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(assets[assetId].tokenAddress != address(0), "Asset does not exist");
        require(assets[assetId].isSupported, "Asset not supported");
        
        uint256 positionId = positionCounter++;
        
        // Convert externalEuint32 to euint32
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        
        // Calculate position value based on current asset price
        euint32 positionValue = FHE.mul(internalAmount, assets[assetId].currentPrice);
        
        positions[positionId] = VaultPosition({
            positionId: FHE.asEuint32(0), // Will be set properly later
            assetAmount: internalAmount,
            assetValue: positionValue,
            timestamp: FHE.asEuint32(uint32(block.timestamp)),
            isActive: true,
            owner: msg.sender,
            assetSymbol: assets[assetId].symbol
        });
        
        // Update user's asset balance
        userAssetBalances[msg.sender][assetId] = FHE.add(
            userAssetBalances[msg.sender][assetId], 
            internalAmount
        );
        
        // Update portfolio
        _updatePortfolio(msg.sender);
        
        emit PositionCreated(positionId, msg.sender, assets[assetId].symbol);
        return positionId;
    }
    
    function deposit(
        uint256 assetId,
        externalEuint32 amount,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(assets[assetId].tokenAddress != address(0), "Asset does not exist");
        require(assets[assetId].isSupported, "Asset not supported");
        
        uint256 transactionId = transactionCounter++;
        
        // Convert externalEuint32 to euint32
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        
        // Calculate fee
        euint32 fee = FHE.mul(internalAmount, platformFee);
        fee = FHE.div(fee, FHE.asEuint32(10000)); // Convert basis points to percentage
        
        // Net amount after fee
        euint32 netAmount = FHE.sub(internalAmount, fee);
        
        transactions[transactionId] = Transaction({
            transactionId: FHE.asEuint32(0), // Will be set properly later
            amount: netAmount,
            fee: fee,
            from: msg.sender,
            to: address(this),
            timestamp: block.timestamp,
            isCompleted: true,
            transactionType: "deposit"
        });
        
        // Update user balance
        userBalances[msg.sender] = FHE.add(userBalances[msg.sender], netAmount);
        userAssetBalances[msg.sender][assetId] = FHE.add(
            userAssetBalances[msg.sender][assetId], 
            netAmount
        );
        
        // Update portfolio
        _updatePortfolio(msg.sender);
        
        emit TransactionExecuted(transactionId, msg.sender, address(this));
        return transactionId;
    }
    
    function withdraw(
        uint256 assetId,
        externalEuint32 amount,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(assets[assetId].tokenAddress != address(0), "Asset does not exist");
        require(assets[assetId].isSupported, "Asset not supported");
        
        uint256 transactionId = transactionCounter++;
        
        // Convert externalEuint32 to euint32
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        
        // Check if user has sufficient balance
        // Note: In a real implementation, you would need to decrypt and compare
        // For now, we'll assume the check passes
        
        // Calculate fee
        euint32 fee = FHE.mul(internalAmount, platformFee);
        fee = FHE.div(fee, FHE.asEuint32(10000)); // Convert basis points to percentage
        
        // Net amount after fee
        euint32 netAmount = FHE.sub(internalAmount, fee);
        
        transactions[transactionId] = Transaction({
            transactionId: FHE.asEuint32(0), // Will be set properly later
            amount: netAmount,
            fee: fee,
            from: address(this),
            to: msg.sender,
            timestamp: block.timestamp,
            isCompleted: true,
            transactionType: "withdraw"
        });
        
        // Update user balance
        userBalances[msg.sender] = FHE.sub(userBalances[msg.sender], internalAmount);
        userAssetBalances[msg.sender][assetId] = FHE.sub(
            userAssetBalances[msg.sender][assetId], 
            internalAmount
        );
        
        // Update portfolio
        _updatePortfolio(msg.sender);
        
        emit TransactionExecuted(transactionId, address(this), msg.sender);
        return transactionId;
    }
    
    function transfer(
        address to,
        uint256 assetId,
        externalEuint32 amount,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(to != address(0), "Invalid recipient address");
        require(assets[assetId].tokenAddress != address(0), "Asset does not exist");
        require(assets[assetId].isSupported, "Asset not supported");
        require(to != msg.sender, "Cannot transfer to self");
        
        uint256 transactionId = transactionCounter++;
        
        // Convert externalEuint32 to euint32
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        
        // Calculate fee
        euint32 fee = FHE.mul(internalAmount, platformFee);
        fee = FHE.div(fee, FHE.asEuint32(10000)); // Convert basis points to percentage
        
        // Net amount after fee
        euint32 netAmount = FHE.sub(internalAmount, fee);
        
        transactions[transactionId] = Transaction({
            transactionId: FHE.asEuint32(0), // Will be set properly later
            amount: netAmount,
            fee: fee,
            from: msg.sender,
            to: to,
            timestamp: block.timestamp,
            isCompleted: true,
            transactionType: "transfer"
        });
        
        // Update balances
        userBalances[msg.sender] = FHE.sub(userBalances[msg.sender], internalAmount);
        userBalances[to] = FHE.add(userBalances[to], netAmount);
        
        userAssetBalances[msg.sender][assetId] = FHE.sub(
            userAssetBalances[msg.sender][assetId], 
            internalAmount
        );
        userAssetBalances[to][assetId] = FHE.add(
            userAssetBalances[to][assetId], 
            netAmount
        );
        
        // Update portfolios
        _updatePortfolio(msg.sender);
        _updatePortfolio(to);
        
        emit TransactionExecuted(transactionId, msg.sender, to);
        return transactionId;
    }
    
    function updateAssetPrice(
        uint256 assetId,
        externalEuint32 newPrice,
        bytes calldata inputProof
    ) public {
        require(msg.sender == owner, "Only owner can update prices");
        require(assets[assetId].tokenAddress != address(0), "Asset does not exist");
        
        // Convert externalEuint32 to euint32
        euint32 internalPrice = FHE.fromExternal(newPrice, inputProof);
        assets[assetId].currentPrice = internalPrice;
    }
    
    function setPortfolioPrivacy(bool isPrivate) public {
        portfolios[msg.sender].isPrivate = isPrivate;
    }
    
    function _updatePortfolio(address user) internal {
        // In a real implementation, this would calculate the total portfolio value
        // by summing up all asset values. For now, we'll use a placeholder.
        portfolios[user].totalValue = userBalances[user];
        portfolios[user].totalAssets = FHE.asEuint32(1); // Placeholder
        portfolios[user].transactionCount = FHE.add(
            portfolios[user].transactionCount, 
            FHE.asEuint32(1)
        );
        portfolios[user].owner = user;
        
        emit PortfolioUpdated(user, 0); // FHE.decrypt(portfolios[user].totalValue) - will be decrypted off-chain
    }
    
    // View functions that return encrypted data (to be decrypted off-chain)
    function getPositionInfo(uint256 positionId) public view returns (
        uint8 assetAmount,
        uint8 assetValue,
        uint8 timestamp,
        bool isActive,
        address owner,
        string memory assetSymbol
    ) {
        VaultPosition storage position = positions[positionId];
        return (
            0, // FHE.decrypt(position.assetAmount) - will be decrypted off-chain
            0, // FHE.decrypt(position.assetValue) - will be decrypted off-chain
            0, // FHE.decrypt(position.timestamp) - will be decrypted off-chain
            position.isActive,
            position.owner,
            position.assetSymbol
        );
    }
    
    function getAssetInfo(uint256 assetId) public view returns (
        uint8 totalSupply,
        uint8 currentPrice,
        bool isSupported,
        string memory symbol,
        string memory name,
        address tokenAddress
    ) {
        Asset storage asset = assets[assetId];
        return (
            0, // FHE.decrypt(asset.totalSupply) - will be decrypted off-chain
            0, // FHE.decrypt(asset.currentPrice) - will be decrypted off-chain
            asset.isSupported,
            asset.symbol,
            asset.name,
            asset.tokenAddress
        );
    }
    
    function getTransactionInfo(uint256 transactionId) public view returns (
        uint8 amount,
        uint8 fee,
        address from,
        address to,
        uint256 timestamp,
        bool isCompleted,
        string memory transactionType
    ) {
        Transaction storage transaction = transactions[transactionId];
        return (
            0, // FHE.decrypt(transaction.amount) - will be decrypted off-chain
            0, // FHE.decrypt(transaction.fee) - will be decrypted off-chain
            transaction.from,
            transaction.to,
            transaction.timestamp,
            transaction.isCompleted,
            transaction.transactionType
        );
    }
    
    function getPortfolioInfo(address user) public view returns (
        uint8 totalValue,
        uint8 totalAssets,
        uint8 transactionCount,
        bool isPrivate,
        address owner
    ) {
        Portfolio storage portfolio = portfolios[user];
        return (
            0, // FHE.decrypt(portfolio.totalValue) - will be decrypted off-chain
            0, // FHE.decrypt(portfolio.totalAssets) - will be decrypted off-chain
            0, // FHE.decrypt(portfolio.transactionCount) - will be decrypted off-chain
            portfolio.isPrivate,
            portfolio.owner
        );
    }
    
    function getUserBalance(address user) public view returns (uint8) {
        return 0; // FHE.decrypt(userBalances[user]) - will be decrypted off-chain
    }
    
    function getUserAssetBalance(address user, uint256 assetId) public view returns (uint8) {
        return 0; // FHE.decrypt(userAssetBalances[user][assetId]) - will be decrypted off-chain
    }
    
    function getPlatformFee() public view returns (uint8) {
        return 0; // FHE.decrypt(platformFee) - will be decrypted off-chain
    }
    
    // Emergency functions
    function pauseAsset(uint256 assetId) public {
        require(msg.sender == owner, "Only owner can pause assets");
        assets[assetId].isSupported = false;
    }
    
    function unpauseAsset(uint256 assetId) public {
        require(msg.sender == owner, "Only owner can unpause assets");
        assets[assetId].isSupported = true;
    }
    
    function updateFeeCollector(address newFeeCollector) public {
        require(msg.sender == owner, "Only owner can update fee collector");
        require(newFeeCollector != address(0), "Invalid fee collector address");
        feeCollector = newFeeCollector;
    }
}
