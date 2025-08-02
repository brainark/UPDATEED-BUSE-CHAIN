# 📘 Project Best Practices

## 1. Project Purpose
BrainArk Besu Chain is a fully operational private Ethereum blockchain network built with Hyperledger Besu, featuring IBFT 2.0 consensus mechanism. The project includes a complete blockchain infrastructure with 4 validator nodes, multiple block explorers (React-based and vanilla JS), monitoring stack, and deployment automation. It serves as a production-ready private blockchain solution with comprehensive tooling for development, testing, and operations.

## 2. Project Structure

### Core Architecture
- **`config/`** - Blockchain configuration files (genesis.json, static-nodes.json)
- **`validators/`** - Individual validator node data and private keys (node1-4)
- **`docker/`** - Docker Compose configurations for different services
- **`react-explorer/`** - Modern React-based blockchain explorer with Web3 integration
- **`brainarkblock-explorer/`** - Lightweight vanilla JS explorer for basic functionality
- **`monitoring/`** - Prometheus, Grafana, and Loki configurations for observability

### Service Separation
- **Blockchain Layer**: 4 IBFT validator nodes with fixed IP addressing (172.20.0.10-13)
- **Explorer Layer**: Dual explorer approach (React for advanced features, vanilla JS for simplicity)
- **Monitoring Layer**: Separate observability stack with metrics and logging
- **Deployment Layer**: Multiple deployment strategies (local, VPS, Vercel hybrid)

## 3. Test Strategy

### Framework Approach
- **React Testing**: Uses Create React App's built-in Jest testing framework
- **Manual Testing**: Comprehensive RPC endpoint testing via curl commands
- **Integration Testing**: Docker health checks for all services
- **Network Testing**: Peer connectivity verification and sync status monitoring

### Testing Organization
- React tests located in `react-explorer/src/` following CRA conventions
- Manual test scripts provided as curl commands in documentation
- Health checks integrated into Docker Compose configurations
- Network verification scripts for validator connectivity

### Testing Philosophy
- **Unit Tests**: Component-level testing for React explorer
- **Integration Tests**: End-to-end blockchain network functionality
- **Manual Verification**: RPC calls, balance checks, transaction testing
- **Continuous Monitoring**: Real-time health checks and metrics collection

## 4. Code Style

### JavaScript/React Conventions
- **ES6+ Features**: Arrow functions, async/await, destructuring, template literals
- **React Hooks**: Functional components with useState, useEffect, useCallback
- **Error Handling**: Comprehensive try-catch blocks with user-friendly error messages
- **Security**: Input validation, XSS protection, rate limiting, secure error handling

### Naming Conventions
- **Files**: kebab-case for directories (`react-explorer`), PascalCase for React components
- **Variables**: camelCase for JavaScript variables and functions
- **Constants**: UPPER_SNAKE_CASE for configuration constants
- **Docker Services**: kebab-case with descriptive names (`besu-node1`, `brainark-explorer`)

### Documentation Standards
- **Inline Comments**: Explain complex blockchain interactions and security measures
- **JSDoc**: Document component props and function parameters
- **README Files**: Comprehensive setup and usage instructions
- **Deployment Guides**: Step-by-step deployment documentation

### Error Handling Patterns
- **Graceful Degradation**: Fallback to read-only mode when wallet not connected
- **User-Friendly Messages**: Clear error messages for common blockchain issues
- **Logging**: Structured error logging with context information
- **Rate Limiting**: Prevent abuse of RPC endpoints and wallet connections

## 5. Common Patterns

### Blockchain Integration
- **Web3 Provider Management**: Support for MetaMask, WalletConnect with conflict detection
- **Network Switching**: Automatic network addition and switching for custom chains
- **Transaction Handling**: Signed transactions with proper nonce and gas management
- **Real-time Updates**: Polling-based updates for block data and network status

### Docker Patterns
- **Service Isolation**: Separate containers for each validator node and service
- **Volume Management**: Persistent storage for blockchain data and configuration
- **Network Configuration**: Custom bridge networks with static IP assignment
- **Health Checks**: Built-in health monitoring for all critical services

### Configuration Management
- **Environment-based Config**: Separate configurations for development and production
- **Centralized Constants**: Single source of truth for network parameters
- **Secure Defaults**: Security-first configuration with proper CORS and validation

### Security Patterns
- **Input Validation**: Comprehensive validation for all user inputs
- **XSS Protection**: DOMPurify integration for safe HTML rendering
- **Rate Limiting**: Request throttling to prevent abuse
- **Secure Error Handling**: Avoid exposing sensitive information in error messages

## 6. Do's and Don'ts

### ✅ Do's
- **Always validate user inputs** before processing blockchain transactions
- **Use static IP addresses** for validator nodes to ensure reliable connectivity
- **Implement comprehensive error handling** with user-friendly messages
- **Follow the bootnode pattern** for peer discovery in multi-node setups
- **Use health checks** in Docker Compose for service reliability
- **Implement rate limiting** for all external-facing endpoints
- **Keep private keys secure** and never commit them to version control
- **Use proper gas estimation** for all transactions
- **Implement graceful degradation** when services are unavailable
- **Document all configuration changes** and deployment procedures

### ❌ Don'ts
- **Don't hardcode private keys** in source code or configuration files
- **Don't ignore Docker health check failures** - investigate and fix root causes
- **Don't use default passwords** or weak authentication mechanisms
- **Don't expose RPC endpoints** without proper CORS and security headers
- **Don't skip input validation** even for internal API calls
- **Don't use synchronous operations** for blockchain interactions
- **Don't ignore network connectivity issues** between validator nodes
- **Don't deploy without SSL/TLS** in production environments
- **Don't mix development and production configurations** in the same files
- **Don't forget to backup validator keys** before making changes

## 7. Tools & Dependencies

### Core Blockchain Stack
- **Hyperledger Besu 23.4.0**: Ethereum client with IBFT 2.0 consensus
- **Docker & Docker Compose**: Containerization and orchestration
- **Web3.js 1.10.0**: Ethereum JavaScript API for blockchain interactions

### Frontend Technologies
- **React 18.2.0**: Modern UI framework with hooks and functional components
- **Create React App**: Build tooling and development server
- **Chart.js & Recharts**: Data visualization for blockchain metrics
- **DOMPurify**: XSS protection for dynamic content

### Monitoring & Observability
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards
- **Loki**: Log aggregation and analysis
- **Nginx**: Reverse proxy and load balancing

### Development Tools
- **CRACO**: Create React App Configuration Override for Web3 polyfills
- **Vercel**: Frontend deployment platform
- **Certbot**: SSL certificate management

### Setup Instructions
```bash
# Clone and start blockchain
git clone <repository>
cd brainark_besu_chain
docker compose -f docker/docker-compose.blockchain.yml up -d

# Start React explorer
cd react-explorer
npm install
npm start

# Start monitoring (optional)
docker compose -f docker/docker-compose.monitoring.yml up -d
```

## 8. Other Notes

### LLM Code Generation Guidelines
- **Always validate blockchain addresses** using Web3.utils.isAddress() before use
- **Implement proper error boundaries** in React components for blockchain errors
- **Use async/await patterns** consistently for all blockchain operations
- **Follow the established security patterns** including input validation and rate limiting
- **Maintain the dual explorer approach** - React for advanced features, vanilla JS for simplicity
- **Respect the IBFT consensus requirements** - minimum 4 validators for Byzantine fault tolerance
- **Use the established Docker networking** with static IPs for reliable peer connectivity

### Special Constraints
- **Chain ID 424242**: Fixed identifier for the BrainArk network
- **2-second block time**: Fast block production requires careful transaction timing
- **IBFT 2.0 consensus**: Requires 2/3+ validator agreement for block finalization
- **Fixed validator set**: Changes require genesis block modification and network restart
- **Custom network configuration**: MetaMask integration requires specific network parameters

### Production Considerations
- **SSL/TLS required** for all public endpoints
- **CORS configuration** must be properly set for cross-origin requests
- **Rate limiting** should be implemented at the nginx level
- **Backup strategies** must include validator keys and blockchain data
- **Monitoring alerts** should be configured for node failures and sync issues
- **Domain configuration** requires proper DNS setup for subdomains (rpc.brainark.online, explorer.brainark.online)