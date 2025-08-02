// Use your live RPC endpoint (update to your secure URL)
const RPC_URL = "https://rpc.brainark.online";
const CHAIN_ID = "0x6799"; // 0x6799 = 26521 (replace with your actual chainId in hex)
const CHAIN_NAME = "BrainArk";
const RPCS = { 26521: RPC_URL };
const EXPLORER_URL = "https://explorer.brainark.online"; // Update if you have a custom explorer

let web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
let currentProvider = null;
let walletType = null;

function setWeb3Provider(provider, type) {
  web3 = new Web3(provider);
  currentProvider = provider;
  walletType = type;
}

async function addBrainArkNetwork() {
  if (!window.ethereum) return;
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: CHAIN_ID,
        chainName: CHAIN_NAME,
        rpcUrls: [RPC_URL],
        nativeCurrency: { name: "BAK", symbol: "BAK", decimals: 18 },
        blockExplorerUrls: [EXPLORER_URL],
      }],
    });
  } catch (err) {
    alert("Failed to add BrainArk network: " + err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // MetaMask connect
  const connectBtn = document.getElementById("connectBtn");
  const disconnectBtn = document.getElementById("disconnectBtn");
  const connectWCBtn = document.getElementById("connectWCBtn");
  const walletAddress = document.getElementById("walletAddress");

  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      if (window.ethereum) {
        try {
          // Prompt to add/switch to BrainArk network
          await addBrainArkNetwork();
          await window.ethereum.request({ method: "eth_requestAccounts" });
          setWeb3Provider(window.ethereum, "metamask");
          const [account] = await web3.eth.getAccounts();
          walletAddress.innerText = `Connected: ${account}`;
        } catch (err) {
          alert("MetaMask connection failed: " + err.message);
        }
      } else {
        alert("MetaMask not detected.");
      }
    });
  }

  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", () => {
      if (walletType === "walletconnect" && currentProvider) {
        currentProvider.disconnect();
      }
      walletAddress.innerText = "Disconnected";
      setWeb3Provider(new Web3.providers.HttpProvider(RPC_URL), null);
    });
  }

  // WalletConnect support
  if (connectWCBtn) {
    connectWCBtn.addEventListener("click", async () => {
      const provider = new WalletConnectProvider.default({ rpc: RPCS, chainId: 26521 });
      await provider.enable();
      setWeb3Provider(provider, "walletconnect");
      const [account] = await web3.eth.getAccounts();
      walletAddress.innerText = `WC Connected: ${account}`;
    });
  }

  // Fetch transaction
  const getTransactionBtn = document.getElementById("getTransactionBtn");
  if (getTransactionBtn) {
    getTransactionBtn.addEventListener("click", async () => {
      const hash = document.getElementById("txHash").value.trim();
      if (!hash) return;
      try {
        const tx = await web3.eth.getTransaction(hash);
        document.getElementById("transactionResult").innerText = JSON.stringify(tx, null, 2);
      } catch {
        document.getElementById("transactionResult").innerText = "Transaction not found.";
      }
    });
  }

  // Fetch block
  const getBlockBtn = document.getElementById("getBlockBtn");
  if (getBlockBtn) {
    getBlockBtn.addEventListener("click", async () => {
      const id = document.getElementById("blockInput").value.trim() || "latest";
      try {
        const block = await web3.eth.getBlock(id, true);
        document.getElementById("blockResult").innerText = JSON.stringify(block, null, 2);
      } catch {
        document.getElementById("blockResult").innerText = "Block not found.";
      }
    });
  }
});