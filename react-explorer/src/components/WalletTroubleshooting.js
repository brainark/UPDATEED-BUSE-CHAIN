import React, { useState, useEffect } from 'react';
import { cspHelpers } from '../utils/security';

const WalletTroubleshooting = () => {
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    const checkWallets = () => {
      const info = {
        hasEthereum: !!window.ethereum,
        hasMultipleProviders: !!(window.ethereum && window.ethereum.providers),
        providers: [],
        isMetaMask: !!(window.ethereum && window.ethereum.isMetaMask),
        isPhantom: !!(window.ethereum && window.ethereum.isPhantom),
      };

      if (window.ethereum && window.ethereum.providers) {
        info.providers = window.ethereum.providers.map(provider => ({
          isMetaMask: !!provider.isMetaMask,
          isPhantom: !!provider.isPhantom,
          isCoinbaseWallet: !!provider.isCoinbaseWallet,
          isRabby: !!provider.isRabby,
        }));
      }

      setWalletInfo(info);
    };

    checkWallets();
  }, []);

  const SecureExternalLink = ({ href, children, ...props }) => {
    const isAllowed = cspHelpers.isAllowedExternalUrl(href);
    
    if (!isAllowed) {
      return <span className="disabled-link">{children}</span>;
    }
    
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer nofollow"
        {...props}
      >
        {children}
      </a>
    );
  };

  if (!walletInfo) return null;

  return (
    <div className="section">
      <h2>🔧 Wallet Troubleshooting</h2>
      
      <div className="troubleshooting-info">
        <h3>Detected Wallets:</h3>
        <ul>
          <li>Ethereum Provider: {walletInfo.hasEthereum ? '✅ Yes' : '❌ No'}</li>
          <li>Multiple Providers: {walletInfo.hasMultipleProviders ? '⚠️ Yes (May cause conflicts)' : '✅ No'}</li>
          <li>MetaMask: {walletInfo.isMetaMask ? '✅ Detected' : '❌ Not detected'}</li>
          <li>Phantom: {walletInfo.isPhantom ? '⚠️ Detected (May conflict)' : '✅ Not detected'}</li>
        </ul>

        {walletInfo.hasMultipleProviders && (
          <div className="warning-box">
            <h4>⚠️ Multiple Wallet Extensions Detected</h4>
            <p>You have multiple wallet extensions installed which may cause conflicts:</p>
            <ul>
              {walletInfo.providers.map((provider, index) => (
                <li key={index}>
                  {provider.isMetaMask && 'MetaMask'}
                  {provider.isPhantom && 'Phantom'}
                  {provider.isCoinbaseWallet && 'Coinbase Wallet'}
                  {provider.isRabby && 'Rabby'}
                  {!provider.isMetaMask && !provider.isPhantom && !provider.isCoinbaseWallet && !provider.isRabby && 'Unknown Wallet'}
                </li>
              ))}
            </ul>
            
            <div className="troubleshooting-steps">
              <h4>🛠️ How to Fix:</h4>
              <ol>
                <li><strong>Disable other wallets:</strong> Go to your browser extensions and disable Phantom, Coinbase Wallet, or other wallet extensions temporarily</li>
                <li><strong>Refresh the page:</strong> After disabling other wallets, refresh this page</li>
                <li><strong>Try connecting again:</strong> Click "Connect MetaMask" button</li>
                <li><strong>Alternative:</strong> Use a different browser profile with only MetaMask installed</li>
              </ol>
            </div>
          </div>
        )}

        {!walletInfo.hasEthereum && (
          <div className="error-box">
            <h4>❌ No Wallet Detected</h4>
            <p>
              Please install MetaMask extension from{' '}
              <SecureExternalLink href="https://metamask.io">
                metamask.io
              </SecureExternalLink>
            </p>
          </div>
        )}

        <div className="security-notice">
          <h4>🔒 Security Notice</h4>
          <ul>
            <li>Only download MetaMask from the official website</li>
            <li>Never share your seed phrase or private keys</li>
            <li>Always verify URLs before entering sensitive information</li>
            <li>Be cautious of phishing attempts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletTroubleshooting;