import Link from 'next/link'
import { SOCIAL_LINKS } from '@/utils/config'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-brainark-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-xl font-bold gradient-text">BrainArk</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-md">
              Building the future of decentralized finance with our native EVM-compatible 
              blockchain powered by Hyperledger Besu.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link
                href={SOCIAL_LINKS.TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brainark-500 transition-colors duration-200"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link
                href={SOCIAL_LINKS.TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brainark-500 transition-colors duration-200"
              >
                <span className="sr-only">Telegram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/airdrop" className="text-gray-600 dark:text-gray-300 hover:text-brainark-500 dark:hover:text-brainark-400 transition-colors duration-200">
                  Airdrop
                </Link>
              </li>
              <li>
                <Link href="/epo" className="text-gray-600 dark:text-gray-300 hover:text-brainark-500 dark:hover:text-brainark-400 transition-colors duration-200">
                  EPO
                </Link>
              </li>
              <li>
                <Link href="/whitepaper" className="text-gray-600 dark:text-gray-300 hover:text-brainark-500 dark:hover:text-brainark-400 transition-colors duration-200">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link 
                  href="http://localhost:3001" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-brainark-500 dark:hover:text-brainark-400 transition-colors duration-200"
                >
                  Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* Network Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Network
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Chain ID:</span> 424242
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Symbol:</span> BAK
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">RPC:</span> https://rpc.brainark.online
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Consensus:</span> IBFT
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2024 BrainArk. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-brainark-500 dark:hover:text-brainark-400 text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-500 dark:text-gray-400 hover:text-brainark-500 dark:hover:text-brainark-400 text-sm transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}