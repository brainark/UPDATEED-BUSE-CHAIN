# 🔧 Fix MetaMask Configuration for BrainArk

## Current Issue
Your transaction failed with JSON RPC error. This is usually due to incorrect network configuration.

## Step 1: Remove and Re-add BrainArk Network

1. **Open MetaMask**
2. **Go to Settings → Networks**
3. **Delete the existing BrainArk network** (if any)
4. **Add Network with EXACT settings:**

```
Network Name: BrainArk Chain
New RPC URL: http://localhost:8545
Chain ID: 424242
Currency Symbol: BAK
Block Explorer URL: http://localhost:3000
```

## Step 2: Check RPC Connection

Test if MetaMask can connect:
1. Switch to BrainArk network
2. Check if your balance shows correctly
3. If balance shows 0, there's still a connection issue

## Step 3: Alternative RPC URLs to Try

If localhost doesn't work, try:
- `http://127.0.0.1:8545`
- `http://0.0.0.0:8545`

## Step 4: Check Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Try the transaction again
4. Look for specific error messages

## Step 5: Verify Node Accessibility

Run this test:
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

Should return current block number.

## Common Fixes

### Fix 1: CORS Issues
Your Besu node might need CORS enabled. Check if your node startup includes:
```
--rpc-http-cors-origins=all
```

### Fix 2: Host Whitelist
Ensure your node allows connections:
```
--host-allowlist="*"
```

### Fix 3: Firewall/Network
- Disable firewall temporarily
- Check if port 8545 is accessible
- Try from different browser/incognito mode

## Alternative: Use Direct Script Instead

If MetaMask continues to fail, use this Node.js script:

```javascript
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

async function sendTransaction() {
  const privateKey = 'YOUR_PRIVATE_KEY_HERE'; // Get from validator keys
  const from = '0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169';
  const to = '0xCa40038566b915f6b1C6683Fd626C3EcB0e5471E';
  
  const tx = {
    from: from,
    to: to,
    value: web3.utils.toWei('1000', 'ether'),
    gas: 21000,
    gasPrice: '1000', // Use network gas price
    nonce: await web3.eth.getTransactionCount(from),
    chainId: 424242
  };
  
  const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
  console.log('Success! TX Hash:', receipt.transactionHash);
}

sendTransaction().catch(console.error);
```

Save as `send_fixed.js` and run: `node send_fixed.js`