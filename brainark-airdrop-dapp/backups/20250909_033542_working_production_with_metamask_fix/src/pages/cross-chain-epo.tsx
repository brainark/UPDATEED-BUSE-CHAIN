import React from 'react'
import Layout from '../components/Layout'
import EnhancedCrossChainEPO from '../components/EnhancedCrossChainEPO'

export default function CrossChainEPOPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <EnhancedCrossChainEPO />
      </div>
    </Layout>
  )
}