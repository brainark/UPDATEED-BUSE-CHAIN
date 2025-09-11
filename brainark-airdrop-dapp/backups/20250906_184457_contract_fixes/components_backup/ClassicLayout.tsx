import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import ConnectionStatus from './ConnectionStatus'

interface ClassicLayoutProps {
  children: ReactNode
}

export default function ClassicLayout({ children }: ClassicLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-deep-black">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-gray-800 shadow-2xl p-6">
          {children}
        </div>
      </main>
      <Footer />
      <ConnectionStatus />
    </div>
  )
}
