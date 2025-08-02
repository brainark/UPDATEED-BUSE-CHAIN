const Web3 = require('web3');

// Configuration
const RPC_URL = 'http://localhost:8545'; // Your local Besu node
const CHAIN_ID = 424242; // Your BrainArk chain ID

// Wallet addresses
const FROM_ADDRESS = '0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169'; // Pre-allocated wallet from genesis
const TO_ADDRESS = '0xCa40038566b915f6b1C6683Fd626C3EcB0e5471E';   // Target wallet

// You need the private key for the FROM_ADDRESS to sign transactions
// This is typically stored securely - you'll need to provide it
const FROM_PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE'; // Replace with actual private key

// Amount to send (in Wei) - 1 ETH = 1000000000000000000 Wei
const AMOUNT_TO_SEND = Web3.utils.toWei('100', 'ether'); // Sending 100 coins

async function sendTransaction() {
    try {
        // Initialize Web3
        const web3 = new Web3(RPC_URL);
        
        console.log('🚀 BrainArk Coin Transfer');
        console.log('========================');
        console.log('From:', FROM_ADDRESS);
        console.log('To:', TO_ADDRESS);
        console.log('Amount:', Web3.utils.fromWei(AMOUNT_TO_SEND, 'ether'), 'BAK');
        console.log('Chain ID:', CHAIN_ID);
        console.log('RPC URL:', RPC_URL);
        console.log();

        // Check balances before transaction
        const fromBalance = await web3.eth.getBalance(FROM_ADDRESS);
        const toBalance = await web3.eth.getBalance(TO_ADDRESS);
        
        console.log('📊 Balances Before Transaction:');
        console.log('From Balance:', Web3.utils.fromWei(fromBalance, 'ether'), 'BAK');
        console.log('To Balance:', Web3.utils.fromWei(toBalance, 'ether'), 'BAK');
        console.log();

        // Get transaction count (nonce)
        const nonce = await web3.eth.getTransactionCount(FROM_ADDRESS);
        
        // Get current gas price
        const gasPrice = await web3.eth.getGasPrice();
        
        // Create transaction object
        const transaction = {
            from: FROM_ADDRESS,
            to: TO_ADDRESS,
            value: AMOUNT_TO_SEND,
            gas: 21000, // Standard gas limit for simple transfer
            gasPrice: gasPrice,
            nonce: nonce,
            chainId: CHAIN_ID
        };

        console.log('📝 Transaction Details:');
        console.log('Nonce:', nonce);
        console.log('Gas Price:', gasPrice);
        console.log('Gas Limit:', transaction.gas);
        console.log();

        // Sign and send transaction
        if (FROM_PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
            console.log('❌ ERROR: Please provide the private key for the FROM_ADDRESS');
            console.log('');
            console.log('🔑 To get the private key:');
            console.log('1. Check your validator node key files');
            console.log('2. Or use a wallet that controls the pre-allocated address');
            console.log('3. Update FROM_PRIVATE_KEY in this script');
            return;
        }

        console.log('🔐 Signing transaction...');
        const signedTransaction = await web3.eth.accounts.signTransaction(transaction, FROM_PRIVATE_KEY);
        
        console.log('📤 Sending transaction...');
        const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        
        console.log('✅ Transaction successful!');
        console.log('Transaction Hash:', receipt.transactionHash);
        console.log('Block Number:', receipt.blockNumber);
        console.log('Gas Used:', receipt.gasUsed);
        console.log();

        // Check balances after transaction
        const fromBalanceAfter = await web3.eth.getBalance(FROM_ADDRESS);
        const toBalanceAfter = await web3.eth.getBalance(TO_ADDRESS);
        
        console.log('📊 Balances After Transaction:');
        console.log('From Balance:', Web3.utils.fromWei(fromBalanceAfter, 'ether'), 'BAK');
        console.log('To Balance:', Web3.utils.fromWei(toBalanceAfter, 'ether'), 'BAK');
        console.log();
        
        console.log('🎉 Transfer completed successfully!');
        
    } catch (error) {
        console.error('❌ Transaction failed:', error.message);
        
        if (error.message.includes('insufficient funds')) {
            console.log('💡 The sender account may not have enough balance or gas');
        } else if (error.message.includes('nonce')) {
            console.log('💡 Nonce issue - transaction may have been sent already');
        } else if (error.message.includes('private key')) {
            console.log('💡 Invalid private key provided');
        }
    }
}

// Alternative method using Web3 account unlock (if node allows)
async function sendTransactionWithUnlock() {
    try {
        const web3 = new Web3(RPC_URL);
        
        console.log('🔓 Attempting to unlock account...');
        
        // This requires the node to have personal API enabled and account imported
        await web3.eth.personal.unlockAccount(FROM_ADDRESS, 'password', 600);
        
        const transaction = {
            from: FROM_ADDRESS,
            to: TO_ADDRESS,
            value: AMOUNT_TO_SEND,
            gas: 21000
        };
        
        const receipt = await web3.eth.sendTransaction(transaction);
        console.log('✅ Transaction sent:', receipt.transactionHash);
        
    } catch (error) {
        console.error('❌ Unlock method failed:', error.message);
        console.log('💡 Try the signed transaction method instead');
    }
}

// Run the transaction
console.log('Starting BrainArk coin transfer...');
sendTransaction();