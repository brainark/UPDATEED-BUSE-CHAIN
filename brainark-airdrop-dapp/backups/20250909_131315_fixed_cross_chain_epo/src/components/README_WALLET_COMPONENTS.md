# BrainArk Wallet Connection Components

This directory contains multiple wallet connection components for different use cases. All components support both production and local development networks.

## Components Overview

### 1. `AutoWalletConnection.tsx` (Original - Fixed)
**Use Case**: Simple, automatic wallet connection with environment detection
- ✅ Auto-detects local vs production environment
- ✅ Fixed pending request issues
- ✅ Compact UI suitable for headers/navbars
- ✅ Automatic network switching

```tsx
import AutoWalletConnection from './components/AutoWalletConnection'

<AutoWalletConnection 
  onConnectionChange={(isConnected, address, isCorrectNetwork) => {
    console.log('Connection status:', { isConnected, address, isCorrectNetwork })
  }}
/>
```

### 2. `AutoWalletConnection_NetworkSwitch.tsx` (Enhanced)
**Use Case**: Full-featured wallet connection with manual network switching
- ✅ Manual network type selection (Production/Local)
- ✅ Network connectivity testing
- ✅ Detailed network information display
- ✅ Advanced error handling
- ✅ Full-width component with detailed UI

```tsx
import AutoWalletConnectionNetworkSwitch from './components/AutoWalletConnection_NetworkSwitch'

<AutoWalletConnectionNetworkSwitch 
  defaultNetworkType="production" // or "local"
  showNetworkSwitch={true}
  onConnectionChange={(isConnected, address, isCorrectNetwork, networkType) => {
    console.log('Connection status:', { isConnected, address, isCorrectNetwork, networkType })
  }}
/>
```

### 3. `CompactWalletConnection.tsx` (Minimal)
**Use Case**: Compact wallet connection for tight spaces
- ✅ Minimal UI footprint
- ✅ Dropdown network selector
- ✅ Perfect for headers, sidebars, or inline use
- ✅ Customizable styling

```tsx
import CompactWalletConnection from './components/CompactWalletConnection'

<CompactWalletConnection 
  defaultNetwork="production"
  showNetworkSwitch={true}
  className="my-custom-class"
  onConnectionChange={(isConnected, address, networkType) => {
    console.log('Connection status:', { isConnected, address, networkType })
  }}
/>
```

### 4. `AutoWalletConnection_Debug.tsx` (Development)
**Use Case**: Development and debugging with detailed information
- ✅ Extensive debug information
- ✅ MetaMask detection details
- ✅ Network connectivity status
- ✅ Full error logging
- ✅ Help sections and troubleshooting

```tsx
import AutoWalletConnectionDebug from './components/AutoWalletConnection_Debug'

<AutoWalletConnectionDebug 
  onConnectionChange={(isConnected, address, isCorrectNetwork) => {
    console.log('Debug connection status:', { isConnected, address, isCorrectNetwork })
  }}
/>
```

## Network Configurations

All components support these networks:

### Production Network
```javascript
{
  chainId: 424242,
  chainIdHex: '0x67932',
  chainName: 'BrainArk Besu Network',
  nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
  rpcUrls: ['https://rpc.brainark.online'],
  blockExplorerUrls: ['https://explorer.brainark.online']
}
```

### Local Development Network
```javascript
{
  chainId: 424242,
  chainIdHex: '0x67932',
  chainName: 'BrainArk Besu Network (Local)',
  nativeCurrency: { name: 'BrainArk', symbol: 'BAK', decimals: 18 },
  rpcUrls: ['http://localhost:8545'],
  blockExplorerUrls: ['http://localhost:3000']
}
```

## Usage Recommendations

### For Production Apps
Use `AutoWalletConnection.tsx` or `CompactWalletConnection.tsx`:
```tsx
// Simple header integration
<header className="flex justify-between items-center p-4">
  <h1>BrainArk DApp</h1>
  <CompactWalletConnection defaultNetwork="production" />
</header>

// Full-width connection section
<AutoWalletConnection onConnectionChange={handleConnectionChange} />
```

### For Development/Testing
Use `AutoWalletConnection_NetworkSwitch.tsx` or `AutoWalletConnection_Debug.tsx`:
```tsx
// Development with network switching
<AutoWalletConnectionNetworkSwitch 
  defaultNetworkType="local"
  showNetworkSwitch={true}
/>

// Debug mode with detailed info
<AutoWalletConnectionDebug />
```

### For Tight Spaces
Use `CompactWalletConnection.tsx`:
```tsx
// Sidebar integration
<aside className="w-64 p-4">
  <CompactWalletConnection 
    showNetworkSwitch={false}
    className="w-full"
  />
</aside>

// Inline with other elements
<div className="flex items-center gap-4">
  <span>Welcome to BrainArk</span>
  <CompactWalletConnection />
</div>
```

## Error Handling

All components handle these common MetaMask errors:

- **4001**: User rejected request
- **4902**: Network not found (auto-adds network)
- **-32002**: Request already pending (prevents duplicate requests)
- **Connection errors**: Network connectivity issues

## Features Comparison

| Feature | AutoWallet | NetworkSwitch | Compact | Debug |
|---------|------------|---------------|---------|-------|
| Auto Environment Detection | ✅ | ✅ | ✅ | ✅ |
| Manual Network Switch | ❌ | ✅ | ✅ | ✅ |
| Compact UI | ✅ | ❌ | ✅ | ❌ |
| Debug Information | ❌ | ❌ | ❌ | ✅ |
| Network Testing | ❌ | ✅ | ❌ | ✅ |
| Custom Styling | Limited | Limited | ✅ | Limited |
| Production Ready | ✅ | ✅ | ✅ | ❌ |

## Common Issues & Solutions

### Issue: "Request already pending"
**Solution**: Components now prevent duplicate requests and show appropriate messages.

### Issue: Wrong network detected
**Solution**: All components auto-detect and prompt to add the correct BrainArk network.

### Issue: MetaMask not responding
**Solution**: Components include timeout handling and clear error messages.

### Issue: Multiple wallet providers
**Solution**: Components specifically detect and use MetaMask provider when multiple wallets are installed.

## Integration Examples

### React App Integration
```tsx
import { useState } from 'react'
import CompactWalletConnection from './components/CompactWalletConnection'

function App() {
  const [walletInfo, setWalletInfo] = useState({
    isConnected: false,
    address: '',
    networkType: 'production'
  })

  return (
    <div className="app">
      <header>
        <CompactWalletConnection 
          onConnectionChange={(isConnected, address, networkType) => {
            setWalletInfo({ isConnected, address, networkType })
          }}
        />
      </header>
      
      <main>
        {walletInfo.isConnected ? (
          <p>Connected: {walletInfo.address} on {walletInfo.networkType}</p>
        ) : (
          <p>Please connect your wallet</p>
        )}
      </main>
    </div>
  )
}
```

### Next.js Integration
```tsx
import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues
const WalletConnection = dynamic(
  () => import('./components/CompactWalletConnection'),
  { ssr: false }
)

export default function Layout({ children }) {
  return (
    <div>
      <nav>
        <WalletConnection defaultNetwork="production" />
      </nav>
      {children}
    </div>
  )
}
```

## Best Practices

1. **Choose the right component** for your use case
2. **Handle connection state** in your app's state management
3. **Test with both networks** during development
4. **Provide fallbacks** for users without MetaMask
5. **Use environment detection** to default to appropriate networks
6. **Handle errors gracefully** with user-friendly messages

## Troubleshooting

If you encounter issues:

1. Check browser console for detailed error logs
2. Ensure MetaMask is installed and unlocked
3. Verify your Besu blockchain is running (for local development)
4. Clear MetaMask's activity tab if requests are stuck
5. Refresh the page if MetaMask becomes unresponsive

For development issues, use the Debug component to get detailed information about the connection state and MetaMask detection.