# Security Guidelines for BrainArk Blockchain

## Overview
This document outlines critical security practices for managing the BrainArk Blockchain Chain ID 1236 project.

## Critical Security Rules

### 1. Never Commit Sensitive Data

**NEVER commit these to version control:**
- Private keys (blockchain wallets, validator keys)
- API keys and tokens (Twitter, Telegram, Appwrite, WalletConnect)
- Environment files containing secrets (`.env`, `.env.production.*`)
- Validator key files (`validators/*/key/`)
- Database credentials
- OAuth secrets

### 2. Using .gitignore

A comprehensive `.gitignore` file has been provided. **Before your first commit:**

```bash
# Verify sensitive files are ignored
git status

# These should NOT appear in git status:
# - .env.production.1236
# - validators/node*/key/
# - Any files containing "PRIVATE_KEY"
```

### 3. Environment File Management

#### Production Environment:
- Store actual secrets in `.env.production.1236` (ignored by git)
- Use `.env.template` as a reference (safe to commit)
- Never share production `.env` files via email, Slack, or public channels

#### Development Environment:
- Use different keys for development
- Use testnet/localhost endpoints
- Keep development keys separate from production

### 4. Private Key Security

#### Blockchain Private Keys:
- **Store in secure vaults:** Use HashiCorp Vault, AWS Secrets Manager, or similar
- **Hardware wallets:** For high-value keys, use hardware wallets
- **Multi-signature:** Implement multi-sig for critical operations
- **Regular rotation:** Rotate keys periodically
- **Backup securely:** Encrypted backups only, stored separately

#### Current Keys That Need Protection:
- Main deployment key (PRIVATE_KEY)
- 10+ treasury keys (ETH, BSC, Polygon networks)
- 4 validator node keys
- Admin and Oracle keys

### 5. API Token Security

#### Twitter API:
- Regenerate if exposed
- Use OAuth 2.0 with minimal scopes
- Monitor usage at https://developer.twitter.com/

#### Telegram Bot:
- Regenerate token if exposed via @BotFather
- Use webhook instead of polling for production
- Validate incoming requests

#### Appwrite:
- Use API keys with minimal permissions
- Separate keys for different services
- Monitor API usage in console

### 6. Validator Node Security

#### Key Management:
- Each validator key is stored in `validators/nodeX/key/key`
- These files must NEVER be committed to git
- Backup validator keys in encrypted storage
- Consider using remote key management systems

#### Network Security:
- Keep validator nodes on private network
- Use firewall rules to restrict access
- Enable audit logging
- Monitor for unusual activity

### 7. Git Repository Security

#### Before Pushing to GitHub:

```bash
# 1. Initialize git if not already done
git init

# 2. Ensure .gitignore exists
ls -la .gitignore

# 3. Check what will be committed
git status

# 4. Verify no secrets are staged
git diff --cached

# 5. Use a private repository initially
# Go to GitHub > New Repository > Select "Private"
```

#### If Secrets Are Accidentally Committed:

**DO NOT just delete the files and commit again!**

Git history keeps all previous commits. If you accidentally commit secrets:

1. **Immediately rotate all exposed credentials**
2. **Move funds to new wallets**
3. **Consider the repository permanently compromised**
4. **Delete and recreate the repository**
5. **Use tools like BFG Repo-Cleaner or git-filter-branch (but still rotate keys)**

### 8. Secure Secret Management

#### Recommended Tools:

**For Development:**
- dotenv (already in use)
- direnv (per-directory environment)

**For Production:**
- **HashiCorp Vault** (enterprise-grade secrets management)
- **AWS Secrets Manager** (if using AWS)
- **Azure Key Vault** (if using Azure)
- **Google Secret Manager** (if using GCP)

#### Implementation Example:

Instead of storing keys in `.env`:
```bash
# Fetch from vault at runtime
PRIVATE_KEY=$(vault kv get -field=private_key secret/brainark/keys)
```

### 9. Access Control

#### Team Access:
- Limit who has access to production keys
- Use principle of least privilege
- Implement approval workflows for sensitive operations
- Maintain audit logs of who accessed what

#### Server Access:
- Use SSH keys, not passwords
- Implement 2FA for server access
- Regular security audits
- Keep systems updated

### 10. Monitoring & Alerts

#### Set up alerts for:
- Unusual transaction patterns
- Failed authentication attempts
- API usage spikes
- Validator node downtime
- Unauthorized access attempts

#### Tools:
- CloudWatch (AWS)
- Datadog
- Grafana + Prometheus
- Custom webhook alerts

### 11. Incident Response Plan

#### If Keys Are Compromised:

**IMMEDIATE ACTIONS:**
1. ⏰ **Pause all automated systems**
2. 🔑 **Rotate all potentially compromised keys**
3. 💰 **Move funds to new secure wallets**
4. 🔒 **Review access logs**
5. 📢 **Notify team and stakeholders**
6. 📝 **Document the incident**

**RECOVERY:**
1. Generate new keys securely
2. Update all services with new credentials
3. Verify all systems are functioning
4. Post-mortem analysis
5. Update security procedures

### 12. Regular Security Audits

#### Monthly:
- Review access logs
- Check for exposed credentials (use git-secrets, truffleHog)
- Verify backup integrity
- Update dependencies

#### Quarterly:
- Penetration testing
- Smart contract audits (if contracts changed)
- Security training for team
- Review and update this document

### 13. Security Tools

#### Install and Configure:

```bash
# git-secrets: Prevent committing secrets
git secrets --install
git secrets --register-aws
git secrets --add 'private[_-]?key'
git secrets --add '[0-9a-fA-F]{64}'

# pre-commit hooks
npm install -g pre-commit

# TruffleHog: Scan for secrets in git history
pip install truffleHog
trufflehog --regex --entropy=True .
```

## Quick Security Checklist

Before going live with this project:

- [ ] `.gitignore` is comprehensive and tested
- [ ] All `.env` files are gitignored
- [ ] `.env.template` created (safe version)
- [ ] Production keys stored in secure vault
- [ ] API keys use minimal required permissions
- [ ] Multi-signature enabled for high-value wallets
- [ ] Validator keys backed up securely
- [ ] Monitoring and alerts configured
- [ ] Incident response plan documented
- [ ] Team trained on security practices
- [ ] Regular security audit schedule established
- [ ] Git repository is private
- [ ] No secrets in git history
- [ ] Pre-commit hooks installed

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web3 Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [HashiCorp Vault Documentation](https://www.vaultproject.io/docs)

## Contact

For security concerns or to report vulnerabilities:
- Email: brainarkbesuchain@gmail.com
- Use responsible disclosure practices

---

**Remember: Security is not a one-time setup, it's an ongoing process.**
