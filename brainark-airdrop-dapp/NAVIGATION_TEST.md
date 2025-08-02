# Navigation Test Guide

## Testing the "Join Airdrop" Button

### What I Fixed:

1. **Hero Component Navigation**: Updated the "Join Airdrop" button to properly call the navigation function
2. **Index Page Event Handling**: Added proper event listeners and direct function passing
3. **Airdrop Component**: Replaced wagmi dependency with direct state management using AutoWalletConnection

### How to Test:

1. **Start your development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Open your browser** and go to `http://localhost:3000` (or your dev port)

3. **Test Navigation**:
   - You should see the homepage with the Hero section
   - Click the "🎁 Join Airdrop" button
   - It should immediately switch to the airdrop tab
   - You should see the airdrop page with:
     - "🎁 BrainArk Airdrop" header
     - Stats showing "10 BAK per User", "3.2 BAK per Referral", "10M Total Pool"
     - "Connect Your Wallet" section

4. **Test Wallet Connection**:
   - Click the wallet connection button
   - You should see either:
     - "⚠️ Switch to BrainArk" (if on wrong network)
     - Connection process if MetaMask is available

### Expected Flow:

```
Homepage (Hero) 
    ↓ (Click "Join Airdrop")
Airdrop Tab
    ↓ (Connect Wallet)
Wallet Connection
    ↓ (If wrong network)
Network Switch Prompt
    ↓ (After connection)
Social Tasks Section
```

### Debug Information:

If the navigation doesn't work, check the browser console for:
- Navigation events being fired
- Component mounting/unmounting
- Any JavaScript errors

### Manual Navigation Test:

You can also test navigation manually by:
1. Clicking the "🎁 Airdrop" tab in the top navigation
2. This should show the same airdrop page

### What You Should See:

When the airdrop tab loads, you should see exactly what you described:
- **🎁 BrainArk Airdrop** header
- Subtitle: "Complete social tasks, get verified, and claim your free BAK tokens..."
- Three stats cards: **10** BAK per User, **3.2** BAK per Referral, **10M** Total Pool
- **Connect Your Wallet** section
- If wallet shows wrong network: **⚠️ Switch to BrainArk** with "Current: Chain 31337 | Need: Chain 424242"

### Troubleshooting:

If you don't see the airdrop tab:
1. Check browser console for errors
2. Verify the component files are saved
3. Restart your development server
4. Clear browser cache

The navigation should now work perfectly!