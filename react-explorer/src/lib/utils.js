import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address) {
  if (!address) return "Not connected"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatBalance(balance, decimals = 18) {
  if (!balance) return "0"
  const formatted = parseFloat(balance) / Math.pow(10, decimals)
  return formatted.toFixed(4)
}

export function formatTxHash(hash) {
  if (!hash) return ""
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // You can add a toast notification here
    console.log('Copied to clipboard:', text)
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}