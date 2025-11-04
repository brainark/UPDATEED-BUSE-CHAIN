#!/bin/bash

# ============================================================================
# BrainArk Blockchain Chain ID 1236 - Management Script
# ============================================================================
# This script provides easy management of the Chain ID 1236 blockchain
# Author: BrainArk Team
# Version: 2.0.0
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.blockchain.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to display header
show_header() {
    echo -e "${BLUE}"
    echo "============================================================"
    echo "🚀 BrainArk Blockchain Chain ID 1236 - Management Script"
    echo "============================================================"
    echo -e "${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start the blockchain
start_blockchain() {
    log_info "Starting BrainArk Blockchain Chain ID 1236..."

    cd "$SCRIPT_DIR"
    docker-compose -f "$COMPOSE_FILE" up -d

    log_success "Blockchain started successfully!"

    # Wait a moment for containers to start
    sleep 5

    # Show status
    show_status

    echo ""
    log_info "RPC Endpoint: http://localhost:8555"
    log_info "Chain ID: 1236"
    log_info "Initial Balance Holder: 0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169"
}

# Function to stop the blockchain
stop_blockchain() {
    log_info "Stopping BrainArk Blockchain Chain ID 1236..."

    cd "$SCRIPT_DIR"
    docker-compose -f "$COMPOSE_FILE" down

    log_success "Blockchain stopped successfully!"
}

# Function to restart the blockchain
restart_blockchain() {
    log_info "Restarting BrainArk Blockchain Chain ID 1236..."
    stop_blockchain
    sleep 2
    start_blockchain
}

# Function to show status
show_status() {
    log_info "Blockchain Status:"
    echo ""

    cd "$SCRIPT_DIR"
    docker-compose -f "$COMPOSE_FILE" ps

    echo ""

    # Test RPC connection
    if curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
        http://localhost:8555 > /dev/null 2>&1; then
        log_success "RPC endpoint is responding"

        # Get current block
        BLOCK=$(curl -s -X POST -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
            http://localhost:8555 | jq -r '.result')

        if [ "$BLOCK" != "null" ] && [ "$BLOCK" != "" ]; then
            BLOCK_DECIMAL=$((16#${BLOCK#0x}))
            log_success "Current block: $BLOCK_DECIMAL"
        fi
    else
        log_warning "RPC endpoint is not responding"
    fi
}

# Function to show logs
show_logs() {
    local node=${1:-"all"}

    cd "$SCRIPT_DIR"

    if [ "$node" = "all" ]; then
        log_info "Showing logs for all nodes..."
        docker-compose -f "$COMPOSE_FILE" logs -f
    else
        log_info "Showing logs for $node..."
        docker-compose -f "$COMPOSE_FILE" logs -f "$node"
    fi
}

# Function to test blockchain
test_blockchain() {
    log_info "Testing BrainArk Blockchain Chain ID 1236..."
    echo ""

    # Test Chain ID
    echo "🔍 Testing Chain ID..."
    CHAIN_ID=$(curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
        http://localhost:8555 | jq -r '.result')

    if [ "$CHAIN_ID" = "0x4d4" ]; then
        log_success "Chain ID test passed: 1236"
    else
        log_error "Chain ID test failed. Expected 0x4d4, got $CHAIN_ID"
        return 1
    fi

    # Test block production
    echo "🔍 Testing block production..."
    BLOCK1=$(curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://localhost:8555 | jq -r '.result')

    sleep 5

    BLOCK2=$(curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://localhost:8555 | jq -r '.result')

    BLOCK1_DECIMAL=$((16#${BLOCK1#0x}))
    BLOCK2_DECIMAL=$((16#${BLOCK2#0x}))

    if [ "$BLOCK2_DECIMAL" -gt "$BLOCK1_DECIMAL" ]; then
        log_success "Block production test passed: $BLOCK1_DECIMAL → $BLOCK2_DECIMAL"
    else
        log_error "Block production test failed. Blocks not advancing."
        return 1
    fi

    # Test initial balance
    echo "🔍 Testing initial balance..."
    BALANCE=$(curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x0Ac00d552Ef4B7e9326Fe5094707419daF4E4169","latest"],"id":1}' \
        http://localhost:8555 | jq -r '.result')

    if [ "$BALANCE" = "0x33b2e3c9fd0803ce8000000" ]; then
        log_success "Initial balance test passed: 1 billion BAK"
    else
        log_error "Initial balance test failed. Expected 0x33b2e3c9fd0803ce8000000, got $BALANCE"
        return 1
    fi

    echo ""
    log_success "All tests passed! Chain ID 1236 blockchain is working correctly."
}

# Function to show help
show_help() {
    show_header
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start     Start the blockchain"
    echo "  stop      Stop the blockchain"
    echo "  restart   Restart the blockchain"
    echo "  status    Show blockchain status"
    echo "  logs      Show logs (optional: specify node name)"
    echo "  test      Test blockchain functionality"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start the blockchain"
    echo "  $0 logs                     # Show all logs"
    echo "  $0 logs besu-node1-1236     # Show logs for specific node"
    echo "  $0 test                     # Test blockchain"
    echo ""
    echo "Node Names:"
    echo "  besu-node1-1236  (Port: 8555)"
    echo "  besu-node2-1236  (Port: 8557)"
    echo "  besu-node3-1236  (Port: 8559)"
    echo "  besu-node4-1236  (Port: 8561)"
    echo ""
}

# Main script logic
main() {
    check_docker

    case "${1:-help}" in
        start)
            show_header
            start_blockchain
            ;;
        stop)
            show_header
            stop_blockchain
            ;;
        restart)
            show_header
            restart_blockchain
            ;;
        status)
            show_header
            show_status
            ;;
        logs)
            show_header
            show_logs "$2"
            ;;
        test)
            show_header
            test_blockchain
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"