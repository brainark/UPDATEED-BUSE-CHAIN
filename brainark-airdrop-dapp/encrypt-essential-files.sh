#!/bin/bash
# Enhanced Encryption Script for BrainArk Essential Files
# Encrypts smart contracts, deployment scripts, configurations, and sensitive files
# Usage: ./encrypt-essential-files.sh encrypt|decrypt|list [category]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENC_EXTENSION=".enc"
BACKUP_DIR="${SCRIPT_DIR}/encrypted_backups"
MANIFEST_FILE="${BACKUP_DIR}/encryption_manifest.json"
COMPRESSION_ENABLED=true

# Encryption settings - SAME AS ORIGINAL SCRIPT
CIPHER="aes-256-cbc"
KEY_DERIVATION="-pbkdf2"

# File categories and patterns
declare -A FILE_CATEGORIES=(
    ["contracts"]="contracts/*.sol contracts/**/*.sol"
    ["scripts"]="scripts/*.js scripts/**/*.js"
    ["configs"]="hardhat.config.js package.json tsconfig.json next.config.js tailwind.config.js"
    ["env"]=".env* .env.* *.env"
    ["docs"]="*.md docs/*.md SECURITY_*.md"
    ["deploy"]="deploy/*.json artifacts/contracts/**/*.json"
    ["tests"]="test/*.js test/**/*.js tests/*.ts tests/**/*.ts"
    ["github"]=".github/**/*.yml .github/**/*.yaml"
    ["validators"]="../validators/node*/key/key ../validators/node*/data/IDENTITY ../validators/*/key/key ../validators/*/data/IDENTITY"
    ["blockchain"]="../validators/node*/genesis.json ../validators/node*/config.toml ../genesis*.json"
)

# Critical files that must be encrypted
CRITICAL_FILES=(
    ".env.production"
    ".env.secure" 
    "hardhat.config.js"
    "scripts/deploy-production.js"
    "scripts/deploy-with-env-wallets.js"
    "contracts/BrainArkEPOEnhanced.sol"
    "contracts/BrainArkBridge.sol"
    "contracts/BrainArkEPOCrossChain.sol"
    "../validators/node1/key/key"
    "../validators/node2/key/key"
    "../validators/node3/key/key"
    "../validators/node4/key/key"
)

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v openssl &> /dev/null; then
        missing_deps+=("openssl")
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  jq not found - some advanced features will be disabled${NC}"
        echo -e "${BLUE}💡 Install jq for full functionality: sudo apt-get install jq${NC}"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required dependencies: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}Please install them first:${NC}"
        echo "  Ubuntu/Debian: sudo apt-get install ${missing_deps[*]}"
        echo "  macOS: brew install ${missing_deps[*]}"
        exit 1
    fi
}

# Create backup directory structure
setup_backup_structure() {
    mkdir -p "${BACKUP_DIR}"/{contracts,scripts,configs,env,docs,deploy,tests,github}
    
    if command -v jq &> /dev/null && [ ! -f "$MANIFEST_FILE" ]; then
        echo '{"encrypted_files": [], "created": "'$(date -Iseconds)'", "version": "1.0"}' > "$MANIFEST_FILE"
    fi
}

# Get files for a category
get_files_for_category() {
    local category="$1"
    local files=()
    
    if [[ -n "${FILE_CATEGORIES[$category]}" ]]; then
        for pattern in ${FILE_CATEGORIES[$category]}; do
            if compgen -G "$pattern" > /dev/null 2>&1; then
                while IFS= read -r -d '' file; do
                    if [[ -f "$file" && ! "$file" == *"$ENC_EXTENSION" ]]; then
                        files+=("$file")
                    fi
                done < <(find . -path "./$pattern" -type f -print0 2>/dev/null)
            fi
        done
    fi
    
    printf '%s\n' "${files[@]}"
}

# Compress file if enabled
compress_file() {
    local input_file="$1"
    local compressed_file="${input_file}.gz"
    
    if [ "$COMPRESSION_ENABLED" = true ] && command -v gzip &> /dev/null; then
        gzip -c "$input_file" > "$compressed_file"
        echo "$compressed_file"
    else
        echo "$input_file"
    fi
}

# Decompress file if needed
decompress_file() {
    local input_file="$1"
    local output_file="$2"
    
    if [[ "$input_file" == *.gz ]] && command -v gzip &> /dev/null; then
        gzip -dc "$input_file" > "$output_file"
    else
        cp "$input_file" "$output_file"
    fi
}

# Encrypt a single file - COMPATIBLE WITH ORIGINAL SCRIPT
encrypt_file() {
    local input_file="$1"
    local category="$2"
    local password="$3"
    
    if [ ! -f "$input_file" ]; then
        echo -e "${RED}❌ File not found: $input_file${NC}"
        return 1
    fi
    
    # Create category-specific backup path
    local backup_subdir="${BACKUP_DIR}/${category}"
    local filename=$(basename "$input_file")
    local output_file="${backup_subdir}/${filename}${ENC_EXTENSION}"
    
    echo -e "${BLUE}📦 Encrypting: $input_file${NC}"
    
    # Use same encryption method as original script
    if echo "$password" | openssl enc -"$CIPHER" -salt $KEY_DERIVATION -in "$input_file" -out "$output_file" -pass stdin; then
        # Update manifest if jq is available
        if command -v jq &> /dev/null; then
            local file_info="{\"file\": \"$input_file\", \"encrypted_path\": \"$output_file\", \"category\": \"$category\", \"encrypted_at\": \"$(date -Iseconds)\", \"size\": $(stat -c%s "$input_file" 2>/dev/null || stat -f%z "$input_file")}"
            jq --argjson new_entry "$file_info" '.encrypted_files += [$new_entry]' "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp" && mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
        fi
        
        echo -e "${GREEN}✅ Successfully encrypted: $output_file${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to encrypt: $input_file${NC}"
        return 1
    fi
}

# Decrypt a single file - COMPATIBLE WITH ORIGINAL SCRIPT
decrypt_file() {
    local encrypted_file="$1"
    local output_file="$2"
    local password="$3"
    
    if [ ! -f "$encrypted_file" ]; then
        echo -e "${RED}❌ Encrypted file not found: $encrypted_file${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔓 Decrypting: $encrypted_file${NC}"
    
    # Use same decryption method as original script
    if echo "$password" | openssl enc -d -"$CIPHER" -salt $KEY_DERIVATION -in "$encrypted_file" -out "$output_file" -pass stdin; then
        echo -e "${GREEN}✅ Successfully decrypted: $output_file${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to decrypt: $encrypted_file${NC}"
        return 1
    fi
}

# Batch encrypt files by category
batch_encrypt() {
    local category="$1"
    local password="$2"
    local success_count=0
    local total_count=0
    
    echo -e "${CYAN}🔒 Encrypting files in category: $category${NC}"
    
    if [ "$category" = "all" ]; then
        for cat in "${!FILE_CATEGORIES[@]}"; do
            batch_encrypt "$cat" "$password"
        done
        return
    fi
    
    if [ "$category" = "critical" ]; then
        echo -e "${YELLOW}🚨 Encrypting critical files...${NC}"
        for file in "${CRITICAL_FILES[@]}"; do
            if [ -f "$file" ]; then
                ((total_count++))
                if encrypt_file "$file" "critical" "$password"; then
                    ((success_count++))
                fi
            fi
        done
    else
        local files=($(get_files_for_category "$category"))
        total_count=${#files[@]}
        
        for file in "${files[@]}"; do
            if encrypt_file "$file" "$category" "$password"; then
                ((success_count++))
            fi
        done
    fi
    
    echo -e "${GREEN}📊 Encryption Summary for $category: $success_count/$total_count files encrypted${NC}"
}

# Batch decrypt files
batch_decrypt() {
    local category="$1"
    local password="$2"
    local output_dir="${3:-.}"
    local success_count=0
    local total_count=0
    
    echo -e "${CYAN}🔓 Decrypting files in category: $category${NC}"
    
    # If jq is not available, use simple file discovery
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  Advanced decryption requires jq - using simple mode${NC}"
        for enc_file in "${BACKUP_DIR}"/**/*"${ENC_EXTENSION}"; do
            if [ -f "$enc_file" ]; then
                ((total_count++))
                local basename_file=$(basename "$enc_file" "$ENC_EXTENSION")
                local output_file="${output_dir}/${basename_file}"
                mkdir -p "$(dirname "$output_file")"
                
                if decrypt_file "$enc_file" "$output_file" "$password"; then
                    ((success_count++))
                fi
            fi
        done
    else
        # Use manifest for precise decryption
        local encrypted_files
        if [ "$category" = "all" ]; then
            encrypted_files=$(jq -r '.encrypted_files[] | .encrypted_path' "$MANIFEST_FILE")
        else
            encrypted_files=$(jq -r --arg cat "$category" '.encrypted_files[] | select(.category == $cat) | .encrypted_path' "$MANIFEST_FILE")
        fi
        
        while IFS= read -r encrypted_file; do
            if [ -n "$encrypted_file" ] && [ -f "$encrypted_file" ]; then
                ((total_count++))
                
                local original_file=$(jq -r --arg path "$encrypted_file" '.encrypted_files[] | select(.encrypted_path == $path) | .file' "$MANIFEST_FILE")
                local output_file="${output_dir}/${original_file}"
                
                mkdir -p "$(dirname "$output_file")"
                
                if decrypt_file "$encrypted_file" "$output_file" "$password"; then
                    ((success_count++))
                fi
            fi
        done <<< "$encrypted_files"
    fi
    
    echo -e "${GREEN}📊 Decryption Summary for $category: $success_count/$total_count files decrypted${NC}"
}

# List encrypted files
list_encrypted_files() {
    local category="$1"
    
    echo -e "${CYAN}📋 Encrypted Files Report${NC}"
    echo -e "${BLUE}========================${NC}"
    
    if command -v jq &> /dev/null && [ -f "$MANIFEST_FILE" ]; then
        if [ -n "$category" ] && [ "$category" != "all" ]; then
            echo -e "${YELLOW}Category: $category${NC}"
            jq -r --arg cat "$category" '.encrypted_files[] | select(.category == $cat) | "📄 \(.file) → \(.encrypted_path) (\(.size) bytes)"' "$MANIFEST_FILE"
        else
            echo -e "${YELLOW}All Categories:${NC}"
            for cat in "${!FILE_CATEGORIES[@]}" critical; do
                local count=$(jq -r --arg cat "$cat" '[.encrypted_files[] | select(.category == $cat)] | length' "$MANIFEST_FILE")
                if [ "$count" -gt 0 ]; then
                    echo -e "\n${PURPLE}$cat ($count files):${NC}"
                    jq -r --arg cat "$cat" '.encrypted_files[] | select(.category == $cat) | "  📄 \(.file) → \(.encrypted_path)"' "$MANIFEST_FILE"
                fi
            done
        fi
        
        local total_files=$(jq -r '.encrypted_files | length' "$MANIFEST_FILE")
        echo -e "\n${GREEN}📊 Total: $total_files files encrypted${NC}"
    else
        echo -e "${YELLOW}⚠️  Simple listing mode (install jq for detailed info)${NC}"
        find "$BACKUP_DIR" -name "*${ENC_EXTENSION}" -type f | while read -r file; do
            echo -e "${BLUE}📄 $file${NC}"
        done
    fi
}

# Show usage information
show_usage() {
    echo -e "${CYAN}🔐 BrainArk Enhanced File Encryption Tool${NC}"
    echo -e "${BLUE}===============================================${NC}"
    echo
    echo "Usage: $0 <action> [category] [options]"
    echo
    echo -e "${YELLOW}Actions:${NC}"
    echo "  encrypt [category]    - Encrypt files in category"
    echo "  decrypt [category]    - Decrypt files in category  "
    echo "  list [category]       - List encrypted files"
    echo "  clean                 - Clean up temporary files"
    echo
    echo -e "${YELLOW}Categories:${NC}"
    for category in "${!FILE_CATEGORIES[@]}"; do
        echo "  $category"
    done
    echo "  critical              - Critical files only"
    echo "  all                   - All categories"
    echo
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 encrypt contracts  - Encrypt all smart contracts"
    echo "  $0 encrypt critical   - Encrypt critical files only"
    echo "  $0 decrypt all        - Decrypt all files"
    echo "  $0 list env          - List encrypted environment files"
    echo
    echo -e "${GREEN}✅ Compatible with your existing encrypted files!${NC}"
    echo -e "${YELLOW}Files will be encrypted to: ${BACKUP_DIR}${NC}"
}

# Clean up temporary files
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
    find "$SCRIPT_DIR" -name "*.tmp" -delete 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Main script logic
main() {
    local action="$1"
    local category="${2:-all}"
    
    check_dependencies
    setup_backup_structure
    
    case "$action" in
        encrypt)
            if [[ -z "$category" ]]; then
                echo -e "${RED}❌ Category required for encryption${NC}"
                show_usage
                exit 1
            fi
            
            echo -e "${YELLOW}🔐 Enter encryption password (same as your existing files):${NC}"
            read -s password
            echo
            echo -e "${YELLOW}🔐 Confirm encryption password:${NC}"
            read -s password_confirm
            echo
            
            if [ "$password" != "$password_confirm" ]; then
                echo -e "${RED}❌ Passwords don't match!${NC}"
                exit 1
            fi
            
            if [ -z "$password" ]; then
                echo -e "${RED}❌ Password cannot be empty!${NC}"
                exit 1
            fi
            
            batch_encrypt "$category" "$password"
            ;;
            
        decrypt)
            if [[ -z "$category" ]]; then
                echo -e "${RED}❌ Category required for decryption${NC}"
                show_usage
                exit 1
            fi
            
            echo -e "${YELLOW}🔓 Enter decryption password:${NC}"
            read -s password
            echo
            
            if [ -z "$password" ]; then
                echo -e "${RED}❌ Password cannot be empty!${NC}"
                exit 1
            fi
            
            echo -e "${YELLOW}📁 Enter output directory (default: current directory):${NC}"
            read output_dir
            output_dir="${output_dir:-.}"
            
            batch_decrypt "$category" "$password" "$output_dir"
            ;;
            
        list)
            list_encrypted_files "$category"
            ;;
            
        clean)
            cleanup
            ;;
            
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"

exit 0