// Mobile wallet connection utilities
import WalletConnectProvider from '@walletconnect/web3-provider';
import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Detect mobile device
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if user is on iOS
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Check if user is on Android
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// Mobile-optimized WalletConnect configuration
export const getMobileWalletConnectConfig = (rpcUrl, chainId, metadata, projectId) => {
  const mobile = isMobileDevice();
  const ios = isIOS();
  
  // For iOS, we need specific handling
  if (ios) {
    return {
      rpc: {
        [chainId]: rpcUrl,
      },
      chainId: chainId,
      bridge: "https://bridge.walletconnect.org",
      qrcode: true,
      qrcodeModalOptions: {
        mobileLinks: [
          "metamask",
          "trust",
          "rainbow",
          "coinbase",
          "argent",
          "imtoken",
          "safe"
        ],
        desktopLinks: []
      },
      infuraId: projectId,
      storageId: "walletconnect-mobile",
      clientMeta: {
        description: metadata.description,
        url: metadata.url,
        icons: metadata.icons,
        name: metadata.name,
      }
    };
  }
  
  // Default mobile config
  return {
    rpc: {
      [chainId]: rpcUrl,
    },
    chainId: chainId,
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
    qrcodeModalOptions: {
      mobileLinks: [
        "metamask",
        "trust",
        "rainbow",
        "coinbase",
        "argent",
        "imtoken",
        "pillar",
        "safe",
        "ledger"
      ],
      desktopLinks: [
        "metamask",
        "ledger",
        "tokenary",
        "wallet",
        "rainbow",
        "argent",
        "trust"
      ]
    },
    infuraId: projectId,
    storageId: "walletconnect",
    clientMeta: {
      description: metadata.description,
      url: metadata.url,
      icons: metadata.icons,
      name: metadata.name,
    }
  };
};

// Create mobile-optimized WalletConnect provider
export const createMobileWalletConnectProvider = async (rpcUrl, chainId, metadata, projectId) => {
  const mobile = isMobileDevice();
  const ios = isIOS();
  
  console.log(`Mobile device detected: ${mobile}, iOS: ${ios}`);
  
  // For mobile devices, especially iOS, use WalletConnect v1 for better compatibility
  if (mobile) {
    console.log("Creating mobile-optimized WalletConnect v1 provider");
    
    const config = getMobileWalletConnectConfig(rpcUrl, chainId, metadata, projectId);
    const provider = new WalletConnectProvider(config);
    
    // Add mobile-specific timeout
    const enablePromise = provider.enable();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Mobile WalletConnect timeout')), ios ? 30000 : 20000)
    );
    
    await Promise.race([enablePromise, timeoutPromise]);
    return { provider, version: "v1-mobile" };
  }
  
  // For desktop, try v2 first
  try {
    console.log("Creating desktop WalletConnect v2 provider");
    
    const provider = await EthereumProvider.init({
      projectId: projectId,
      chains: [chainId],
      rpcMap: {
        [chainId]: rpcUrl,
      },
      metadata: metadata,
      showQrModal: true,
      qrModalOptions: {
        themeMode: "dark",
        themeVariables: {
          '--wcm-z-index': '1000'
        }
      }
    });
    
    await provider.enable();
    return { provider, version: "v2-desktop" };
    
  } catch (v2Error) {
    console.log("Desktop v2 failed, falling back to v1:", v2Error.message);
    
    const config = getMobileWalletConnectConfig(rpcUrl, chainId, metadata, projectId);
    const provider = new WalletConnectProvider(config);
    
    await provider.enable();
    return { provider, version: "v1-desktop" };
  }
};

// Handle deep linking for mobile wallets
export const handleMobileDeepLink = (uri) => {
  const mobile = isMobileDevice();
  const ios = isIOS();
  const android = isAndroid();
  
  if (!mobile || !uri) return;
  
  // For iOS, try to open in MetaMask or Trust Wallet
  if (ios) {
    // Try MetaMask first
    const metamaskUrl = `metamask://wc?uri=${encodeURIComponent(uri)}`;
    window.location.href = metamaskUrl;
    
    // Fallback to Trust Wallet after a delay
    setTimeout(() => {
      const trustUrl = `trust://wc?uri=${encodeURIComponent(uri)}`;
      window.location.href = trustUrl;
    }, 1000);
  }
  
  // For Android
  if (android) {
    // Try intent-based opening
    const intent = `intent://wc?uri=${encodeURIComponent(uri)}#Intent;package=io.metamask;scheme=metamask;end`;
    window.location.href = intent;
  }
};