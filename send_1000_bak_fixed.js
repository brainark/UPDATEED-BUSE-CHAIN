const Web3 = require('web3');

// Configuration
const RPC_URL = 'http://localhost:8545';
const CHAIN_ID = 424242;

// Addresses
const FROM_ADDRESS = '0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169';
const TO_ADDRESS = '0xCa40038566b915f6b1C6683Fd626C3EcB0e5471E';

// You need to provide the private key for the FROM_ADDRESS
const PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE'; // Replace with actual private key

// Amount to send (1000 BAK)
const AMOUNT = Web3.utils.toWei('1000', 'ether');

async function sendTransaction() {
    try {
        console.log('🚀 BrainArk Transaction - Sending 1000 BAK');
        console.log('==========================================');
        
        // Initialize Web3
        const web3 = new Web3(RPC_URL);
        
        // Check if private key is provided
        if (PRIVATE_KEY === 'YOUR_PRIVATE_KEY_HERE') {
            console.log('❌ ERROR: Please provide the private key');
            console.log('');
            console.log('🔑 To find the private key:');
            console.log('1. Check: /home/brainark/brainark_besu_chain/validators/node1/key/key');
            console.log('2. Or check other validator node directories');
            console.log('3. Update PRIVATE_KEY in this script');
            return;
        }
        
        // Verify network connection
        console.log('🔗 Testing network connection...');
        const blockNumber = await web3.eth.getBlockNumber();
        console.log('✅ Connected! Current block:', blockNumber);
        
        // Check balances
        console.log('');
        console.log('💰 Checking balances...');
        const fromBalance = await web3.eth.getBalance(FROM_ADDRESS);
        const toBalance = await web3.eth.getBalance(TO_ADDRESS);
        
        console.log('From balance:', Web3.utils.fromWei(fromBalance, 'ether'), 'BAK');
        console.log('To balance:', Web3.utils.fromWei(toBalance, 'ether'), 'BAK');
        
        // Get transaction parameters
        console.log('');
        console.log('📝 Preparing transaction...');
        const nonce = await web3.eth.getTransactionCount(FROM_ADDRESS);
        const gasPrice = await web3.eth.getGasPrice();
        
        console.log('Nonce:', nonce);
        console.log('Gas Price:', gasPrice, '(' + Web3.utils.fromWei(gasPrice, 'gwei') + ' Gwei)');
        
        // Create transaction
        const transaction = {
            from: FROM_ADDRESS,
            to: TO_ADDRESS,
            value: AMOUNT,
            gas: 21000,
            gasPrice: gasPrice,
            nonce: nonce,
            chainId: CHAIN_ID
        };
        
        console.log('');
        console.log('📋 Transaction details:');
        console.log('From:', transaction.from);
        console.log('To:', transaction.to);
        console.log('Amount:', Web3.utils.fromWei(transaction.value, 'ether'), 'BAK');
        console.log('Gas Limit:', transaction.gas);
        console.log('Chain ID:', transaction.chainId);
        
        // Sign transaction
        console.log('');
        console.log('🔐 Signing transaction...');
        const signedTransaction = await web3.eth.accounts.signTransaction(transaction, PRIVATE_KEY);
        
        // Send transaction
        console.log('📤 Broadcasting transaction...');
        const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        
        console.log('');
        console.log('✅ Transaction successful!');
        console.log('🎉 Transaction Hash:', receipt.transactionHash);
        console.log('📦 Block Number:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed);
        
        // Check final balances
        console.log('');
        console.log('💰 Final balances:');
        const fromBalanceAfter = await web3.eth.getBalance(FROM_ADDRESS);
        const toBalanceAfter = await web3.eth.getBalance(TO_ADDRESS);
        
        console.log('From balance:', Web3.utils.fromWei(fromBalanceAfter, 'ether'), 'BAK');
        console.log('To balance:', Web3.utils.fromWei(toBalanceAfter, 'ether'), 'BAK');
        
        console.log('');
        console.log('🔗 View transaction in explorer: http://localhost:3000');
        
    } catch (error) {
        console.error('');
        console.error('❌ Transaction failed:', error.message);
        
        // Provide specific error guidance
        if (error.message.includes('insufficient funds')) {
            console.log('💡 Issue: Not enough balance for transaction + gas fees');
        } else if (error.message.includes('nonce')) {
            console.log('💡 Issue: Nonce problem - try again or check pending transactions');
        } else if (error.message.includes('gas')) {
            console.log('💡 Issue: Gas-related problem - check gas price and limit');
        } else if (error.message.includes('private key')) {
            console.log('💡 Issue: Invalid private key format');
        } else if (error.message.includes('connection')) {
            console.log('💡 Issue: Cannot connect to RPC endpoint');
            console.log('   Check if Besu node is running on localhost:8545');
        }
    }
}

// Run the transaction
console.log('Starting BrainArk transaction...');
sendTransaction();