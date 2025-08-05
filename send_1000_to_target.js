const { Web3 } = require('web3');

// Configuration
const RPC_URL = 'http://localhost:8545';
const CHAIN_ID = 424242;

// Addresses
const FROM_ADDRESS = '0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169';
const TO_ADDRESS = '0xF2991A2A177E06E72942411B23f1B358E938374B';

// Private key for the FROM_ADDRESS (allocated account)
const PRIVATE_KEY = '0x3bf095cfc3a1382c261b6b16e90df2aec2aa69a12a57f78b0b5cf9fab4973b65';

// Amount to send (1000 BAK)
const AMOUNT = Web3.utils.toWei('1000', 'ether');

async function sendTransaction() {
    try {
        console.log('🚀 BrainArk Transaction - Sending 1000 BAK');
        console.log('==========================================');
        
        // Initialize Web3
        const web3 = new Web3(RPC_URL);
        
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
        
        // Verify we have enough balance
        const totalCost = BigInt(AMOUNT) + BigInt('21000000000000000'); // Amount + gas cost estimate
        if (BigInt(fromBalance) < totalCost) {
            console.log('❌ ERROR: Insufficient balance for transaction + gas fees');
            return;
        }
        
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