# BrainArk Blockchain - Chain ID 1236

## ⚠️ SECURITY NOTICE
This repository contains blockchain infrastructure code. **NEVER commit private keys, API tokens, or sensitive credentials to version control.** See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## Overview
BrainArk is a private IBFT2 (Istanbul Byzantine Fault Tolerance) blockchain running on Chain ID 1236, designed to resolve conflicts with other testnets and provide a dedicated environment for the BrainArk ecosystem.

### Key Specifications
- **Chain ID:** 1236
- **Consensus:** IBFT2
- **Block Time:** 2 seconds
- **Validators:** 4 nodes (Byzantine Fault Tolerant)
- **Initial Supply:** 1,000,000,000 BAK tokens
- **Gas Limit:** 75,000,000 (0x047868C0)

## Prerequisites
- Docker and Docker Compose
- Node.js (for deployment scripts)
- Git

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd brainark_besu_chain_24

# Copy environment template
cp .env.template .env.production.1236

# Edit with your actual credentials (NEVER commit this file!)
nano .env.production.1236
```

### 2. Start the Blockchain

```bash
# Start all validator nodes
docker-compose -f docker-compose.blockchain.yml up -d

# Check status
docker-compose -f docker-compose.blockchain.yml ps

# View logs
docker-compose -f docker-compose.blockchain.yml logs -f
```

### 3. Verify Blockchain is Running

```bash
# Check chain ID
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  http://localhost:8555

# Check block number
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8555
```

## Network Endpoints

### RPC Endpoints
- **Node 1 (Primary):** http://localhost:8555
- **Node 2:** http://localhost:8557
- **Node 3:** http://localhost:8559
- **Node 4:** http://localhost:8561

### WebSocket Endpoints
- **Node 1:** ws://localhost:8546
- **Node 2:** ws://localhost:8548
- **Node 3:** ws://localhost:8550
- **Node 4:** ws://localhost:8552

## Management Scripts

### Using blockchain-manager.sh

```bash
# Start blockchain
./blockchain-manager.sh start

# Check status
./blockchain-manager.sh status

# View logs
./blockchain-manager.sh logs

# Stop blockchain
./blockchain-manager.sh stop

# Test functionality
./blockchain-manager.sh test
```

## Deploying Smart Contracts

```bash
# Deploy contracts to Chain ID 1236
node deploy-to-chain-1236.js
```

## Directory Structure

```
brainark_besu_chain_24/
├── .gitignore                      # Protects sensitive files
├── .env.template                   # Safe template (commit this)
├── .env.production.1236            # Actual secrets (NEVER commit!)
├── SECURITY.md                     # Security guidelines
├── README.md                       # This file
├── config/
│   ├── genesis.json               # Blockchain genesis config
│   ├── static-nodes.json          # Node discovery
│   └── permissions_config.toml    # Network permissions
├── validators/
│   ├── node1/                     # Validator 1 (gitignored)
│   ├── node2/                     # Validator 2 (gitignored)
│   ├── node3/                     # Validator 3 (gitignored)
│   └── node4/                     # Validator 4 (gitignored)
├── docker-compose.blockchain.yml  # Container orchestration
├── blockchain-manager.sh          # Management script
└── deploy-to-chain-1236.js       # Contract deployment
```

## Security

### Critical Security Rules

1. ✅ **DO:**
   - Use `.env.template` as reference
   - Store secrets in `.env.production.1236` (gitignored)
   - Keep private keys in secure vaults
   - Use different keys for dev/prod
   - Review `git status` before commits

2. ❌ **DON'T:**
   - Commit `.env` files with real credentials
   - Share private keys via email/chat
   - Push validator keys to git
   - Use production keys in development
   - Commit files containing "PRIVATE_KEY"

### Before First Commit

```bash
# Verify sensitive files are ignored
git status

# These should NOT appear:
# - .env.production.1236
# - validators/node*/key/
# - Any files with actual keys

# Test .gitignore is working
git check-ignore -v .env.production.1236
# Should output: .gitignore:17:.env.production.*  .env.production.1236
```

### If Secrets Are Exposed

**If you accidentally commit secrets:**
1. ⚠️ **DO NOT** just delete and recommit (history persists!)
2. 🔑 **Immediately rotate ALL exposed credentials**
3. 💰 **Move funds to new secure wallets**
4. 🗑️ **Delete and recreate the repository**
5. 📖 **Read [SECURITY.md](SECURITY.md) thoroughly**

## Monitoring

### Health Checks
```bash
# Check all nodes are healthy
docker-compose -f docker-compose.blockchain.yml ps

# Should show all nodes as "Up (healthy)"
```

### View Real-time Logs
```bash
# All nodes
docker-compose -f docker-compose.blockchain.yml logs -f

# Specific node
docker-compose -f docker-compose.blockchain.yml logs -f besu-node1-1236
```

## Troubleshooting

### Blockchain Won't Start
```bash
# Check logs for errors
docker-compose -f docker-compose.blockchain.yml logs

# Restart services
docker-compose -f docker-compose.blockchain.yml restart

# Clean restart
docker-compose -f docker-compose.blockchain.yml down
docker-compose -f docker-compose.blockchain.yml up -d
```

### Can't Connect to RPC
```bash
# Verify node is running
curl http://localhost:8555

# Check firewall rules
sudo ufw status

# Check port availability
netstat -tuln | grep 8555
```

### Validator Issues
```bash
# Check validator keys exist
ls -la validators/node*/key/key

# Verify permissions
chmod 600 validators/node*/key/key
```

## Migration from Chain ID 424242

This blockchain was migrated from Chain ID 424242 to resolve conflicts with Fastex Chain testnet.

### What Changed:
- Chain ID: 424242 → 1236
- New validator keys generated
- Different network ports
- Isolated Docker network

### What Stayed Same:
- Initial supply: 1 billion BAK
- Gas configuration
- Block time: 2 seconds
- IBFT2 consensus

## Development

### Testing Transactions
```bash
# Get balance
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169","latest"],"id":1}' \
  http://localhost:8555
```

### Adding Custom Nodes
Edit `config/static-nodes.json` to add more validator nodes.

## Production Deployment

### Checklist
- [ ] All secrets stored in secure vault (not in files)
- [ ] Validator keys backed up securely
- [ ] Monitoring and alerts configured
- [ ] SSL/TLS configured for external access
- [ ] Firewall rules configured
- [ ] Regular backup schedule established
- [ ] Incident response plan documented
- [ ] Team trained on security practices

### External Access
For production, configure reverse proxy with SSL:
```nginx
# Example Nginx configuration
server {
    listen 443 ssl;
    server_name rpc.brainark.online;

    location / {
        proxy_pass http://localhost:8555;
    }
}
```

## Support

- **Email:** brainarkbesuchain@gmail.com
- **Telegram:** @Brainark_Besu_BlockChain
- **Twitter:** @sdogcoin1

## Additional Documentation

- [SECURITY.md](SECURITY.md) - Security best practices
- [CHAIN_1236_DEPLOYMENT_SUMMARY.md](CHAIN_1236_DEPLOYMENT_SUMMARY.md) - Deployment details
- [README_CHAIN_1236.md](README_CHAIN_1236.md) - Technical specifications

## License

See project license file.

---

**🔒 Remember: Security is not optional. Always follow the guidelines in [SECURITY.md](SECURITY.md)**
