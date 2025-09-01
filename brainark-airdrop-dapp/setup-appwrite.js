#!/usr/bin/env node

/**
 * Appwrite Database Setup Script
 * Run this to automatically create your database and collections
 */

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Configuration
const CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68b38f7b000525d3e7f4',
  databaseId: 'brainark-airdrop-dev',
  // You'll need to get an API key from your Appwrite console
  apiKey: 'standard_ac626a178832d5f3a4809fdf46e403e10748789aabf90fd119e9fe8d5c03e79262981a86e39c1271618b0b553a4710fe236c741c5b096e266e4ece2f88d4675f735f25b63b93ce1559e6e608bf1ae45a2068bd318b5b7d13220c118027be3ef7b58bb040b153f564d5b76b1b7dd087eb63d0cb11b2bfb58947e4e3d779b97fee'
};

const client = new Client();
client
  .setEndpoint(CONFIG.endpoint)
  .setProject(CONFIG.projectId)
  .setKey(CONFIG.apiKey);

const databases = new Databases(client);

async function setupDatabase() {
  console.log('🚀 Setting up BrainArk Appwrite Database...\n');

  try {
    // Create Database
    console.log('📁 Creating database...');
    const database = await databases.create(
      CONFIG.databaseId,
      'BrainArk Airdrop Dev Database'
    );
    console.log('✅ Database created:', database.name);

    // Create Users Collection
    console.log('\n👥 Creating Users collection...');
    const usersCollection = await databases.createCollection(
      CONFIG.databaseId,
      'users',
      'Users',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );

    // Add attributes to Users collection
    await databases.createStringAttribute(CONFIG.databaseId, 'users', 'walletAddress', 255, true);
    await databases.createStringAttribute(CONFIG.databaseId, 'users', 'referralCode', 50, true);
    await databases.createFloatAttribute(CONFIG.databaseId, 'users', 'totalEarned', true, 0);
    await databases.createStringAttribute(CONFIG.databaseId, 'users', 'registrationDate', 50, true);
    await databases.createIntegerAttribute(CONFIG.databaseId, 'users', 'distributionBatch', true, 1);
    await databases.createStringAttribute(CONFIG.databaseId, 'users', 'distributionStatus', 20, true, 'pending');
    await databases.createStringAttribute(CONFIG.databaseId, 'users', 'estimatedDistributionTime', 50, false);

    console.log('✅ Users collection created with attributes');

    // Create Airdrop Registrations Collection
    console.log('\n🎁 Creating Airdrop Registrations collection...');
    const airdropCollection = await databases.createCollection(
      CONFIG.databaseId,
      'airdrop_registrations',
      'Airdrop Registrations',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );

    // Add attributes to Airdrop Registrations collection
    await databases.createStringAttribute(CONFIG.databaseId, 'airdrop_registrations', 'userId', 255, true);
    await databases.createStringAttribute(CONFIG.databaseId, 'airdrop_registrations', 'walletAddress', 255, true);
    await databases.createStringAttribute(CONFIG.databaseId, 'airdrop_registrations', 'referralCode', 50, true);
    await databases.createStringAttribute(CONFIG.databaseId, 'airdrop_registrations', 'referredBy', 255, false);
    await databases.createBooleanAttribute(CONFIG.databaseId, 'airdrop_registrations', 'socialTasksCompleted', true, false);
    await databases.createStringAttribute(CONFIG.databaseId, 'airdrop_registrations', 'registrationDate', 50, true);
    await databases.createIntegerAttribute(CONFIG.databaseId, 'airdrop_registrations', 'distributionBatch', true, 1);
    await databases.createFloatAttribute(CONFIG.databaseId, 'airdrop_registrations', 'tokensEarned', true, 0);
    await databases.createStringAttribute(CONFIG.databaseId, 'airdrop_registrations', 'status', 20, true, 'pending');

    console.log('✅ Airdrop Registrations collection created with attributes');

    // Create Distribution Batches Collection
    console.log('\n📦 Creating Distribution Batches collection...');
    const batchesCollection = await databases.createCollection(
      CONFIG.databaseId,
      'distribution_batches',
      'Distribution Batches',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    );

    // Add attributes to Distribution Batches collection
    await databases.createIntegerAttribute(CONFIG.databaseId, 'distribution_batches', 'batchNumber', true);
    await databases.createIntegerAttribute(CONFIG.databaseId, 'distribution_batches', 'totalUsers', true, 0);
    await databases.createFloatAttribute(CONFIG.databaseId, 'distribution_batches', 'totalTokens', true, 0);
    await databases.createStringAttribute(CONFIG.databaseId, 'distribution_batches', 'status', 20, true, 'pending');
    await databases.createStringAttribute(CONFIG.databaseId, 'distribution_batches', 'startDate', 50, false);
    await databases.createStringAttribute(CONFIG.databaseId, 'distribution_batches', 'completionDate', 50, false);

    console.log('✅ Distribution Batches collection created with attributes');

    // Create some sample data
    console.log('\n🌱 Creating sample data...');
    
    // Create sample batch
    await databases.createDocument(
      CONFIG.databaseId,
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

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Database ID:', CONFIG.databaseId);
    console.log('- Collections: users, airdrop_registrations, distribution_batches');
    console.log('- Permissions: Read/Write for any user');
    console.log('\n🌐 Your DApp should now work without CORS errors!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    if (error.code === 409) {
      console.log('💡 Note: Some resources might already exist, which is normal.');
    }
  }
}

// Run the setup
setupDatabase();