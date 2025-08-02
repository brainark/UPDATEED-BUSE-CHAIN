import Head from 'next/head'
import Layout from '@/components/Layout'
import EPOSection from '@/components/EPOSection'
import TradingPanel from '@/components/TradingPanel'

export default function EPOPage() {
  return (
    <>
      <Head>
        <title>BrainArk EPO - Early Public Offering</title>
        <meta name="description" content="Participate in BrainArk's Early Public Offering. Buy BAK tokens at $0.02 each with ETH, USDT, USDC, or BNB." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <main className="min-h-screen py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* EPO Section */}
              <div className="lg:col-span-2">
                <EPOSection />
              </div>
              
              {/* Trading Panel */}
              <div className="lg:col-span-1">
                <TradingPanel />
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  )
}