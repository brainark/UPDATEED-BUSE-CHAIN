#!/bin/bash
# Restoration script for contract fixes backup

BACKUP_DIR="backups/20250906_184457_contract_fixes"

echo "🔄 Restoring from backup: $BACKUP_DIR"

# Restore source directories
if [ -d "$BACKUP_DIR/hooks_backup" ]; then
    rm -rf src/hooks/
    cp -r "$BACKUP_DIR/hooks_backup" src/hooks/
    echo "✅ Hooks restored"
fi

if [ -d "$BACKUP_DIR/utils_backup" ]; then
    rm -rf src/utils/
    cp -r "$BACKUP_DIR/utils_backup" src/utils/
    echo "✅ Utils restored"
fi

if [ -d "$BACKUP_DIR/components_backup" ]; then
    rm -rf src/components/
    cp -r "$BACKUP_DIR/components_backup" src/components/
    echo "✅ Components restored"
fi

# Restore environment files
if [ -f "$BACKUP_DIR/env_production_backup" ]; then
    cp "$BACKUP_DIR/env_production_backup" .env.production
    echo "✅ Production environment restored"
fi

if [ -f "$BACKUP_DIR/env_local_backup" ]; then
    cp "$BACKUP_DIR/env_local_backup" .env.local
    echo "✅ Local environment restored"
fi

echo "🎉 Restoration completed!"
echo "Run 'npm run build' to rebuild the application"