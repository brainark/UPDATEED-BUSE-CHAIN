const Web3 = require('web3');

// Configuration for VPS
const RPC_URL = 'https://rpc.brainark.online';
const CHAIN_ID = 424242;

// Test addresses (you'll need to provide actual private keys)
const ACCOUNTS = [
    {
        address: '0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169',
        privateKey: 'YOUR_PRIVATE_KEY_1' // Replace with actual private key
    },
    {
        address: '0xCa40038566b915f6b1C6683Fd626C3EcB0e5471E',
        privateKey: 'YOUR_PRIVATE_KEY_2' // Replace with actual private key
    }
];

async function createTestTransactions() {
    try {
        console.log('🚀 Creating Test Transactions for BrainArk Explorer');
        console.log('====================================================');
        
        // Initialize Web3
        const web3 = new Web3(RPC_URL);
        
        // Check network connection
        console.log('🔗 Testing network connection...');
        const blockNumber = await web3.eth.getBlockNumber();
        console.log('✅ Connected! Current block:', blockNumber);
        
        // Check if we have valid private keys
        if (ACCOUNTS[0].privateKey === 'YOUR_PRIVATE_KEY_1') {
            console.log('❌ ERROR: Please provide actual private keys');
            console.log('');
            console.log('🔑 To find private keys:');
            console.log('1. Check validator directories: /home/brainark/brainark_besu_chain/validators/node*/key/key');
            console.log('2. Or use the allocated account private key');
            console.log('3. Update the ACCOUNTS array in this script');
            return;
        }
        
        // Get current gas price
        const gasPrice = await web3.eth.getGasPrice();
        console.log('⛽ Current gas price:', gasPrice, 'wei');
        
        // Create multiple test transactions
        const transactions = [
            { from: 0, to: 1, amount: '10' },
            { from: 1, to: 0, amount: '5' },
            { from: 0, to: 1, amount: '25' },
            { from: 1, to: 0, amount: '15' },
            { from: 0, to: 1, amount: '50' }
        ];
        
        console.log('');
        console.log('📤 Creating test transactions...');
        
        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const fromAccount = ACCOUNTS[tx.from];
            const toAccount = ACCOUNTS[tx.to];
            
            try {
                console.log(`\n🔄 Transaction ${i + 1}/${transactions.length}:`);
                console.log(`   From: ${fromAccount.address}`);
                console.log(`   To: ${toAccount.address}`);
                console.log(`   Amount: ${tx.amount} BAK`);
                
                // Get nonce
                const nonce = await web3.eth.getTransactionCount(fromAccount.address);
                
                // Create transaction object
                const transaction = {
                    from: fromAccount.address,
                    to: toAccount.address,
                    value: Web3.utils.toWei(tx.amount, 'ether'),
                    gas: 21000,
                    gasPrice: gasPrice,
                    nonce: nonce,
                    chainId: CHAIN_ID
                };
                
                // Sign transaction
                const signedTx = await web3.eth.accounts.signTransaction(transaction, fromAccount.privateKey);
                
                // Send transaction
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                
                console.log(`   ✅ Success! Hash: ${receipt.transactionHash}`);
                console.log(`   📦 Block: ${receipt.blockNumber}`);
                console.log(`   ⛽ Gas Used: ${receipt.gasUsed}`);
                
                // Wait 3 seconds between transactions
                if (i < transactions.length - 1) {
                    console.log('   ⏳ Waiting 3 seconds...');
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                
            } catch (txError) {
                console.log(`   ❌ Failed: ${txError.message}`);
                continue;
            }
        }
        
        console.log('');
        console.log('🎉 Test transactions completed!');
        console.log('🔗 Check the explorer: https://explorer.brainark.online');
        console.log('📊 Latest transactions should now be visible');
        
    } catch (error) {
        console.error('❌ Error creating test transactions:', error.message);
        
        if (error.message.includes('connection')) {
            console.log('💡 Check if the RPC endpoint is accessible: https://rpc.brainark.online');
        } else if (error.message.includes('private key')) {
            console.log('💡 Check private key format and validity');
        }
    }
}

// Alternative: Create transactions using allocated account
async function createTransactionsWithAllocatedAccount() {
    try {
        console.log('🚀 Creating Transactions with Allocated Account');
        console.log('===============================================');
        
        const web3 = new Web3(RPC_URL);
        
        // Check allocated account balance
        const allocatedAccount = '0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169';
        const balance = await web3.eth.getBalance(allocatedAccount);
        
        console.log('💰 Allocated account balance:', Web3.utils.fromWei(balance, 'ether'), 'BAK');
        
        if (parseFloat(Web3.utils.fromWei(balance, 'ether')) < 100) {
            console.log('❌ Insufficient balance for test transactions');
            return;
        }
        
        // Create some random addresses for testing
        const testAddresses = [];
        for (let i = 0; i < 3; i++) {
            const account = web3.eth.accounts.create();
            testAddresses.push(account.address);
            console.log(`📝 Test address ${i + 1}: ${account.address}`);
        }
        
        console.log('');
        console.log('⚠️  To complete test transactions, you need:');
        console.log('1. Private key for allocated account: 0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169');
        console.log('2. Update this script with the private key');
        console.log('3. Run the script to create transactions');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the appropriate function
if (process.argv[2] === '--allocated') {
    createTransactionsWithAllocatedAccount();
} else {
    createTestTransactions();
}

console.log('');
console.log('💡 Usage:');
console.log('node create_test_transactions.js           # Use predefined accounts');
console.log('node create_test_transactions.js --allocated # Use allocated account info');