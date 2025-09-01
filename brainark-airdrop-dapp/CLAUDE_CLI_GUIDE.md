# Using Claude CLI with BrainArk DApp

## Setup Instructions

You've successfully installed Claude CLI! Follow these steps to start using it with your project:

1. **Set your API key**

   You need to get an API key from Anthropic. Visit https://console.anthropic.com/account/keys to create one.

   Then edit the configuration file:
   ```bash
   nano ~/.config/claude/config.json
   ```
   
   Replace `"YOUR_ANTHROPIC_API_KEY_HERE"` with your actual API key.

2. **Navigate to your project directory**

   ```bash
   cd /home/brainark/brainark_besu_chain/brainark-airdrop-dapp
   ```

3. **Start using Claude CLI**

   ```bash
   claude
   ```

## Example Commands

Here are some useful ways to use Claude CLI with your BrainArk DApp:

### Get help with your code

```bash
# Explain a complex component
claude explain src/components/EPOSection.tsx

# Review a contract integration
claude review src/utils/contracts.ts
```

### Generate new code

```bash
# Create a new utility function
claude create "A utility function that converts between BAK tokens and USD with proper formatting"

# Create a new component
claude create "A toast notification system for blockchain transactions" --format tsx
```

### Get project insights

```bash
# Ask about best practices
claude "What are the best practices for optimizing React components in a blockchain dApp?"

# Get recommendations for your codebase
claude "Review my EPOSection component and suggest improvements for mobile responsiveness"
```

### Customize your experience

You can customize Claude CLI by editing your config file:
- Change the model (e.g., claude-3-sonnet, claude-3-opus)
- Adjust temperature for more/less creative responses
- Set your preferred code editor

## Helpful Tips

1. **Be specific in your requests** - The more context and detail you provide, the better Claude can help you.

2. **Use file references** - Claude can understand your code better when you reference specific files.

3. **Try different models** - If you need more sophisticated help, try the opus model. For quicker responses, use sonnet.

4. **Save useful conversations** - Claude saves your conversation history by default, making it easy to refer back to previous discussions.

Happy coding with Claude! 🚀
