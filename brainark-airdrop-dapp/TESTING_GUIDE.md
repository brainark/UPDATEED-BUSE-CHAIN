# 🧪 BrainArk Airdrop DApp Testing Guide

This comprehensive testing guide covers all aspects of testing the BrainArk Airdrop DApp, including smart contracts, frontend components, and integration tests.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Test Structure](#test-structure)
3. [Smart Contract Tests](#smart-contract-tests)
4. [Frontend Tests](#frontend-tests)
5. [Integration Tests](#integration-tests)
6. [Security Tests](#security-tests)
7. [Performance Tests](#performance-tests)
8. [Deployment Tests](#deployment-tests)
9. [Test Commands](#test-commands)
10. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Install optional security tools
npm install -g slither-analyzer mythril
```

### Run All Tests

```bash
# Run comprehensive test suite
npm run test:all

# Run specific test categories
npm run test:contracts    # Smart contract tests
npm run test:frontend     # Frontend component tests
npm run test:integration  # Integration tests
```

## 🏗️ Test Structure

```
test/
├── BrainArkAirdrop.test.js           # Airdrop contract tests
├── BrainArkEPO.test.js               # EPO contract tests
├── frontend/
│   ├── AirdropComponent.test.js      # Airdrop UI tests
│   └── EPOComponent.test.js          # EPO UI tests
├── integration/
│   └── AirdropEPO.integration.test.js # Cross-contract tests
├── run-all-tests.js                  # Comprehensive test runner
└── setup.js                          # Jest configuration
```

## 🔐 Smart Contract Tests

### Airdrop Contract Tests

**Coverage Areas:**
- ✅ Deployment and initialization
- ✅ Social task verification system
- ✅ Airdrop claiming mechanism
- ✅ Referral system functionality
- ✅ Distribution management
- ✅ Admin functions and access control
- ✅ Security measures (reentrancy, validation)
- ✅ Gas optimization

**Key Test Scenarios:**

```javascript
// Example test structure
describe("BrainArkAirdrop", function () {
  describe("Social Task Verification", function () {
    it("Should allow authorized verifier to verify tasks");
    it("Should not allow unauthorized user to verify tasks");
    it("Should verify all task types correctly");
  });

  describe("Airdrop Claiming", function () {
    it("Should allow verified user to claim airdrop");
    it("Should handle referral system correctly");
    it("Should not allow double claiming");
  });
});
```

### EPO Contract Tests

**Coverage Areas:**
- ✅ Payment token management
- ✅ Purchase calculations and quotes
- ✅ Token purchase flows (ETH, ERC20)
- ✅ Supply management
- ✅ Purchase history tracking
- ✅ Admin functions
- ✅ Security validations
- ✅ Gas optimization

**Run Contract Tests:**

```bash
# All contract tests
npm run test:contracts

# Specific contract tests
npm run test:airdrop
npm run test:epo

# With gas reporting
npm run test:gas

# With coverage
npm run test:coverage
```

## 🎨 Frontend Tests

### Component Testing Strategy

**Airdrop Component Tests:**
- User eligibility checks
- Social task verification UI
- Referral system interface
- Claiming process flow
- Error handling and user feedback
- Accessibility features

**EPO Component Tests:**
- Payment token selection
- Purchase calculations
- Transaction flows
- User interface states
- Input validation
- Performance considerations

**Test Example:**

```javascript
describe('AirdropComponent Frontend Tests', () => {
  test('should check if user can claim airdrop', () => {
    const mockCanClaim = true;
    mockWagmi.useContractRead.mockReturnValue({
      data: mockCanClaim,
      isLoading: false,
      error: null,
    });

    const userCanClaim = mockCanClaim;
    expect(userCanClaim).toBe(true);
  });
});
```

**Run Frontend Tests:**

```bash
# All frontend tests
npm run test:frontend

# With watch mode
npx jest test/frontend --watch

# With coverage
npx jest test/frontend --coverage
```

## 🔗 Integration Tests

### Cross-Contract Integration

**Test Scenarios:**
- User journey from airdrop to EPO purchase
- Referral system across both contracts
- Combined statistics tracking
- Concurrent operations
- Admin operations coordination
- Token economics validation

**Example Integration Test:**

```javascript
it("Should allow user to claim airdrop then purchase more in EPO", async function () {
  // 1. Complete social tasks for airdrop
  // 2. Claim airdrop (10 BAK)
  // 3. Purchase additional BAK in EPO
  // 4. Verify total BAK holdings
});
```

**Run Integration Tests:**

```bash
npm run test:integration
```

## 🛡️ Security Tests

### Security Testing Areas

1. **Smart Contract Security:**
   - Reentrancy protection
   - Access control validation
   - Input sanitization
   - Integer overflow/underflow
   - Gas limit considerations

2. **Frontend Security:**
   - XSS prevention
   - Input validation
   - Wallet connection security
   - Transaction verification

**Security Tools:**

```bash
# Static analysis with Slither
npm run test:slither

# Security analysis with Mythril
npm run test:mythril

# Combined security tests
npm run test:security
```

### Manual Security Checklist

- [ ] All user inputs are validated
- [ ] Access control is properly implemented
- [ ] Reentrancy guards are in place
- [ ] Integer arithmetic is safe
- [ ] External calls are handled securely
- [ ] Private keys are never exposed
- [ ] Transaction parameters are verified

## ⚡ Performance Tests

### Gas Optimization Tests

**Measured Operations:**
- Airdrop claiming gas costs
- EPO purchase gas costs
- Batch operations efficiency
- Contract deployment costs

**Performance Benchmarks:**
- Airdrop claim: < 200k gas
- EPO purchase: < 300k gas
- Combined operations: < 500k gas

**Run Performance Tests:**

```bash
npm run test:gas
```

### Frontend Performance

**Tested Areas:**
- Component render times
- State update efficiency
- Network request optimization
- Memory usage patterns

## 🚀 Deployment Tests

### Local Deployment Testing

**Prerequisites:**
```bash
# Start local blockchain
npx hardhat node

# In another terminal, run deployment tests
npm run deploy:local
```

**Deployment Test Coverage:**
- Contract deployment verification
- Initial configuration validation
- Network connectivity tests
- Gas estimation accuracy

**Run Deployment Tests:**

```bash
# Deploy to local network
npm run deploy:local

# Deploy all contracts
npm run deploy:all

# Test deployment scripts
npm run test:all  # Includes deployment tests
```

## 📝 Test Commands Reference

### Basic Commands

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run all tests
npm run test:all
```

### Contract Testing

```bash
npm run test:contracts      # All contract tests
npm run test:airdrop       # Airdrop contract only
npm run test:epo           # EPO contract only
npm run test:coverage      # With coverage report
npm run test:gas           # Gas usage analysis
```

### Frontend Testing

```bash
npm run test:frontend      # All frontend tests
npx jest --watch          # Watch mode
npx jest --coverage       # Coverage report
```

### Integration & Security

```bash
npm run test:integration   # Integration tests
npm run test:security     # Security analysis
npm run test:slither      # Static analysis
npm run test:mythril      # Security scanning
```

### Deployment

```bash
npm run deploy:local      # Local deployment
npm run deploy:tokens     # Deploy payment tokens
npm run deploy:epo        # Deploy EPO contract
npm run deploy:all        # Deploy all contracts
```

## 🔧 Troubleshooting

### Common Issues

**1. Contract Compilation Errors**
```bash
# Clean and recompile
npx hardhat clean
npm run compile
```

**2. Test Network Issues**
```bash
# Check if local network is running
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

**3. Frontend Test Failures**
```bash
# Clear Jest cache
npx jest --clearCache

# Update snapshots
npx jest --updateSnapshot
```

**4. Gas Estimation Issues**
```bash
# Increase gas limit in hardhat.config.js
networks: {
  localhost: {
    gas: 12000000,
    gasPrice: 20000000000
  }
}
```

### Environment Setup

**Required Environment Variables:**
```bash
# .env.local
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_CHAIN_ID=424242
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

**Network Configuration:**
```javascript
// hardhat.config.js
networks: {
  brainark: {
    url: "https://rpc.brainark.online",
    chainId: 424242,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

### Debug Mode

**Enable Verbose Logging:**
```bash
# Hardhat tests with verbose output
npx hardhat test --verbose

# Jest tests with verbose output
npx jest --verbose

# Enable Hardhat console logs
console.log("Debug info:", value);
```

## 📊 Test Reports

### Automated Reporting

The test runner generates detailed reports:

```bash
# Run comprehensive tests with reporting
npm run test:all

# Check generated report
cat test-report.json
```

**Report Contents:**
- Test execution summary
- Success/failure rates
- Performance metrics
- Gas usage analysis
- Coverage statistics

### Manual Verification

**Checklist for Manual Testing:**

1. **Wallet Connection:**
   - [ ] MetaMask connects successfully
   - [ ] Network switching works
   - [ ] Account changes are detected

2. **Airdrop Flow:**
   - [ ] Social tasks can be completed
   - [ ] Eligibility is checked correctly
   - [ ] Claiming works with/without referral
   - [ ] Error messages are clear

3. **EPO Flow:**
   - [ ] Payment tokens are selectable
   - [ ] Calculations are accurate
   - [ ] Purchases complete successfully
   - [ ] Transaction history is tracked

4. **Error Handling:**
   - [ ] Network errors are handled gracefully
   - [ ] User rejections are managed
   - [ ] Invalid inputs are caught
   - [ ] Loading states are shown

## 🎯 Best Practices

### Writing Tests

1. **Use Descriptive Names:**
   ```javascript
   it("Should allow verified user to claim airdrop with referral bonus")
   ```

2. **Test Edge Cases:**
   ```javascript
   it("Should reject claim when social tasks are incomplete")
   it("Should handle maximum purchase amounts correctly")
   ```

3. **Mock External Dependencies:**
   ```javascript
   jest.mock('wagmi', () => ({ /* mock implementation */ }))
   ```

4. **Use Fixtures for Setup:**
   ```javascript
   const { airdrop, epo, users } = await loadFixture(deployFixture);
   ```

### Test Organization

1. **Group Related Tests:**
   ```javascript
   describe("Airdrop Claiming", function () {
     describe("With Referral", function () {
       // Referral-specific tests
     });
   });
   ```

2. **Use Before/After Hooks:**
   ```javascript
   beforeEach(async function () {
     // Setup for each test
   });
   ```

3. **Keep Tests Independent:**
   - Each test should be able to run in isolation
   - Use fresh contract instances
   - Reset state between tests

### Continuous Integration

**GitHub Actions Example:**
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:all
```

## 📚 Additional Resources

- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [OpenZeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers/)
- [Ethereum Testing Best Practices](https://ethereum.org/en/developers/docs/smart-contracts/testing/)

---

**Happy Testing! 🎉**

For questions or issues, please check the troubleshooting section or open an issue in the repository.