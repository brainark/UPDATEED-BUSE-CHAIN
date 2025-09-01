# Using Elegant Buttons and Tabs with Framer Motion + Tailwind

This guide explains how to use and customize the elegant UI components created for the BrainArk DApp.

## 🚀 Getting Started

First, make sure you have the required dependencies installed:

```bash
npm install framer-motion
# Tailwind is already installed in your project
```

## 📂 Component Overview

We've created several reusable UI components:

1. **ElegantButton** - Modern, animated buttons with multiple variants
2. **GlowButton** - Buttons with attractive glow effects
3. **AnimatedTabs** - Tab components with smooth transitions
4. **UIShowcase** - Example implementation of all components

## 🎛️ Using the Button Components

### ElegantButton

```tsx
import { ElegantButton } from '@/components/ui/ElegantButton';

// Basic usage
<ElegantButton 
  text="Connect Wallet" 
  onClick={() => connectWallet()} 
/>

// With variants
<ElegantButton 
  text="Purchase Tokens" 
  variant="gradient"  // 'primary', 'secondary', 'outline', or 'gradient'
  size="lg"          // 'sm', 'md', or 'lg'
  isLoading={isPurchasing}
  disabled={!isConnected}
  fullWidth
/>

// With icon
<ElegantButton 
  text="Copy Address" 
  icon={<CopyIcon className="w-4 h-4" />}
  variant="outline"
/>
```

### GlowButton

```tsx
import { GlowButton } from '@/components/ui/GlowButton';

// Basic usage
<GlowButton 
  text="Claim Airdrop" 
  onClick={handleClaim} 
/>

// With glow effects
<GlowButton 
  text="Join EPO" 
  glow="purple"  // 'blue', 'purple', 'green', or 'multi'
  size="lg"     // 'sm', 'md', or 'lg'
/>
```

## 📑 Using the Tabs Component

```tsx
import { AnimatedTabs } from '@/components/ui/AnimatedTabs';

// Define your tabs
const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    content: <OverviewComponent />
  },
  {
    id: 'transactions',
    label: 'Transactions',
    content: <TransactionsComponent />
  },
  {
    id: 'settings',
    label: 'Settings',
    content: <SettingsComponent />
  }
];

// Use the tabs component
<AnimatedTabs 
  tabs={tabs} 
  variant="underline"  // 'underline', 'pills', 'gradient', or 'blocks'
  onChange={(tabId) => console.log(`Tab changed to ${tabId}`)}
/>
```

## 🎨 Customizing with Tailwind

All components accept a `className` prop for additional Tailwind customization:

```tsx
<ElegantButton 
  text="Custom Button" 
  className="rounded-full border-dashed"
/>

<AnimatedTabs
  tabs={myTabs}
  className="max-w-xl mx-auto"
/>
```

## 📱 Mobile Responsiveness

These components are fully responsive and work well on mobile devices:

- Buttons adapt their size appropriately
- Tabs become scrollable on small screens
- Touch targets meet accessibility guidelines

## 🔍 Viewing the Showcase

Visit `/ui-components` in your DApp to see all components in action:

```
https://your-dapp-url.com/ui-components
```

## 🛠️ Integration Examples

### EPO Section Example

```tsx
// In EPOSection.tsx
import { ElegantButton } from '@/components/ui/ElegantButton';
import { AnimatedTabs } from '@/components/ui/AnimatedTabs';

export default function EPOSection() {
  // Define tabs for different sections
  const epoTabs = [
    {
      id: 'purchase',
      label: '💰 Purchase',
      content: <PurchaseForm />
    },
    {
      id: 'stats',
      label: '📊 Stats',
      content: <EPOStats />
    },
    {
      id: 'history',
      label: '📜 History',
      content: <TransactionHistory />
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">BrainArk Early Public Offering</h1>
      
      <AnimatedTabs tabs={epoTabs} variant="blocks" />
      
      {/* Call-to-action button at bottom */}
      <div className="mt-8 text-center">
        <ElegantButton 
          text="Connect to participate" 
          variant="gradient"
          size="lg"
          onClick={handleConnect}
          icon={<WalletIcon />}
        />
      </div>
    </div>
  );
}
```

### Airdrop Section Example

```tsx
// In AirdropSection.tsx
import { GlowButton } from '@/components/ui/GlowButton';
import { AnimatedTabs } from '@/components/ui/AnimatedTabs';

export default function AirdropSection() {
  // Implementation...
  
  return (
    <div>
      <AnimatedTabs tabs={airdropTabs} variant="pills" />
      
      <div className="mt-6">
        <GlowButton 
          text="Claim Airdrop" 
          glow="multi"
          disabled={!canClaim}
          onClick={handleClaim}
        />
      </div>
    </div>
  );
}
```
