 1     const { ethers } = require("hardhat");
    2 
    3     async function main() {
    4       console.log("--- Verifying Private Keys ---");
    5 
    6       const privateKeys = {
    7         // Ethereum Mainnet Private Keys
    8         ETH_MAINNET_PRIVATE_KEY: "0x023e5cf0fd861ebd55487cfb54e95b427410454c64691692734524b3986590ba",
    9         USDT_ETHEREUM_PRIVATE_KEY: "0x861afdf2225271145ce840957ce60e5104d77b99de3fd42e15261fbdefebbf6c",
   10         USDC_ETHEREUM_PRIVATE_KEY: "0x6ade265b41c8ce72d261d0407a808973adf230b47407620b398fce78b7903861",
   11 
   12         // BSC Mainnet Private Keys
   13         BNB_BSC_PRIVATE_KEY: "0x0f23d5878670c9d0b418d866b9b271ce9ed023e9912edc6fb012875a2007dcc3",
   14         USDT_BSC_PRIVATE_KEY: "0x07d9335ae8b219145fed01dbea03be8772425c76e9707d7f2d5d8c4c4a5dda24",
   15         USDC_BSC_PRIVATE_KEY: "0x5fde0aa8ae9223c544b114b4525a6e86ebec534606a6995da682d12c9086b508",
   16 
   17         // Polygon Mainnet Private Keys
   18         MATIC_POLYGON_PRIVATE_KEY: "0x70f97dcc5a4a04246aabb35faa4adbb6b594a649217ea90ccd6fd00ffb29c635",
   19         USDT_POLYGON_PRIVATE_KEY: "0x19dd4e6666e9114148cca67e3f4b37f30bf2f24960fceabe6c25393a54310bf5",
   20         USDC_POLYGON_PRIVATE_KEY: "0x7765867c9c5cd67b2f2e88d9f664824b92c0169fe59e779335d2a356a78e5775",
   21 
   22         // BrainArk Network Private Key (for BAK distribution)
   23         BAK_BRAINARK_PRIVATE_KEY: "0xe655d659cab1a42eddc7eefc2f628a864b41c01a57976b058dbe62d090667d40",
   24       };
   25 
   26       for (const [keyName, privateKey] of Object.entries(privateKeys)) {
   27         try {
   28           const wallet = new ethers.Wallet(privateKey);
   29           console.log(`${keyName}:`);
   30           console.log(`  Private Key: ${privateKey}`);
   31           console.log(`  Derived Address: ${wallet.address}`);
   32           console.log("------------------------------------");
   33         } catch (error) {
   34           console.error(`Error processing ${keyName}: ${error.message}`);
   35         }
   36       }
   37     }
   38 
   39     main()
   40       .then(() => process.exit(0))
   41       .catch((error) => {
   42         console.error(error);
   43         process.exit(1);
   44       });
