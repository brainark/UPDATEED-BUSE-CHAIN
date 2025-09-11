#!/usr/bin/env node

/**
 * Twitter Bearer Token Generator
 * Generates an app-only Bearer token using Client ID and Secret
 */

const https = require('https');

const CLIENT_ID = 'lrxRR6HatGtHwqZYXIjJidKLT';
const CLIENT_SECRET = 'dqlZFlGAn9RqiruegPoG9Pn3UzBOiuF9lwebnQxIQOTJCV3fTS';

async function getBearerToken() {
  console.log('🔑 Generating Twitter Bearer Token...\n');
  
  try {
    // Create base64 encoded credentials
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    // Prepare POST data
    const postData = 'grant_type=client_credentials';
    
    const options = {
      hostname: 'api.twitter.com',
      port: 443,
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Content-Length': postData.length
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.access_token) {
              console.log('✅ Bearer Token Generated Successfully!\n');
              console.log('📋 Your Bearer Token:');
              console.log(`${response.access_token}\n`);
              
              console.log('🔧 Add this to your .env file:');
              console.log(`TWITTER_BEARER_TOKEN=${response.access_token}\n`);
              
              console.log('📝 Token Details:');
              console.log(`- Type: ${response.token_type}`);
              console.log('- Scope: App-only authentication');
              console.log('- Expires: Never (unless revoked)\n');
              
              resolve(response.access_token);
            } else {
              console.error('❌ Error response:', response);
              reject(new Error(response.error || 'Failed to get token'));
            }
          } catch (parseError) {
            console.error('❌ Failed to parse response:', data);
            reject(parseError);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Request failed:', error);
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
    
  } catch (error) {
    console.error('❌ Error generating Bearer token:', error.message);
    throw error;
  }
}

// Alternative method using curl command
function showCurlMethod() {
  console.log('\n📱 Alternative: Manual curl command:');
  console.log('Copy and run this command in your terminal:\n');
  
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  console.log(`curl -X POST \\
  'https://api.twitter.com/oauth2/token' \\
  -H 'Authorization: Basic ${credentials}' \\
  -H 'Content-Type: application/x-www-form-urlencoded;charset=UTF-8' \\
  -d 'grant_type=client_credentials'\n`);
}

// Run the Bearer token generation
if (require.main === module) {
  getBearerToken()
    .then(() => {
      console.log('🎉 Token generation completed!');
      showCurlMethod();
    })
    .catch((error) => {
      console.error('💥 Token generation failed:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Verify your Client ID and Secret are correct');
      console.log('2. Check that your Twitter app has the right permissions');
      console.log('3. Ensure your app is not suspended');
      console.log('\nTrying manual curl method...\n');
      showCurlMethod();
    });
}

module.exports = { getBearerToken };