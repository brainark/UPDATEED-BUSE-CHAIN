#!/bin/bash

echo "🌐 Domain Configuration Verification Script"
echo "=========================================="

DOMAIN="brainark.online"
SUBDOMAIN="explorer.brainark.online"
VERCEL_APP="newbesu-chain-with-the-updated-expl.vercel.app"

echo ""
echo "📋 Current DNS Configuration:"
echo "-----------------------------"

echo "🔍 Checking root domain NS records..."
dig NS $DOMAIN +short

echo ""
echo "🔍 Checking if explorer subdomain exists..."
dig A $SUBDOMAIN +short

echo ""
echo "🔍 Checking Vercel app accessibility..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://$VERCEL_APP

echo ""
echo "📝 Next Steps:"
echo "1. Add CNAME record in GoDaddy:"
echo "   Type: CNAME"
echo "   Name: explorer"
echo "   Value: cname.vercel-dns.com"
echo ""
echo "2. Add domain in Vercel dashboard:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Select: newbesu-chain-with-the-updated-expl"
echo "   - Settings → Domains → Add Domain"
echo "   - Enter: explorer.brainark.online"
echo ""
echo "3. Wait for DNS propagation (5-30 minutes)"
echo ""
echo "🔗 Useful Links:"
echo "- GoDaddy DNS: https://dcc.godaddy.com/manage/dns"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- DNS Checker: https://dnschecker.org/"