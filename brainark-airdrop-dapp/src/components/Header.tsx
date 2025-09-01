import { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import AutoWalletConnection from './AutoWalletConnection'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: '🏠 Home', href: '/' },
    { name: '🎁 Airdrop', href: '/airdrop' },
    { name: '🦄 EPO', href: '/epo' },
    { name: '🚀 Use Cases', href: '/use-cases' },
    { name: '🔍 Explorer', href: '/explorer' },
    { name: '📄 Whitepaper', href: '/whitepaper' },
    { name: '⚡ Benchmark', href: '/benchmark' },
  ]

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-brainark-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold gradient-text">BrainArk</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-brainark-500 dark:hover:text-brainark-400 font-medium transition-colors duration-200 whitespace-nowrap text-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Connect Button */}
          <div className="hidden lg:block">
            <AutoWalletConnection />
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              className="text-gray-700 dark:text-gray-300 hover:text-brainark-500 dark:hover:text-brainark-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 mobile-menu">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-3 px-2 text-center text-gray-700 dark:text-gray-300 hover:text-brainark-500 dark:hover:text-brainark-400 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 flex justify-center">
              <AutoWalletConnection />
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}