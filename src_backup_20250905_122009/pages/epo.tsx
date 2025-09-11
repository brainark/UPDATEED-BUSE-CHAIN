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
        <main className="min-h-screen py-4 sm:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* EPO Section */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <EPOSection />
              </div>
              
              {/* Trading Panel - Shows first on mobile */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="sticky top-4">
                  <TradingPanel />
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  )
}