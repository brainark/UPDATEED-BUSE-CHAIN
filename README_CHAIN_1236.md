# BrainArk Blockchain - Chain ID 1236

## Overview
This is the new BrainArk production blockchain with Chain ID 1236, created to resolve the conflict with Fastex Chain testnet that was using the same Chain ID 424242.

## 🔧 Blockchain Specifications

### Core Configuration
- **Chain ID**: 1236 (conflict-free)
- **Consensus**: IBFT2 (Istanbul Byzantine Fault Tolerance 2.0)
- **Block Time**: 2 seconds
- **Epoch Length**: 30,000 blocks
- **Request Timeout**: 5 seconds
- **Gas Limit**: 0x047868C0 (75,000,000)
- **Min Gas Price**: 1,000 wei

### Initial Supply
- **Total Supply**: 1,000,000,000 BAK (1 billion tokens)
- **Holder Address**: `0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169`
- **Balance**: 1,000,000,000,000,000,000,000,000,000 wei

## 🚀 Quick Start

### Starting the Blockchain
```bash
cd /home/brainark/brainark_besu_chain_24
docker-compose -f docker-compose.blockchain.yml up -d
```

### Checking Status
```bash
docker-compose -f docker-compose.blockchain.yml ps
```

### Viewing Logs
```bash
docker-compose -f docker-compose.blockchain.yml logs -f
```

### Stopping the Blockchain
```bash
docker-compose -f docker-compose.blockchain.yml down
```

## 🌐 Network Endpoints

### RPC Endpoints
- **Node 1**: http://localhost:8555
- **Node 2**: http://localhost:8557
- **Node 3**: http://localhost:8559
- **Node 4**: http://localhost:8561

### WebSocket Endpoints
- **Node 1**: ws://localhost:8546
- **Node 2**: ws://localhost:8548
- **Node 3**: ws://localhost:8550
- **Node 4**: ws://localhost:8552

### Metrics Endpoints
- **Node 1**: http://localhost:9555
- **Node 2**: http://localhost:9557
- **Node 3**: http://localhost:9559
- **Node 4**: http://localhost:9561

## 🔐 Validator Information

### Validator Addresses
1. **Node 1**: `0x8f2b14df1e90c569e06e4aa74ea641d5badebdb2`
2. **Node 2**: `0x22b4e848e7cc80f13cf7696b3526176225962e53`
3. **Node 3**: `0x615dac2540d6d30ed8a7b72a2f55c3f0a25854c0`
4. **Node 4**: `0x3d6f4df2e09287364632e7918a6047ac434b963a`

### Public Keys
1. **Node 1**: `0xcc539e267ece9d798e80f0efe0df9db1af6963c6adc3006ab183d8a536fb7fc319825b6f51d245a2d37cb5c2050eb56b7f52f804e2694fb2caa170e2f334ec32`
2. **Node 2**: `0xef57c70de6cf6c1eb745c9cb107edd408d78ed80edaafeaaa964e9c6d6e6591fe53ee7c5c80609d8dde8d4c82984c7e565d4b67e0f231b467ee29fd42dc1f300`
3. **Node 3**: `0x432093a1a2294fec9efa7078164fc2d865ae903874ff2620e347d53bde21450f64a951715679f067fb80f162c380b46abf83fe580e5ee5463adebb25018ffa29`
4. **Node 4**: `0xf0df829526249e493808d5a21dbfc0dddfe8f6958697f18d40d3421e799ed882c28911f93d6022cce49bb5ff0cf65f23d4a4a2e8e2df3ec1419354e9c53984bd`

## 🔧 Testing the Blockchain

### Check Chain ID
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  http://localhost:8555
```

### Check Block Number
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8555
```

### Check Initial Balance
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169","latest"],"id":1}' \
  http://localhost:8555
```

## 📁 Directory Structure
```
/home/brainark/brainark_besu_chain_24/
├── config/
│   ├── genesis.json              # Genesis configuration
│   ├── static-nodes.json         # Static nodes configuration
│   └── permissions_config.toml   # Permissions configuration
├── validators/
│   ├── node1/
│   │   ├── key/key              # Private key for node1
│   │   └── data/                # Blockchain data for node1
│   ├── node2/
│   ├── node3/
│   └── node4/
├── networkFiles/
│   ├── genesis.json             # Generated genesis file
│   └── keys/                    # Generated validator keys
├── docker-compose.blockchain.yml # Docker configuration
├── .env.production.1236         # Environment configuration
└── README_CHAIN_1236.md         # This file
```

## 🔐 Security Notes

### Private Key Management
- All validator private keys are stored in `/home/brainark/brainark_besu_chain_24/validators/nodeX/key/key`
- Environment configuration includes all necessary private keys
- **WARNING**: Keep all private keys secure and never commit them to public repositories

### Network Security
- Uses permissioned network configuration
- Only authorized nodes can join the network
- Account whitelist restricts administrative access

## 🚀 Deployment Guide

### Prerequisites
- Docker and Docker Compose installed
- Ports 8555, 8557, 8559, 8561 available
- Ports 30313, 30317, 30319, 30321 available
- Ports 9555, 9557, 9559, 9561 available

### Environment Setup
1. Copy `.env.production.1236` to your application directory
2. Update `NEXT_PUBLIC_RPC_URL` to `http://localhost:8555`
3. Update `NEXT_PUBLIC_CHAIN_ID` to `1236`
4. Deploy your contracts to the new blockchain

### Contract Deployment
The following contracts need to be deployed to Chain ID 1236:
- EPO Contract (Enhanced Purchase Offering)
- Airdrop Contract V3 (with Oracle Integration)
- Any other custom contracts

## 📈 Migration from Chain ID 424242

### What Changed
- **Chain ID**: 424242 → 1236
- **Validator Keys**: New secure keys generated
- **Network Ports**: Different ports to avoid conflicts
- **Docker Network**: 172.22.0.0/16 (instead of 172.21.0.0/16)

### What Remains Same
- **Initial Supply**: 1 billion BAK tokens
- **Gas Configuration**: Same min gas price (1000 wei)
- **Block Time**: 2 seconds
- **Consensus**: IBFT2
- **Initial Holder**: Same address (`0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169`)

### Migration Steps
1. ✅ Complete backup of original blockchain created
2. ✅ New blockchain with Chain ID 1236 created
3. ✅ All configurations migrated
4. ⏳ Deploy contracts to new blockchain
5. ⏳ Update application configuration
6. ⏳ Test all functionality

## 📞 Support

For technical support or questions about this blockchain:
- **Email**: brainarkbesuchain@gmail.com
- **Telegram**: @Brainark_Besu_BlockChain
- **Twitter**: @sdogcoin1

## 📊 Monitoring

### Health Checks
All nodes include health checks that verify RPC availability every 30 seconds.

### Logs
Monitor blockchain logs for any issues:
```bash
docker-compose -f docker-compose.blockchain.yml logs -f besu-node1-1236
```

### Performance
- 4-node IBFT2 setup provides Byzantine fault tolerance
- Can handle up to 1 node failure while maintaining consensus
- 2-second block time for fast transaction confirmation

---

**Chain ID 1236 BrainArk Blockchain - Production Ready** ✅