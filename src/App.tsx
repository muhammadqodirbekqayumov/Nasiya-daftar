import React from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { DataProvider, useData } from "@/contexts/DataContext"
import { Toaster } from "@/components/ui/sonner"
import Layout from "@/components/Layout"
import Dashboard from "@/pages/Dashboard"
import Customers from "@/pages/Customers"
import CustomerDetails from "@/pages/CustomerDetails"
import SettingsPage from "@/pages/Settings"
import Onboarding from "@/pages/Onboarding"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { settings } = useData()
  const location = useLocation()

  // Check if store name is set (as a proxy for setup completed, or use isSetupCompleted flag)
  if (!settings.isSetupCompleted) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />
  }

  return children
}

function AppContent() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:customerId" element={<CustomerDetails />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Toaster />
    </DataProvider>
  )
}

export default App
