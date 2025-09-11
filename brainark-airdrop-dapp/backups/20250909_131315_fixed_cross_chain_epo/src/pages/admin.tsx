import React from 'react'
import AdminRoute from '../components/AdminRoute'
import AdminTreasuryDashboard from '../components/AdminTreasuryDashboard'

const AdminPage: React.FC = () => {
  return (
    <AdminRoute>
      <AdminTreasuryDashboard />
    </AdminRoute>
  )
}

export default AdminPage