# Connect Vercel App to brainark.online Domain

## Current Setup
- **Vercel App**: `newbesu-chain-with-the-updated-expl.vercel.app`
- **Domain**: `brainark.online`
- **DNS Provider**: GoDaddy (ns51.domaincontrol.com, ns52.domaincontrol.com)

## Step-by-Step Instructions

### 1. Add Domain in Vercel Dashboard

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Select Your Project:**
   - Find and click on `newbesu-chain-with-the-updated-expl`

3. **Navigate to Domain Settings:**
   - Click **Settings** tab
   - Click **Domains** in the left sidebar
   - Click **Add Domain** button

4. **Add Your Domain:**
   Enter one of these options:
   - `explorer.brainark.online` ✅ **RECOMMENDED**
   - `brainark.online` (if you want root domain)
   - `www.brainark.online` (if you prefer www)

### 2. Configure DNS in GoDaddy

1. **Login to GoDaddy:**
   ```
   https://dcc.godaddy.com/manage/dns
   ```

2. **Find Your Domain:**
   - Look for `brainark.online` in your domain list
   - Click **DNS** or **Manage DNS**

3. **Add DNS Record:**

   **For Explorer Subdomain (Recommended):**
   ```
   Type: CNAME
   Name: explorer
   Value: cname.vercel-dns.com
   TTL: 1 Hour
   ```

   **For Root Domain:**
   ```
   Type: A
   Name: @
   Value: 76.76.19.61
   TTL: 1 Hour
   
   Type: A
   Name: @
   Value: 76.223.126.88
   TTL: 1 Hour
   ```

### 3. Wait for DNS Propagation

- **Time**: 5-30 minutes (sometimes up to 24 hours)
- **Check Status**: Use https://dnschecker.org/

### 4. Verify Configuration

Run the verification script:
```bash
./verify-domain.sh
```

### 5. Test Your Domain

Once DNS propagates, test these URLs:
- `https://explorer.brainark.online` (if you used subdomain)
- `https://brainark.online` (if you used root domain)

## Troubleshooting

### Common Issues

1. **DNS Not Propagating:**
   - Wait longer (up to 24 hours)
   - Clear browser cache
   - Try incognito/private browsing

2. **SSL Certificate Issues:**
   - Vercel automatically provisions SSL
   - Wait 5-10 minutes after DNS propagation

3. **404 Errors:**
   - Check Vercel routing configuration
   - Ensure domain is properly added in Vercel

4. **CNAME vs A Records:**
   - Use CNAME for subdomains (explorer.brainark.online)
   - Use A records for root domain (brainark.online)

### Verification Commands

```bash
# Check DNS propagation
dig explorer.brainark.online

# Check if domain resolves to Vercel
nslookup explorer.brainark.online

# Test HTTP response
curl -I https://explorer.brainark.online
```

## Recommended Domain Structure

```
brainark.online
├── explorer.brainark.online    # Blockchain Explorer (Vercel)
├── rpc.brainark.online        # RPC Endpoint (Future)
├── api.brainark.online        # API Services (Future)
└── www.brainark.online        # Main Website (Future)
```

## Security Considerations

1. **SSL/TLS**: Automatically handled by Vercel
2. **HSTS**: Configure in Vercel headers
3. **CSP**: Set Content Security Policy
4. **CORS**: Configure for your RPC endpoints

## Next Steps After Domain Connection

1. **Update App Configuration:**
   - The config has been updated to use `explorer.brainark.online`
   - Redeploy your app to Vercel

2. **Test Functionality:**
   - Wallet connections
   - Transaction lookups
   - Block exploration

3. **Monitor Performance:**
   - Check Vercel analytics
   - Monitor domain resolution

## Support Resources

- **Vercel Docs**: https://vercel.com/docs/concepts/projects/domains
- **GoDaddy DNS**: https://www.godaddy.com/help/manage-dns-680
- **DNS Checker**: https://dnschecker.org/
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html