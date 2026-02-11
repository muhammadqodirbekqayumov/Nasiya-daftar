import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, LayoutDashboard, Users, FileText, Settings } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useData } from "@/contexts/DataContext"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MobileMenu() {
    const { settings } = useData()
    const location = useLocation()

    const menuItems = [
        { icon: LayoutDashboard, label: "Asosiy", path: "/" },
        { icon: Users, label: "Mijozlar", path: "/customers" },
        { icon: FileText, label: "Hisobotlar", path: "/reports" },
        { icon: FileText, label: "Harakatlar Tarixi", path: "/transactions" },
        { icon: Settings, label: "Sozlamalar", path: "/settings" },
    ]

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6 text-slate-700" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader className="text-left mb-6">
                    <SheetTitle className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {settings.storeName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-bold text-lg">{settings.storeName}</div>
                            <div className="text-xs text-muted-foreground font-normal">Administrator</div>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full">
                    <nav className="flex flex-col gap-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                                    location.pathname === item.path
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <Separator className="my-6" />

                    <div className="mt-auto pb-8">
                        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-100">
                            <Avatar className="h-10 w-10 border border-slate-200">
                                <AvatarImage src={settings.profileImage} />
                                <AvatarFallback className="bg-slate-200 text-slate-500">
                                    <UserIcon />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{settings.ownerName}</p>
                                <p className="text-xs text-slate-500 truncate">+998 {settings.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

function UserIcon() {
    return (
        <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
        </svg>
    )
}
