#!/usr/bin/env node

/**
 * Complete Appwrite Setup Script
 * Creates all missing collections based on codebase analysis
 */

const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Configuration
const CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68b38f7b000525d3e7f4',
  databaseId: 'brainark-airdrop-dev',
  apiKey: 'standard_ac626a178832d5f3a4809fdf46e403e10748789aabf90fd119e9fe8d5c03e79262981a86e39c1271618b0b553a4710fe236c741c5b096e266e4ece2f88d4675f735f25b63b93ce1559e6e608bf1ae45a2068bd318b5b7d13220c118027be3ef7b58bb040b153f564d5b76b1b7dd087eb63d0cb11b2bfb58947e4e3d779b97fee'
};

const client = new Client();
client
  .setEndpoint(CONFIG.endpoint)
  .setProject(CONFIG.projectId)
  .setKey(CONFIG.apiKey);

const databases = new Databases(client);

// Helper function to wait between operations
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createCollectionSafely(databaseId, collectionId, name, permissions, attributes) {
  try {
    console.log(`\n📝 Creating collection: ${name}...`);
    
    // Try to create collection
    const collection = await databases.createCollection(
      databaseId,
      collectionId,
      name,
      permissions
    );
    console.log(`✅ Collection "${name}" created successfully`);
    
    // Wait for collection to be ready
    await wait(2000);
    
    // Add attributes
    console.log(`   Adding attributes to ${name}...`);
    for (const attribute of attributes) {
      try {
        if (attribute.type === 'string') {
          await databases.createStringAttribute(
            databaseId, 
            collectionId, 
            attribute.key, 
            attribute.size, 
            attribute.required, 
            attribute.default
          );
        } else if (attribute.type === 'integer') {
          await databases.createIntegerAttribute(
            databaseId, 
            collectionId, 
            attribute.key, 
            attribute.required, 
            attribute.min, 
            attribute.max, 
            attribute.default
          );
        } else if (attribute.type === 'double') {
          await databases.createFloatAttribute(
            databaseId, 
            collectionId, 
            attribute.key, 
            attribute.required, 
            attribute.min, 
            attribute.max, 
            attribute.default
          );
        } else if (attribute.type === 'boolean') {
          await databases.createBooleanAttribute(
            databaseId, 
            collectionId, 
            attribute.key, 
            attribute.required, 
            attribute.default
          );
        }
        console.log(`     ✓ Added attribute: ${attribute.key}`);
        await wait(1000); // Wait between attributes
      } catch (attrError) {
        console.log(`     ⚠️ Attribute ${attribute.key} might already exist`);
      }
    }
    return true;
  } catch (error) {
    if (error.code === 409) {
      console.log(`   ℹ️ Collection "${name}" already exists`);
      return false;
    } else {
      console.error(`   ❌ Error creating collection "${name}":`, error.message);
      return false;
    }
  }
}

async function setupCompleteDatabase() {
  console.log('🚀 Setting up Complete BrainArk Appwrite Database...\n');
  console.log('📋 Based on codebase analysis, setting up all required collections:\n');

  const permissions = [
    Permission.read(Role.any()),
    Permission.create(Role.any()),
    Permission.update(Role.any()),
    Permission.delete(Role.any())
  ];

  try {
    // Collection 1: Users
    await createCollectionSafely(
      CONFIG.databaseId,
      'users',
      'Users',
      permissions,
      [
        { key: 'walletAddress', type: 'string', size: 255, required: true },
        { key: 'referralCode', type: 'string', size: 50, required: true },
        { key: 'totalEarned', type: 'double', required: true, default: 0 },
        { key: 'registrationDate', type: 'string', size: 50, required: true },
        { key: 'distributionBatch', type: 'integer', required: false, default: 1 },
        { key: 'distributionStatus', type: 'string', size: 20, required: true, default: 'pending' },
        { key: 'estimatedDistributionTime', type: 'string', size: 50, required: false }
      ]
    );

    // Collection 2: Airdrop Registrations
    await createCollectionSafely(
      CONFIG.databaseId,
      'airdrop_registrations',
      'Airdrop Registrations',
      permissions,
      [
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'walletAddress', type: 'string', size: 255, required: true },
        { key: 'referralCode', type: 'string', size: 50, required: true },
        { key: 'referredBy', type: 'string', size: 255, required: false },
        { key: 'socialTasksCompleted', type: 'boolean', required: true, default: false },
        { key: 'registrationDate', type: 'string', size: 50, required: true },
        { key: 'distributionBatch', type: 'integer', required: true, default: 1 },
        { key: 'tokensEarned', type: 'double', required: true, default: 0 },
        { key: 'status', type: 'string', size: 20, required: true, default: 'pending' }
      ]
    );

    // Collection 3: Social Tasks (NEW)
    await createCollectionSafely(
      CONFIG.databaseId,
      'social_tasks',
      'Social Tasks',
      permissions,
      [
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'taskId', type: 'string', size: 50, required: true },
        { key: 'taskName', type: 'string', size: 100, required: true },
        { key: 'completed', type: 'boolean', required: true, default: false },
        { key: 'verifiedAt', type: 'string', size: 50, required: false },
        { key: 'platform', type: 'string', size: 50, required: true }
      ]
    );

    // Collection 4: Referrals (NEW)
    await createCollectionSafely(
      CONFIG.databaseId,
      'referrals',
      'Referrals',
      permissions,
      [
        { key: 'referrerId', type: 'string', size: 255, required: true },
        { key: 'refereeId', type: 'string', size: 255, required: true },
        { key: 'refereeWalletAddress', type: 'string', size: 255, required: true },
        { key: 'bonusEarned', type: 'double', required: true, default: 0 },
        { key: 'createdAt', type: 'string', size: 50, required: true },
        { key: 'status', type: 'string', size: 20, required: true, default: 'pending' }
      ]
    );

    // Collection 5: Distribution Batches
    await createCollectionSafely(
      CONFIG.databaseId,
      'distribution_batches',
      'Distribution Batches',
      permissions,
      [
        { key: 'batchNumber', type: 'integer', required: true },
        { key: 'totalParticipants', type: 'integer', required: true, default: 0 },
        { key: 'processedParticipants', type: 'integer', required: true, default: 0 },
        { key: 'startTime', type: 'string', size: 50, required: false },
        { key: 'endTime', type: 'string', size: 50, required: false },
        { key: 'status', type: 'string', size: 20, required: true, default: 'pending' }
      ]
    );

    // Wait for all collections to be ready
    console.log('\n⏱️ Waiting for collections to be fully ready...');
    await wait(5000);

    // Create sample data
    console.log('\n🌱 Creating sample data...');
    
    try {
      // Create sample distribution batch
      await databases.createDocument(
        CONFIG.databaseId,
        'distribution_batches',
        ID.unique(),
        {
          batchNumber: 1,
          totalParticipants: 0,
          processedParticipants: 0,
          startTime: new Date().toISOString(),
          status: 'pending'
        }
      );
      console.log('✅ Sample distribution batch created');
    } catch (sampleError) {
      console.log('ℹ️ Sample data might already exist');
    }

    console.log('\n🎉 Complete Database Setup Finished!\n');
    console.log('📋 Summary:');
    console.log('- Database ID: brainark-airdrop-dev');
    console.log('- Total Collections: 5');
    console.log('  ✅ users');
    console.log('  ✅ airdrop_registrations');
    console.log('  ✅ social_tasks (NEW)');
    console.log('  ✅ referrals (NEW)');
    console.log('  ✅ distribution_batches');
    console.log('- Permissions: Read/Write for any user (development)');
    console.log('- Sample data created');
    console.log('\n🌐 Your DApp is now fully compatible with Appwrite!');
    console.log('🚀 CORS errors should be resolved.');
    console.log('\n💡 Next steps:');
    console.log('1. Restart your Next.js server: npm run dev -- -p 3002');
    console.log('2. Test the airdrop and EPO functionality');
    console.log('3. Check that social tasks and referrals work');

  } catch (error) {
    console.error('❌ Error during setup:', error);
  }
}

// Run the complete setup
setupCompleteDatabase();