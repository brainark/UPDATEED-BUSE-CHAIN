import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import ConnectionStatus from './ConnectionStatus'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-deep-black">
      <Header />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <ConnectionStatus />
    </div>
  )
}