import { Outlet, Link, useLocation } from "react-router-dom"
import { Users, LayoutGrid, FileText, User, ShieldCheck, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/DataContext"
import { CustomerDialog } from "@/components/CustomerDialog"
import { MobileMenu } from "@/components/MobileMenu"
import { NotificationDialog } from "@/components/NotificationDialog"

export default function Layout() {
    const location = useLocation()
    const { settings, user } = useData()

    // Navigation Items
    const navItems = [
        { icon: LayoutGrid, label: "Asosiy", path: "/" },
        { icon: Users, label: "Mijozlar", path: "/customers" },
    ]

    const rightNavItems = [
        { icon: FileText, label: "Hisobot", path: "/reports" },
        { icon: User, label: "Profil", path: "/settings" },
    ]

    // Admin Navigation Items - COMPLETELY DIFFERENT
    const adminNavItems = [
        { icon: ShieldCheck, label: "Boshqaruv", path: "/admin" },
        // Admin doesn't need "Mijozlar" (Shops are in Boshqaruv) or "Hisobot" (Global stats in Boshqaruv)
        { icon: User, label: "Sozlamalar", path: "/settings" },
    ]

    // Filter items based on role
    const currentNavItems = user?.email === "admin@nasiya.uz" ? adminNavItems : navItems

    return (
        <div className="flex min-h-screen flex-col bg-slate-50/50 font-sans selection:bg-primary/20 pb-24 md:pb-0 md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 bg-white border-r border-slate-200">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <img 
                            src="/logo.png" 
                            alt="Logo" 
                            className="h-10 w-10 object-contain rounded-lg"
                        />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            {user?.email === "admin@nasiya.uz" ? "Admin Panel" : "Nasiya Daftar"}
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {currentNavItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/25 translate-x-1"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Mobile Header - Simple & Clean */}
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white/95 backdrop-blur px-4 md:hidden">
                <div className="flex items-center gap-2">
                    {settings.profileImage ? (
                        <img src={settings.profileImage} alt="Store Logo" className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                        <img src="/logo.png" alt="App Logo" className="h-8 w-8 rounded-lg object-contain" />
                    )}
                    <span className="font-bold text-lg text-slate-900">
                        {settings.storeName || "Nasiya Daftar"}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <NotificationDialog />
                    <MobileMenu />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 md:ml-64 overflow-y-auto w-full max-w-7xl mx-auto min-h-[calc(100vh-140px)]">
                <Outlet />
            </main>

            {/* Professional Bottom Bar with Curved Notch */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)] md:hidden">
                <div className="flex items-center justify-between px-2 h-[65px] relative">

                    {/* Left Items */}
                    <div className="flex flex-1 justify-around">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors active:scale-95",
                                    location.pathname === item.path ? "text-primary" : "text-slate-400"
                                )}
                            >
                                <item.icon className={cn("h-6 w-6", location.pathname === item.path && "fill-current")} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Center FAB Container - Floating above */}
                    <div className="relative -top-8 w-20 flex justify-center pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                            <CustomerDialog
                                trigger={
                                    <button className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30 active:scale-95 transition-all hover:scale-110 hover:shadow-blue-600/50">
                                        <Plus className="h-7 w-7" />
                                    </button>
                                }
                            />
                        </div>
                    </div>

                    {/* Right Items */}
                    <div className="flex flex-1 justify-around">
                        {rightNavItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors active:scale-95",
                                    location.pathname === item.path ? "text-primary" : "text-slate-400"
                                )}
                            >
                                <item.icon className={cn("h-6 w-6", location.pathname === item.path && "fill-current")} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    )
}
