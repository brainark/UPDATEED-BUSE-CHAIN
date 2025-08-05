#!/bin/bash

echo "🧠 Creating BrainArk Blockchain Setup"
echo "====================================="

# Create directory structure
echo "📁 Creating directories..."
mkdir -p config
mkdir -p validators/{node1,node2,node3,node4}/{key,data}

# Create corrected genesis.json
echo "⚙️ Creating genesis.json..."
cat > config/genesis.json << 'EOF'
{
  "config": {
    "chainId": 424242,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "ibft2": {
      "blockperiodseconds": 2,
      "epochlength": 30000,
      "requesttimeoutseconds": 5
    }
  },
  "nonce": "0x0",
  "timestamp": "0x64acfc00",
  "gasLimit": "0x047868C0",
  "difficulty": "0x1",
  "mixHash": "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "alloc": {
    "0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169": {
      "balance": "1000000000000000000000000000"
    }
  },
  "extraData": "0xf87ea00000000000000000000000000000000000000000000000000000000000000000f854942db87dc8a9bcaa102b2f091b23df4f5a59e6ba98947694ca703abf165d455097a8927af0cc9c52a1b59445556433287d5c49f440e72ac3f080a34710d8d2948b1a5cfb423736209a2fea79e8120e763bf63b23808400000000c0"
}
EOF

# Create validator private keys
echo "🔑 Creating validator keys..."

# Node 1 key (corresponds to address in extraData)
cat > validators/node1/key/key << 'EOF'
0xed1d085e63d0ec450950c800fcb47c6a3df380568c8222aa16ef37105f8206dc
EOF

# Node 2 key
cat > validators/node2/key/key << 'EOF'
0x25104135fb883d7c55baade47bd9387fa25da7514e317741a2094d5a8f7c1d3687341394b01ba4fc4f70f8a3a402e77057cced8938576db228000fe1ce4916cc
EOF

# Node 3 key
cat > validators/node3/key/key << 'EOF'
0x5d8af81b023d33c0d1ab4193c716b27ffcfe63eb26c78c2646e1464b1f1afd053434b2084959e431992e4a785df490d250b89a2eea7be6439816f8e61b5f59e0
EOF

# Node 4 key
cat > validators/node4/key/key << 'EOF'
0x4a1ce53b92b66df0d8d820b44dfd3b4ba2da791a6ff18c44385f6779157b18ae4ab7a471242dee79a84faef3411a2f48e329cca0c75a4de375fd65045b50408f
EOF

# Create static-nodes.json for peer discovery
echo "🌐 Creating static-nodes.json..."
cat > config/static-nodes.json << 'EOF'
[
  "enode://01a3081d830bd323947de0a3009dd245c789ed1d78602850b1f5146949cd90215f25bf6a8f76c27aebbbfb91c447b77b7d166e7404ad05bef4749cdb8912b5a6@172.20.0.10:30303",
  "enode://25104135fb883d7c55baade47bd9387fa25da7514e317741a2094d5a8f7c1d3687341394b01ba4fc4f70f8a3a402e77057cced8938576db228000fe1ce4916cc@172.20.0.11:30303",
  "enode://5d8af81b023d33c0d1ab4193c716b27ffcfe63eb26c78c2646e1464b1f1afd053434b2084959e431992e4a785df490d250b89a2eea7be6439816f8e61b5f59e0@172.20.0.12:30303",
  "enode://4a1ce53b92b66df0d8d820b44dfd3b4ba2da791a6ff18c44385f6779157b18ae4ab7a471242dee79a84faef3411a2f48e329cca0c75a4de375fd65045b50408f@172.20.0.13:30303"
]
EOF

# Create permissions config
echo "🔐 Creating permissions config..."
cat > config/permissions_config.toml << 'EOF'
nodes-allowlist=[
  "enode://01a3081d830bd323947de0a3009dd245c789ed1d78602850b1f5146949cd90215f25bf6a8f76c27aebbbfb91c447b77b7d166e7404ad05bef4749cdb8912b5a6@172.20.0.10:30303",
  "enode://25104135fb883d7c55baade47bd9387fa25da7514e317741a2094d5a8f7c1d3687341394b01ba4fc4f70f8a3a402e77057cced8938576db228000fe1ce4916cc@172.20.0.11:30303",
  "enode://5d8af81b023d33c0d1ab4193c716b27ffcfe63eb26c78c2646e1464b1f1afd053434b2084959e431992e4a785df490d250b89a2eea7be6439816f8e61b5f59e0@172.20.0.12:30303",
  "enode://4a1ce53b92b66df0d8d820b44dfd3b4ba2da791a6ff18c44385f6779157b18ae4ab7a471242dee79a84faef3411a2f48e329cca0c75a4de375fd65045b50408f@172.20.0.13:30303"
]

accounts-allowlist=["0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169"]
EOF

# Set proper permissions
echo "🔒 Setting permissions..."
chmod 644 validators/*/key/key
chmod -R 755 validators/
chmod 644 config/*

echo ""
echo "✅ Blockchain setup files created!"
echo ""
echo "📋 Summary of fixes applied:"
echo "1. ✅ Fixed genesis.json structure (removed wrapper, added required fields)"
echo "2. ✅ Added missing extraData with validator addresses"
echo "3. ✅ Created validator private keys"
echo "4. ✅ Added static-nodes.json for peer discovery"
echo "5. ✅ Added permissions configuration"
echo "6. ✅ Set proper file permissions"
echo ""
echo "🚀 Ready to start blockchain with:"
echo "docker-compose -f docker-compose.blockchain.yml up -d"