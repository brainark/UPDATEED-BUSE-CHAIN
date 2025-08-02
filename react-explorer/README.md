# BrainArk Blockchain Explorer - React Version

A React-based blockchain explorer for the BrainArk network with a warm white theme.

## Features

- **Wallet Integration**: Connect with MetaMask and WalletConnect
- **Network Management**: Automatic BrainArk network detection and switching
- **Transaction Explorer**: Search and view transaction details
- **Block Explorer**: Search and view block information
- **Live Updates**: Real-time display of latest blocks and transactions
- **Sync Status**: Monitor node synchronization status
- **Warm White Theme**: Clean, professional design with warm white color scheme

## Installation

1. Navigate to the react-explorer directory:
   ```bash
   cd react-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Wallet Connection
- Click "Connect MetaMask" to connect your MetaMask wallet
- Click "Connect WalletConnect" for WalletConnect integration
- The app will automatically prompt to add/switch to the BrainArk network

### Exploring Transactions
- Enter a transaction hash in the transaction input field
- Click "Get Transaction" to view transaction details

### Exploring Blocks
- Enter a block number or "latest" in the block input field
- Click "Get Block" to view block information

### Live Data
- Latest blocks and transactions are automatically updated every 15 seconds
- Sync status is monitored and displayed when the node is syncing

## Configuration

The app is configured for the BrainArk network:
- **RPC URL**: https://rpc.brainark.online
- **Chain ID**: 424242 (0x67932)
- **Currency**: BAK
- **Explorer**: https://brainarkblock-explorer-7kf3.vercel.app

## Design Features

### Warm White Theme
- **Background**: Same beautiful background image as the original
- **Overlay**: Warm white semi-transparent overlay for better readability
- **Colors**: 
  - Primary: Warm browns (#8B4513, #D2691E, #CD853F)
  - Background: Warm white (#FFF8F0)
  - Text: Dark brown (#2c2c2c)
- **Interactive Elements**: Smooth hover effects and transitions
- **Responsive**: Mobile-friendly design

### Preserved Functionality
- All original features maintained
- Same Web3 integration
- Identical network configuration
- Same data fetching intervals
- Compatible wallet connections

## Build for Production

To create a production build:

```bash
npm run build
```

The build folder will contain the optimized production files ready for deployment.

## Browser Compatibility

- Modern browsers with ES6+ support
- MetaMask extension required for wallet functionality
- WalletConnect support for mobile wallets