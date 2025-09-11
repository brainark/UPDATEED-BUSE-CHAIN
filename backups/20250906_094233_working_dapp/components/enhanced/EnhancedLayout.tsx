import React from 'react'

interface EnhancedLayoutProps {
  children: React.ReactNode
}

export const EnhancedLayout: React.FC<EnhancedLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Global Styles */}
      <style jsx global>{`
        /* Custom Scrollbar */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Custom Animations */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        /* Glassmorphism Effect */
        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        /* Enhanced Button Styles */
        .btn-airdrop {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
        }
        
        .btn-epo {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          color: white;
        }
        
        .btn-explorer {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          color: white;
        }
        
        .btn-whitepaper {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: white;
        }
      `}</style>
      
      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="relative bg-black/50 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 BrainArk. All rights reserved.</p>
            <p className="mt-2 text-sm">Building the future of decentralized intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
