# WalletConnect Setup Guide

## Current Status
❌ **WalletConnect is currently disabled** to prevent WebSocket errors during development.
✅ **MetaMask connection works** for local development.

## The Error You're Seeing
```
Error: WebSocket connection closed abnormally with code: 3000 (Unauthorized: invalid key)
```

This happens because WalletConnect requires a valid Project ID from their cloud service.

## How to Fix This

### Step 1: Get a WalletConnect Project ID

1. Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
2. Sign up for a free account
3. Create a new project
4. Copy your Project ID (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 2: Update Environment Variables

Replace the empty value in `.env.local`:

```bash
# Replace this:
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=

# With your real Project ID:
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# And remove this line:
NEXT_PUBLIC_DISABLE_WALLETCONNECT=true
```

### Step 3: Restart the Development Server

```bash
npm run dev
```

## Current Workaround

For now, the app is configured to work with **MetaMask only** to avoid the WalletConnect errors. This means:

✅ **Working Features:**
- MetaMask connection
- Network switching
- All dapp functionality
- Airdrop and EPO features

❌ **Temporarily Disabled:**
- WalletConnect mobile wallets
- Other wallet providers that depend on WalletConnect

## Why This Happens

WalletConnect v2 requires:
1. A valid Project ID from their cloud service
2. Proper WebSocket connections
3. Valid authentication tokens

Without these, you get the WebSocket errors you're seeing.

## Production Deployment

For production deployment, you **must** get a real WalletConnect Project ID to support mobile wallets and other wallet providers.

## Alternative Solutions

If you don't want to use WalletConnect, you can:

1. **Use MetaMask only** (current setup)
2. **Add other injected wallet connectors** without WalletConnect
3. **Implement custom wallet connections** for specific wallets

## Testing the Fix

Once you have a real Project ID:

1. Update `.env.local` with the real Project ID
2. Remove the `NEXT_PUBLIC_DISABLE_WALLETCONNECT=true` line
3. Restart the dev server
4. The WebSocket errors should disappear
5. You'll have access to mobile wallets and other providers

## Support

If you need help:
- WalletConnect docs: https://docs.walletconnect.com/
- RainbowKit docs: https://www.rainbowkit.com/docs/introduction
- Wagmi docs: https://wagmi.sh/