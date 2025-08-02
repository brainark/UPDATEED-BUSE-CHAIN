import Head from 'next/head'
import Layout from '@/components/Layout'
import AirdropSection from '@/components/AirdropSection'

export default function AirdropPage() {
  return (
    <>
      <Head>
        <title>BrainArk Airdrop - Claim Your Tokens</title>
        <meta name="description" content="Claim your BrainArk airdrop tokens. Complete social tasks and earn referral bonuses." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <main className="min-h-screen py-8">
          <AirdropSection />
        </main>
      </Layout>
    </>
  )
}