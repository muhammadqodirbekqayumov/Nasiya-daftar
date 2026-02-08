import { Link } from "react-router-dom"
import { useData } from "@/contexts/DataContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/Overview"
import { RecentTransactions } from "@/components/RecentTransactions"
import { Users, DollarSign, Activity, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Dashboard() {
    const { customers, transactions, formatCurrency } = useData()

    const totalDebt = transactions
        .filter((t) => t.type === "debt")
        .reduce((acc, t) => acc + t.amount, 0)

    const totalPaid = transactions
        .filter((t) => t.type === "payment")
        .reduce((acc, t) => acc + t.amount, 0)

    const netBalance = totalDebt - totalPaid

    const StatCard = ({ title, value, icon: Icon, to, colorClass, subtitle }: any) => (
        <Link to={to} className="group block h-full">
            <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/50 backdrop-blur-sm overflow-hidden relative">
                <div className={cn("absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500", colorClass)}>
                    <Icon className="h-24 w-24" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className={cn("p-2 rounded-full bg-opacity-20", colorClass.replace("text-", "bg-"))}>
                        <Icon className={cn("h-4 w-4", colorClass)} />
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className={cn("text-2xl font-bold tracking-tight", colorClass)}>{value}</div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {subtitle}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Xush kelibsiz! 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    Bugungi biznesingiz holati qanday?
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Jami Qarz"
                    value={formatCurrency(totalDebt)}
                    icon={DollarSign}
                    to="/customers?filter=debt"
                    colorClass="text-rose-600"
                    subtitle="Umumiy berilgan nasiya"
                />
                <StatCard
                    title="Undirilgan"
                    value={formatCurrency(totalPaid)}
                    icon={Activity}
                    to="#"
                    colorClass="text-emerald-600"
                    subtitle="Muvaffaqiyatli to'lovlar"
                />
                <StatCard
                    title="Qoldiq Balans"
                    value={formatCurrency(netBalance)}
                    icon={TrendingUp}
                    to="/customers?filter=debt"
                    colorClass="text-blue-600"
                    subtitle="Kutilayotgan tushum"
                />
                <StatCard
                    title="Mijozlar"
                    value={customers.length}
                    icon={Users}
                    to="/customers"
                    colorClass="text-indigo-600"
                    subtitle="Faol mijozlar bazasi"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-lg bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Moliyaviy Tahlil</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview />
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-none shadow-lg bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">So'nggi Faoliyat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentTransactions />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
