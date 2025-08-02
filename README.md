# 🚀 BrainArk Besu Chain - Fully Operational Blockchain Network

[![Blockchain Status](https://img.shields.io/badge/Status-Fully%20Operational-brightgreen)](https://github.com/brainark/-brainark_besu_chain-new)
[![Consensus](https://img.shields.io/badge/Consensus-IBFT%202.0-blue)](https://besu.hyperledger.org/en/stable/HowTo/Configure/Consensus/IBFT/)
[![Nodes](https://img.shields.io/badge/Validator%20Nodes-4%20Active-success)](https://github.com/brainark/-brainark_besu_chain-new)

## 🎯 Overview

BrainArk Besu Chain is a **fully operational** private Ethereum blockchain network built with Hyperledger Besu, featuring IBFT 2.0 consensus mechanism. All synchronization issues have been resolved and the network is ready for production use.

## ✅ Current Network Status

- **✅ 4 Validator Nodes**: All running and healthy
- **✅ Full Mesh Connectivity**: Each node connected to 3 peers
- **✅ IBFT Consensus**: Ready for block production
- **✅ RPC Endpoints**: All responding correctly
- **✅ Validator Set**: Properly configured and verified

## 🏗️ Network Architecture

### Validator Nodes
| Node | Address | RPC Port | P2P Port | Metrics Port | IP Address |
|------|---------|----------|----------|--------------|------------|
| Node 1 | `0x2db87dc8a9bcaa102b2f091b23df4f5a59e6ba98` | 8545 | 30303 | 9545 | 172.20.0.10 |
| Node 2 | `0x7694ca703abf165d455097a8927af0cc9c52a1b5` | 8547 | 30307 | 9547 | 172.20.0.11 |
| Node 3 | `0x45556433287d5c49f440e72ac3f080a34710d8d2` | 8549 | 30309 | 9549 | 172.20.0.12 |
| Node 4 | `0x8b1a5cfb423736209a2fea79e8120e763bf63b23` | 8551 | 30311 | 9551 | 172.20.0.13 |

### Network Configuration
- **Chain ID**: 424242
- **Consensus**: IBFT 2.0
- **Block Time**: 2 seconds
- **Epoch Length**: 30,000 blocks
- **Request Timeout**: 5 seconds

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/brainark/-brainark_besu_chain-new.git
cd -brainark_besu_chain-new
```

### 2. Start the Blockchain Network
```bash
# Start all validator nodes
docker compose -f docker/docker-compose.blockchain.yml up -d

# Check node status
docker ps | grep besu
```

### 3. Verify Network Connectivity
```bash
# Check peer count for each node (should return "0x3" for 3 peers)
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://localhost:8545

curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://localhost:8547
```

### 4. Check Block Number
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

## 🔧 Additional Services

### Start Block Explorer
```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.explorer.yml up -d
```
Access at: http://localhost:3000

### Start Monitoring Stack
```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.monitoring.yml up -d
```
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## 📁 Project Structure

```
brainark_besu_chain/
├── config/
│   ├── genesis.json              # Genesis block configuration
│   ├── static-nodes.json         # Static node discovery
│   └── permissions_config.toml   # Node permissions (optional)
├── validators/
│   ├── node1/                    # Validator 1 data & keys
│   ├─�� node2/                    # Validator 2 data & keys
│   ├── node3/                    # Validator 3 data & keys
│   └── node4/                    # Validator 4 data & keys
├── docker/
│   ├── docker-compose.blockchain.yml  # Main blockchain services
│   ├── docker-compose.explorer.yml    # Block explorer
│   └── docker-compose.monitoring.yml  # Monitoring stack
├── brainarkblock-explorer/       # Custom block explorer
└── README.md
```

## 🔑 Pre-funded Account

The genesis block includes a pre-funded account for testing:
- **Address**: `0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169`
- **Balance**: 1,000,000,000 ETH

## 🛠️ Development & Testing

### Connect with MetaMask
1. Add Custom Network:
   - **Network Name**: BrainArk Chain
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 424242
   - **Currency Symbol**: ETH

### JSON-RPC API Endpoints
- **Node 1**: http://localhost:8545
- **Node 2**: http://localhost:8547
- **Node 3**: http://localhost:8549
- **Node 4**: http://localhost:8551

### Common RPC Calls
```bash
# Get latest block number
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545

# Get account balance
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169","latest"],"id":1}' \
  http://localhost:8545

# Get validator list
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"ibft_getValidatorsByBlockNumber","params":["latest"],"id":1}' \
  http://localhost:8545
```

## 🔧 Troubleshooting

### Check Node Logs
```bash
docker logs besu-node1 --tail 50
docker logs besu-node2 --tail 50
docker logs besu-node3 --tail 50
docker logs besu-node4 --tail 50
```

### Restart Network
```bash
docker compose -f docker/docker-compose.blockchain.yml restart
```

### Clean Restart (removes blockchain data)
```bash
docker compose -f docker/docker-compose.blockchain.yml down
docker volume prune -f
docker compose -f docker/docker-compose.blockchain.yml up -d
```

## 🎉 Recent Fixes Applied

### ✅ Major Synchronization Issues Resolved:
- **Fixed Invalid Enode URLs**: Corrected node IDs to proper 128-character format
- **Implemented Static IP Addressing**: Assigned fixed IPs (172.20.0.10-13) for reliable connectivity
- **Configured Bootnode Discovery**: Enabled proper peer discovery mechanism
- **Removed Problematic Permissions**: Eliminated faulty permissions configuration
- **Corrected Validator Keys**: Fixed key file structure and paths for nodes 3 & 4

### ✅ Network Improvements:
- **Full Mesh Connectivity**: All 4 nodes now connected (3 peers each)
- **IBFT Consensus Ready**: Properly configured for block production
- **Genesis Alignment**: Validator set matches actual node keys
- **RPC Endpoints**: All nodes responding correctly

## 📊 Network Verification

To verify the network is working correctly:

```bash
# Check all nodes have 3 peers
for port in 8545 8547 8549 8551; do
  echo "Node on port $port:"
  curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
    http://localhost:$port | grep result
done
```

Expected output: Each node should show `"result" : "0x3"` (3 peers)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Docker logs for error messages
3. Open an issue in the GitHub repository

---

**🎉 The BrainArk Besu Chain is now fully operational and ready for production use!**