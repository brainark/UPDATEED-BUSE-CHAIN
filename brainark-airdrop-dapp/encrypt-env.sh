#!/bin/bash
# Encrypt/Decrypt .env files for BrainArk project
# Usage: ./encrypt-env.sh encrypt|decrypt [filename]

set -e

# Default file to encrypt/decrypt
DEFAULT_ENV_FILE=".env.production"
# Encrypted output file extension
ENC_EXTENSION=".enc"

# Check for required commands
if ! command -v openssl &> /dev/null; then
    echo "Error: openssl is not installed. Please install it first."
    exit 1
fi

# Function to encrypt a file
encrypt_file() {
    local input_file=$1
    local output_file="${input_file}${ENC_EXTENSION}"
    
    # Ensure the input file exists
    if [ ! -f "$input_file" ]; then
        echo "Error: File '$input_file' not found!"
        exit 1
    fi
    
    echo "Encrypting '$input_file' to '$output_file'"
    echo "Enter a strong password to encrypt the file (you'll need this to decrypt):"
    
    # Use AES-256-CBC encryption with a salt and prompt for password
    openssl enc -aes-256-cbc -salt -pbkdf2 -in "$input_file" -out "$output_file"
    
    # Check if encryption was successful
    if [ $? -eq 0 ] && [ -f "$output_file" ]; then
        echo "✅ Encryption successful!"
        echo "📝 Consider creating a backup of your original .env file in a secure location,"
        echo "   then delete the original unencrypted file using: rm $input_file"
    else
        echo "❌ Encryption failed!"
        exit 1
    fi
}

# Function to decrypt a file
decrypt_file() {
    local input_file=$1
    local output_file="${input_file%$ENC_EXTENSION}"
    
    # Ensure the input file exists
    if [ ! -f "$input_file" ]; then
        echo "Error: Encrypted file '$input_file' not found!"
        exit 1
    fi
    
    echo "Decrypting '$input_file' to '$output_file'"
    echo "Enter the password used for encryption:"
    
    # Use AES-256-CBC decryption with a salt and prompt for password
    openssl enc -aes-256-cbc -d -salt -pbkdf2 -in "$input_file" -out "$output_file"
    
    # Check if decryption was successful
    if [ $? -eq 0 ] && [ -f "$output_file" ]; then
        echo "✅ Decryption successful!"
        echo "⚠️ Remember to delete the decrypted file when you're done with it:"
        echo "   rm $output_file"
    else
        echo "❌ Decryption failed! Incorrect password or corrupted file."
        exit 1
    fi
}

# Main script
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 encrypt|decrypt [filename]"
    echo "  - Default filename is $DEFAULT_ENV_FILE"
    exit 1
fi

ACTION=$1
FILENAME=${2:-$DEFAULT_ENV_FILE}

case "$ACTION" in
    encrypt)
        encrypt_file "$FILENAME"
        ;;
    decrypt)
        # Make sure the file has the .enc extension
        if [[ $FILENAME != *$ENC_EXTENSION ]]; then
            FILENAME="${FILENAME}${ENC_EXTENSION}"
        fi
        decrypt_file "$FILENAME"
        ;;
    *)
        echo "Invalid action. Use 'encrypt' or 'decrypt'"
        exit 1
        ;;
esac

exit 0
