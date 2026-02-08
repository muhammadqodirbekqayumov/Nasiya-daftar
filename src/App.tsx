import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { DataProvider, useData } from "@/contexts/DataContext"
import Layout from "./components/Layout"
import AdminLayout from "./components/AdminLayout"
import Dashboard from "./pages/Dashboard"
import Customers from "./pages/Customers"
import CustomerDetails from "./pages/CustomerDetails"
import TransactionsPage from "./pages/TransactionsPage"
import Settings from "./pages/Settings"
import Reports from "./pages/Reports"
import Login from "./pages/Login"
import AdminDashboard from "./pages/AdminDashboard"

// Protect routes that require authentication
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useData()
  const location = useLocation()

  if (!user) {
    // Redirect to login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.isBlocked && user.email !== "admin@nasiya.uz") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl space-y-6">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hisobingiz vaqtincha bloklandi</h1>
            <p className="text-slate-500 mt-2">
              To'lov muddati tugaganligi sababli tizimga kirish cheklandi.
              Faollashtirish uchun admin bilan bog'laning.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <a
              href="https://t.me/QayumovMuhammadqodirbek"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full gap-2 p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              Telegram Orqali Yozish
            </a>
            <a
              href="tel:+998907707806"
              className="flex items-center justify-center w-full gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .57 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.57A2 2 0 0 1 22 16.92z" /></svg>
              Qo'ng'iroq qilish: +998 90 770 78 06
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <AuthGuard>
                <Layout />
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<Settings />} />
            {/* If we want admin settings to be under /admin/settings, we'd need a new route or just reuse /settings but separate URL. 
                 For now, let's keep it simple. The user asked for "admin layout".
                 If I put Settings here, the path would be /admin/settings?
                 The `AdminLayout` has a link to `/settings`. 
                 If `/settings` is clicked, it matches the USER layout route above.
                 So effectively clicking "Sozlamalar" in Admin Panel will switch to User Layout?
                 That breaks the "distinct" requirement.
                 I should probably mount `Settings` under `/admin` as well OR make `/settings` smart about which layout to use.
                 Easier: specific admin settings route or just render Settings component here.
              */}
            {/* Actually, let's just make the AdminLayout link to /admin/settings if we want it to stay in admin layout.
                  But Settings page might rely on context that is global.
                  Let's try to map /settings to AdminLayout too if user is admin?
                  Or just add a route here. 
               */}
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </DataProvider>
  )
}

export default App
