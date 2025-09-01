#!/bin/bash

# Claude CLI Setup Guide
# =====================

# This script helps you set up and use Claude CLI for your project

echo "🤖 Claude CLI Setup Guide"
echo "========================="
echo ""

# Check if Claude CLI is installed
if ! command -v claude &> /dev/null; then
  echo "❌ Claude CLI is not installed. Installing now..."
  npm install -g @anthropic-ai/claude-code
else
  echo "✅ Claude CLI is already installed."
fi

# Check for Claude configuration
CONFIG_DIR="$HOME/.config/claude"
CONFIG_FILE="$CONFIG_DIR/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "⚙️ Creating Claude configuration directory..."
  mkdir -p "$CONFIG_DIR"
  
  echo "⚙️ Creating default configuration file..."
  cat > "$CONFIG_FILE" << EOL
{
  "api_key": "YOUR_ANTHROPIC_API_KEY_HERE",
  "model": "claude-3-opus-20240229",
  "default_max_tokens": 4000,
  "temperature": 0.7,
  "history_file": "$CONFIG_DIR/history.json",
  "editor": "code"
}
EOL
  
  echo "⚠️ Please edit $CONFIG_FILE and add your Anthropic API key."
  echo "📝 You can get an API key from: https://console.anthropic.com/account/keys"
else
  echo "✅ Claude configuration file exists at $CONFIG_FILE"
fi

# Instructions for use
echo ""
echo "🚀 Using Claude CLI:"
echo "-------------------"
echo "1. Navigate to your project directory: cd /home/brainark/brainark_besu_chain/brainark-airdrop-dapp"
echo "2. Run Claude with: claude"
echo ""
echo "Basic Commands:"
echo "- Ask a question: claude \"How do I optimize my React components?\""
echo "- Get help with a file: claude explain src/components/EPOSection.tsx"
echo "- Generate new code: claude create \"A utility function to format cryptocurrency amounts\""
echo ""
echo "For more commands and options, run: claude --help"
echo ""
echo "Happy coding with Claude! 🎉"
