# Environment Security Guide for BrainArk Project
## Protecting Sensitive Credentials and Private Keys

This document outlines best practices for handling sensitive environment variables in the BrainArk project.

## Encrypted Environment Files

We've implemented an encryption system for `.env` files to protect sensitive data such as:
- Private keys
- API tokens
- Treasury wallet credentials
- RPC endpoints

### Getting Started with Environment Encryption

1. **Encrypt your environment file**:
   ```bash
   # Make the encryption script executable
   chmod +x encrypt-env.sh
   
   # Encrypt your .env.production file
   ./encrypt-env.sh encrypt .env.production
   ```
   You'll be prompted to create a strong password. Remember this password - it's the only way to decrypt your file!

2. **Decrypt when needed**:
   ```bash
   ./encrypt-env.sh decrypt .env.production.enc
   ```
   After using the decrypted file, **delete it immediately**:
   ```bash
   rm .env.production
   ```

3. **Git Safety**: Add the following to `.gitignore` to prevent accidental commits:
   ```
   # Prevent committing unencrypted environment files
   .env*
   !.env.example
   !.env*.enc
   ```

## Security Best Practices

1. **Password Management**:
   - Use a strong, unique password for encryption
   - Store your encryption password in a password manager
   - Consider using a hardware security module (HSM) for the most critical credentials

2. **Access Control**:
   - Limit who has access to the encrypted files
   - Use separate encryption passwords for development and production environments
   - Consider splitting critical secrets across multiple encrypted files

3. **Safe Handling**:
   - Never decrypt files on shared or public computers
   - Ensure your terminal history doesn't record commands with passwords
   - Set `HISTIGNORE='*decrypt*:*password*'` in your shell

4. **Secure Distribution**:
   - Never share passwords via email or chat
   - Use a secure password manager or secure communication channel for sharing passwords
   - Consider implementing a secrets management system like HashiCorp Vault for team access

## Emergency Access Plan

1. Create a secure backup of your encryption password
2. Document a recovery process in case the primary administrator is unavailable
3. Consider implementing a multi-party recovery mechanism for critical credentials

## Production Deployment

When deploying to production:
1. Decrypt the environment file only during the deployment process
2. Load variables into the runtime environment without writing to disk
3. Use a CI/CD secret management solution where possible

## Audit and Rotation

1. Periodically audit who has access to encrypted environment files
2. Rotate encryption passwords quarterly
3. Update all credentials and re-encrypt after any team member leaves the project
