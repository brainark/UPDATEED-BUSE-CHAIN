#!/bin/bash

# BrainArk Solana CLI Installation Script with Multiple Methods
# This script tries different methods to install Solana CLI

echo "🔧 Installing Solana CLI for BrainArk Bridge"
echo "============================================"

# Method 1: Try the official installer with different curl options
echo "📦 Method 1: Trying official installer with SSL fixes..."
curl --version
echo ""

# Try with different SSL options
echo "Attempting with --insecure flag (bypass SSL verification)..."
if curl --insecure -sSfL https://release.solana.com/v1.17.0/install | sh; then
    echo "✅ Solana CLI installed successfully via official installer (insecure)"
    exit 0
fi

echo "❌ Method 1 failed. Trying Method 2..."

# Method 2: Try with different TLS version
echo "📦 Method 2: Trying with TLS 1.2..."
if curl --tlsv1.2 -sSfL https://release.solana.com/v1.17.0/install | sh; then
    echo "✅ Solana CLI installed successfully via TLS 1.2"
    exit 0
fi

echo "❌ Method 2 failed. Trying Method 3..."

# Method 3: Try the latest version instead of specific version
echo "📦 Method 3: Trying latest version..."
if curl -sSfL https://release.solana.com/stable/install | sh; then
    echo "✅ Solana CLI installed successfully (latest version)"
    exit 0
fi

echo "❌ Method 3 failed. Trying Method 4..."

# Method 4: Manual download and install
echo "📦 Method 4: Manual download and installation..."

# Detect architecture
ARCH=$(uname -m)
OS=$(uname -s)

case "$OS" in
    Linux*)
        case "$ARCH" in
            x86_64)
                SOLANA_URL="https://github.com/solana-labs/solana/releases/download/v1.17.0/solana-release-x86_64-unknown-linux-gnu.tar.bz2"
                ;;
            aarch64)
                SOLANA_URL="https://github.com/solana-labs/solana/releases/download/v1.17.0/solana-release-aarch64-unknown-linux-gnu.tar.bz2"
                ;;
            *)
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
                ;;
        esac
        ;;
    Darwin*)
        SOLANA_URL="https://github.com/solana-labs/solana/releases/download/v1.17.0/solana-release-x86_64-apple-darwin.tar.bz2"
        ;;
    *)
        echo "❌ Unsupported OS: $OS"
        exit 1
        ;;
esac

echo "Downloading Solana CLI from: $SOLANA_URL"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Download with wget as fallback
if command -v wget &> /dev/null; then
    echo "Using wget to download..."
    if wget "$SOLANA_URL" -O solana-release.tar.bz2; then
        echo "✅ Downloaded successfully with wget"
    else
        echo "❌ wget download failed"
        exit 1
    fi
else
    echo "Using curl to download..."
    if curl -L "$SOLANA_URL" -o solana-release.tar.bz2; then
        echo "✅ Downloaded successfully with curl"
    else
        echo "❌ curl download failed"
        exit 1
    fi
fi

# Extract and install
echo "📦 Extracting Solana CLI..."
tar -xjf solana-release.tar.bz2

# Move to user's home directory
SOLANA_INSTALL_DIR="$HOME/.local/share/solana/install/active_release"
mkdir -p "$SOLANA_INSTALL_DIR"
cp -r solana-release/* "$SOLANA_INSTALL_DIR/"

# Add to PATH
echo "🔧 Adding Solana CLI to PATH..."
SOLANA_BIN_DIR="$SOLANA_INSTALL_DIR/bin"

# Add to bashrc
if ! grep -q "solana" "$HOME/.bashrc"; then
    echo "export PATH=\"$SOLANA_BIN_DIR:\$PATH\"" >> "$HOME/.bashrc"
fi

# Add to current session
export PATH="$SOLANA_BIN_DIR:$PATH"

# Cleanup
cd - > /dev/null
rm -rf "$TEMP_DIR"

# Verify installation
if command -v solana &> /dev/null; then
    echo "✅ Solana CLI installed successfully!"
    echo "Version: $(solana --version)"
    echo ""
    echo "🔧 To use Solana CLI in new terminal sessions, run:"
    echo "source ~/.bashrc"
    echo ""
    echo "Or add this to your shell profile:"
    echo "export PATH=\"$SOLANA_BIN_DIR:\$PATH\""
    exit 0
else
    echo "❌ Installation failed. Solana CLI not found in PATH."
    echo "Manual installation required."
    exit 1
fi