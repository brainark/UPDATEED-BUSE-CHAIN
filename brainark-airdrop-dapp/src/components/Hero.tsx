import { ArrowRightIcon, GiftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

interface HeroProps {
  onNavigateToSection?: (section: string) => void
}

export default function Hero({ onNavigateToSection }: HeroProps = {}) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32 bg-deep-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-80" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              BrainArk
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            Join the future of decentralized finance with our native EVM-compatible blockchain. 
            Claim your airdrop and participate in our Early Public Offering.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              className="btn-airdrop inline-flex items-center text-lg px-8 py-4"
              onClick={() => {
                if (onNavigateToSection) {
                  onNavigateToSection('airdrop')
                } else {
                  // Fallback to custom event
                  const event = new CustomEvent('navigate-to-section', { detail: 'airdrop' });
                  window.dispatchEvent(event);
                }
              }}
            >
              <GiftIcon className="h-6 w-6 mr-2" />
              Join Airdrop
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
            
            <button
              className="btn-epo inline-flex items-center text-lg px-8 py-4"
              onClick={() => {
                if (onNavigateToSection) {
                  onNavigateToSection('epo')
                } else {
                  const event = new CustomEvent('navigate-to-section', { detail: 'epo' });
                  window.dispatchEvent(event);
                }
              }}
            >
              <CurrencyDollarIcon className="h-6 w-6 mr-2" />
              Join EPO
            </button>

            <button
              className="btn-usecases inline-flex items-center text-lg px-8 py-4"
              onClick={() => {
                if (onNavigateToSection) {
                  onNavigateToSection('usecases')
                } else {
                  const event = new CustomEvent('navigate-to-section', { detail: 'usecases' });
                  window.dispatchEvent(event);
                }
              }}
            >
              🚀 50 Use Cases
            </button>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card-brilliant p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎁</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                10M BAK Airdrop
              </h3>
              <p className="text-gray-600">
                Get 10 BAK tokens for free plus earn 3.2 BAK for each successful referral
              </p>
            </div>

            <div className="card-brilliant p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                $0.02 per BAK
              </h3>
              <p className="text-gray-600">
                Early Public Offering with fixed price. Pay with ETH, USDT, USDC, or BNB
              </p>
            </div>

            <div className="card-brilliant p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Native Blockchain
              </h3>
              <p className="text-gray-600">
                Built on Hyperledger Besu with IBFT consensus for fast, secure transactions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full opacity-10 animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 animate-pulse-glow" />
      </div>
    </section>
  )
}