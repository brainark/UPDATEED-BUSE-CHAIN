# Domain Setup Guide for BrainArk Explorer

## Quick Deployment Commands

### 1. Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy Using Our Script
```bash
./deploy-explorer.sh
```

## Manual Deployment

### React Explorer (Recommended)
```bash
cd react-explorer
npm run build
vercel --prod
```

### Simple HTML Explorer
```bash
cd brainarkblock-explorer
vercel --prod
```

## Domain Configuration

### Step 1: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your deployed project
3. Navigate to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain (e.g., `explorer.brainark.online`)

### Step 2: DNS Configuration

#### For Subdomain (Recommended)
Add this CNAME record in your DNS provider:
```
Type: CNAME
Name: explorer
Value: cname.vercel-dns.com
TTL: 300 (or Auto)
```

#### For Root Domain
Add these A records:
```
Type: A
Name: @
Value: 76.76.19.61
TTL: 300

Type: A
Name: @
Value: 76.223.126.88
TTL: 300
```

### Step 3: SSL Certificate
Vercel automatically provisions SSL certificates. Wait 5-10 minutes after DNS propagation.

## Recommended Domain Structure

```
brainark.online                    # Main website
├── rpc.brainark.online           # RPC endpoint (existing)
├── explorer.brainark.online      # React Explorer (recommended)
├── simple.brainark.online        # HTML Explorer (optional)
└── api.brainark.online           # API endpoints (future)
```

## Environment-Specific Configuration

### Production Configuration
Update `react-explorer/src/config.js`:
```javascript
production: {
  RPC_URL: "https://rpc.brainark.online",
  CHAIN_ID: "0x67932", // 424242
  CHAIN_ID_DECIMAL: 424242,
  CHAIN_NAME: "BrainArk",
  CURRENCY_NAME: "BrainArk Token",
  CURRENCY_SYMBOL: "BAK",
  CURRENCY_DECIMALS: 18,
  EXPLORER_URL: "https://explorer.brainark.online", // Update this
}
```

## Verification Steps

1. **DNS Propagation**: Check with `dig explorer.brainark.online`
2. **SSL Certificate**: Verify HTTPS works
3. **Functionality**: Test wallet connection and transaction lookup
4. **Mobile**: Test responsive design on mobile devices

## Troubleshooting

### Common Issues
- **DNS not propagating**: Wait 24-48 hours, check with multiple DNS checkers
- **SSL errors**: Ensure DNS is properly configured first
- **404 errors**: Check vercel.json routing configuration
- **CORS errors**: Verify RPC endpoint allows your domain

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [DNS Checker Tool](https://dnschecker.org/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)

## Security Considerations

- Enable HSTS headers
- Configure CSP (Content Security Policy)
- Regular dependency updates
- Monitor for vulnerabilities
- Use environment variables for sensitive data