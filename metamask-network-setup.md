# MetaMask Network Configuration for BrainArk Besu Chain

## Network Details
Based on your Besu configuration, here are the correct network parameters:

- **Network Name**: BrainArk Local Network
- **RPC URL**: http://localhost:8545
- **Chain ID**: 424242
- **Currency Symbol**: ETH
- **Block Explorer URL**: http://localhost:3000 (if explorer is running)

## Manual Setup Instructions

### Step 1: Add Network to MetaMask
1. Open MetaMask extension
2. Click on the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" or "Custom RPC"
4. Fill in the following details:
   - **Network Name**: BrainArk Local Network
   - **New RPC URL**: http://localhost:8545
   - **Chain ID**: 424242
   - **Currency Symbol**: ETH
   - **Block Explorer URL**: http://localhost:3000 (optional)

### Step 2: Import Account with Funds
The genesis block allocates funds to: `0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169`

To use this account, you'll need the private key from your validator nodes.

## Troubleshooting Common Issues

### Issue 1: "Network name may not correctly match this chain ID"
- **Solution**: Use "BrainArk Local Network" or any custom name you prefer
- **Reason**: MetaMask doesn't recognize custom chain IDs

### Issue 2: "Currency symbol does not match what we expect"
- **Solution**: Use "ETH" as the currency symbol
- **Reason**: Besu uses ETH as the native currency

### Issue 3: "RPC URL value does not match a known provider"
- **Solution**: Use http://localhost:8545 and ensure your Besu node is running
- **Reason**: This is a custom local network, not a public one

### Issue 4: Connection Refused
- **Solution**: Make sure your Besu blockchain is running:
  ```bash
  cd /home/brainark/brainark_besu_chain
  docker-compose -f docker-compose.blockchain.yml up -d
  ```

## Alternative RPC Endpoints
If port 8545 is busy, you can use other nodes:
- Node 2: http://localhost:8547
- Node 3: http://localhost:8549
- Node 4: http://localhost:8551

## Verification Steps
1. After adding the network, switch to it in MetaMask
2. Check that the chain ID shows as 424242
3. Try sending a test transaction
4. Verify the transaction appears in your block explorer

## Security Notes
- This is a local development network
- Private keys should never be used on mainnet
- Always verify network details before proceeding with transactions