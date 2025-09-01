import { Anthropic } from '@anthropic-ai/sdk';

// Initialize the Anthropic client with your API key
const anthropic = new Anthropic({
  apiKey: 'sk-ant-api03-fe129f4c-5ebd-4850-8be9-2fac4c1be37e',
});

// Function to ask Claude a question
async function askClaude(question) {
  try {
    console.log(`🤖 Asking Claude: "${question}"`);
    console.log('⏳ Waiting for response...');
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', // Using available model
      // For Claude 4 when available, use: 'claude-3-5-sonnet-20240620'
      max_tokens: 1000,
      messages: [{ role: 'user', content: question }]
    });
    
    console.log('\n✅ Claude responded:');
    console.log('-------------------');
    console.log(response.content[0].text);
    console.log('-------------------\n');
    
    return response.content[0].text;
  } catch (error) {
    console.error('❌ Error communicating with Claude:', error.message);
    if (error.status === 401) {
      console.error('API key may be invalid or expired.');
    } else if (error.status === 429) {
      console.error('Rate limit exceeded. Try again later.');
    }
    return null;
  }
}

// Example usage
async function main() {
  // You can replace this with any question
  const answer = await askClaude("What are the main components typically found in a Web3 dApp?");
  
  // If you want to ask more questions, you can add them here
  // await askClaude("Another question");
}

// Run the main function
main().catch(console.error);
