import { Chain } from 'wagmi/chains';

// Define BrainArk chain configuration
export const brainarkChain: Chain = {
  id: 424242,
  name: 'BrainArk Network',
  nativeCurrency: {
    name: 'BAK',
    symbol: 'BAK',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.brainark.online'],
      webSocket: ['wss://rpc.brainark.online'],
    },
    public: {
      http: ['https://rpc.brainark.online'],
      webSocket: ['wss://rpc.brainark.online'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BrainArk Explorer',
      url: 'https://explorer.brainark.online',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1,
    },
  },
  testnet: false,
};
