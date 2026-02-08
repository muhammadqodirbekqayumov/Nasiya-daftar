import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { ShieldCheck, LogOut, LayoutDashboard, Settings, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export default function AdminLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useData()
    const [open, setOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const navItems = [
        { icon: LayoutDashboard, label: "Boshqaruv", path: "/admin" },
        { icon: Settings, label: "Sozlamalar", path: "/admin/settings" },
    ]

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">Admin</h1>
                        <p className="text-xs text-slate-500 font-medium">Control Panel</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-colors",
                                isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-3 rounded-xl h-12"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Chiqish
                </Button>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 bg-white border-r border-slate-200 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
                <NavContent />
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900">Admin</span>
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                            <Menu className="h-6 w-6 text-slate-600" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 border-r-0">
                        <NavContent />
                    </SheetContent>
                </Sheet>
            </header>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
