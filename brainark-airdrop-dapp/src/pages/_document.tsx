import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="theme-color" content="#f59332" />
        <meta name="description" content="BrainArk Airdrop & EPO - Join the future of decentralized finance" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BrainArk Airdrop & EPO" />
        <meta property="og:description" content="Join the BrainArk ecosystem. Claim your airdrop tokens and participate in our Early Public Offering (EPO)." />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BrainArk Airdrop & EPO" />
        <meta name="twitter:description" content="Join the BrainArk ecosystem. Claim your airdrop tokens and participate in our Early Public Offering (EPO)." />
        <meta name="twitter:image" content="/og-image.png" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}