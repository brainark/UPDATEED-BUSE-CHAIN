#!/usr/bin/env node

/**
 * Appwrite Collections Setup Script
 * Creates collections in existing database
 */

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Configuration
const CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68b38f7b000525d3e7f4',
  databaseId: 'default', // Use default database for free plan
  apiKey: 'standard_ac626a178832d5f3a4809fdf46e403e10748789aabf90fd119e9fe8d5c03e79262981a86e39c1271618b0b553a4710fe236c741c5b096e266e4ece2f88d4675f735f25b63b93ce1559e6e608bf1ae45a2068bd318b5b7d13220c118027be3ef7b58bb040b153f564d5b76b1b7dd087eb63d0cb11b2bfb58947e4e3d779b97fee'
};

const client = new Client();
client
  .setEndpoint(CONFIG.endpoint)
  .setProject(CONFIG.projectId)
  .setKey(CONFIG.apiKey);

const databases = new Databases(client);

async function setupCollections() {
  console.log('🚀 Setting up BrainArk Collections...\n');

  try {
    // List existing databases to see what's available
    console.log('📋 Checking available databases...');
    const databasesList = await databases.list();
    console.log('Available databases:', databasesList.databases.map(db => ({ id: db.$id, name: db.name })));
    
    // Use the first available database or default
    const targetDatabase = databasesList.databases[0]?.$id || 'default';
    console.log('Using database:', targetDatabase);

    // Create Users Collection
    console.log('\n👥 Creating Users collection...');
    const usersCollection = await databases.createCollection(
      targetDatabase,
      'users',
      'Users',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );

    // Wait a bit for collection to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add attributes to Users collection
    console.log('Adding attributes to Users collection...');
    await databases.createStringAttribute(targetDatabase, 'users', 'walletAddress', 255, true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'users', 'referralCode', 50, true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createFloatAttribute(targetDatabase, 'users', 'totalEarned', true, 0);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'users', 'registrationDate', 50, true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIntegerAttribute(targetDatabase, 'users', 'distributionBatch', true, 1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'users', 'distributionStatus', 20, true, 'pending');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'users', 'estimatedDistributionTime', 50, false);

    console.log('✅ Users collection created with attributes');

    // Create Airdrop Registrations Collection
    console.log('\n🎁 Creating Airdrop Registrations collection...');
    const airdropCollection = await databases.createCollection(
      targetDatabase,
      'airdrop_registrations',
      'Airdrop Registrations',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );

    // Wait a bit for collection to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add attributes to Airdrop Registrations collection
    console.log('Adding attributes to Airdrop Registrations collection...');
    await databases.createStringAttribute(targetDatabase, 'airdrop_registrations', 'userId', 255, true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'airdrop_registrations', 'walletAddress', 255, true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'airdrop_registrations', 'referralCode', 50, true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'airdrop_registrations', 'referredBy', 255, false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createBooleanAttribute(targetDatabase, 'airdrop_registrations', 'socialTasksCompleted', true, false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'airdrop_registrations', 'registrationDate', 50, true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIntegerAttribute(targetDatabase, 'airdrop_registrations', 'distributionBatch', true, 1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createFloatAttribute(targetDatabase, 'airdrop_registrations', 'tokensEarned', true, 0);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'airdrop_registrations', 'status', 20, true, 'pending');

    console.log('✅ Airdrop Registrations collection created with attributes');

    // Create Distribution Batches Collection
    console.log('\n📦 Creating Distribution Batches collection...');
    const batchesCollection = await databases.createCollection(
      targetDatabase,
      'distribution_batches',
      'Distribution Batches',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );

    // Wait a bit for collection to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add attributes to Distribution Batches collection
    console.log('Adding attributes to Distribution Batches collection...');
    await databases.createIntegerAttribute(targetDatabase, 'distribution_batches', 'batchNumber', true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIntegerAttribute(targetDatabase, 'distribution_batches', 'totalUsers', true, 0);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createFloatAttribute(targetDatabase, 'distribution_batches', 'totalTokens', true, 0);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'distribution_batches', 'status', 20, true, 'pending');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'distribution_batches', 'startDate', 50, false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createStringAttribute(targetDatabase, 'distribution_batches', 'completionDate', 50, false);

    console.log('✅ Distribution Batches collection created with attributes');

    // Wait a bit more for all attributes to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Create some sample data
    console.log('\n🌱 Creating sample data...');
    
    // Create sample batch
    await databases.createDocument(
      targetDatabase,
      'distribution_batches',
      ID.unique(),
      {
        batchNumber: 1,
        totalUsers: 0,
        totalTokens: 0,
        status: 'pending',
        startDate: new Date().toISOString()
      }
    );

    console.log('✅ Sample batch created');

    console.log('\n🎉 Collections setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Database ID:', targetDatabase);
    console.log('- Collections: users, airdrop_registrations, distribution_batches');
    console.log('- Permissions: Read/Write for any user');
    console.log('\n📝 Update your .env.local with:');
    console.log(`NEXT_PUBLIC_APPWRITE_DATABASE_ID=${targetDatabase}`);
    console.log('\n🌐 Your DApp should now work without CORS errors!');

  } catch (error) {
    console.error('❌ Error setting up collections:', error);
    if (error.code === 409) {
      console.log('💡 Note: Some resources might already exist, which is normal.');
    }
  }
}

// Run the setup
setupCollections();