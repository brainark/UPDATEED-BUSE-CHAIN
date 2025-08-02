# 🚀 How to Send BAK Coins from Pre-allocated Wallet

## Current Status
- **From Wallet:** `0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169` (1,000,000,000 BAK)
- **To Wallet:** `0xCa40038566b915f6b1C6683Fd626C3EcB0e5471E` (0 BAK)
- **Network:** BrainArk Chain (Chain ID: 424242)

## Method 1: Using MetaMask (Recommended)

### Step 1: Add BrainArk Network to MetaMask
1. Open MetaMask
2. Click Networks dropdown → "Add Network"
3. Add Custom Network:
   - **Network Name:** BrainArk Chain
   - **RPC URL:** http://localhost:8545
   - **Chain ID:** 424242
   - **Currency Symbol:** BAK
   - **Block Explorer:** http://localhost:3000

### Step 2: Import the Pre-allocated Account
You need the private key for `0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169`

**To find the private key:**
1. Check your validator node directories
2. Look in `/home/brainark/brainark_besu_chain/validators/node*/key/key`
3. Or check if you have a keystore file

### Step 3: Send Transaction
1. Select BrainArk network in MetaMask
2. Click "Send"
3. Enter recipient: `0xCa40038566b915f6b1C6683Fd626C3EcB0e5471E`
4. Enter amount (e.g., 100 BAK)
5. Confirm transaction

## Method 2: Using Web3 Script

### Prerequisites
```bash
npm install web3
```

### Update the Script
Edit `send_transaction.js` and add the private key:
```javascript
const FROM_PRIVATE_KEY = 'YOUR_ACTUAL_PRIVATE_KEY_HERE';
```

### Run the Script
```bash
node send_transaction.js
```

## Method 3: Using Your Explorer

1. Open your explorer: http://localhost:3000
2. Connect MetaMask with the pre-allocated account
3. Use the explorer's send function (if available)

## Method 4: Direct RPC Call (Advanced)

If you have the private key, you can sign and send directly:

```bash
# Create signed transaction
node -e "
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');

const privateKey = 'YOUR_PRIVATE_KEY';
const transaction = {
  to: '0xCa40038566b915f6b1C6683Fd626C3EcB0e5471E',
  value: web3.utils.toWei('100', 'ether'),
  gas: 21000,
  gasPrice: '1000',
  nonce: 0,
  chainId: 424242
};

web3.eth.accounts.signTransaction(transaction, privateKey)
  .then(signed => {
    return web3.eth.sendSignedTransaction(signed.rawTransaction);
  })
  .then(receipt => {
    console.log('Transaction hash:', receipt.transactionHash);
  });
"
```

## Finding the Private Key

The private key for the pre-allocated account might be in:

1. **Validator node keys:**
   ```bash
   cat /home/brainark/brainark_besu_chain/validators/node1/key/key
   ```

2. **Genesis account keystore** (if you created one)

3. **Your wallet backup** (if you generated this address)

## Security Note
⚠️ **Never share private keys publicly!** The examples above are for your local development network only.

## Verification

After sending, verify the transaction:
```bash
# Check new balances
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xCa40038566b915f6b1C6683Fd626C3EcB0e5471E","latest"],"id":1}' \
  http://localhost:8545
```

The easiest method is using MetaMask once you have the private key for the pre-allocated account!