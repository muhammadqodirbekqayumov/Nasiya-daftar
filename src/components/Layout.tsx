import { Outlet, Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, User, Plus, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/DataContext"
import { CustomerDialog } from "@/components/CustomerDialog"

export default function Layout() {
    const location = useLocation()
    const { settings } = useData()

    const navItems = [
        { icon: LayoutDashboard, label: "Asosiy", path: "/" },
        { icon: Users, label: "Mijozlar", path: "/customers" },
    ]

    const rightNavItems = [
        { icon: FileText, label: "Hisobot", path: "/settings" },
        { icon: User, label: "Profil", path: "/settings" },
    ]

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 font-sans selection:bg-primary/20 pb-24 md:pb-0 md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden w-72 border-r bg-white md:block z-50">
                <div className="flex flex-col px-8 py-6 border-b border-slate-100">
                    <span className="font-extrabold text-2xl text-slate-800">
                        {settings.storeName || "Nasiya Daftar"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        Egasi: {settings.ownerName || "Boshqaruvchi"}
                    </span>
                </div>
                <nav className="flex flex-col gap-2 p-6">
                    {[...navItems, ...rightNavItems].map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-4 rounded-xl px-4 py-3 text-slate-500 transition-all hover:text-primary hover:bg-slate-50 font-medium",
                                location.pathname === item.path && "bg-primary/5 text-primary"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile Header */}
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-md px-4 md:hidden shadow-sm">
                <div className="flex flex-col">
                    <span className="font-bold text-lg text-slate-900 leading-tight">
                        {settings.storeName || "Nasiya Daftar"}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                        Egasi: {settings.ownerName}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Optional: Add button or profile icon here if needed */}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full animate-in fade-in duration-500">
                <Outlet />
            </main>

            {/* Custom Bottom Bar - FAB Style */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 pb-safe md:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between px-2 h-16 relative">

                    {/* Left Items */}
                    <div className="flex flex-1 justify-around">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                                    location.pathname === item.path ? "text-primary" : "text-slate-400"
                                )}
                            >
                                <item.icon className={cn("h-6 w-6", location.pathname === item.path && "fill-current")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Center FAB */}
                    <div className="relative -top-6">
                        <div className="absolute inset-0 bg-slate-50 rounded-full -m-2"></div> {/* Cutout illusion */}
                        <CustomerDialog
                            trigger={
                                <button className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                                    <Plus className="h-8 w-8" />
                                </button>
                            }
                        />
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-400">Yangi</span>
                    </div>

                    {/* Right Items */}
                    <div className="flex flex-1 justify-around">
                        {rightNavItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                                    location.pathname === item.path ? "text-primary" : "text-slate-400"
                                )}
                            >
                                <item.icon className={cn("h-6 w-6", location.pathname === item.path && "fill-current")} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                </div>
            </nav>
        </div>
    )
}
