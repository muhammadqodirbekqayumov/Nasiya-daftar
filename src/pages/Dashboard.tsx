import { Link } from "react-router-dom"
import { useData } from "@/contexts/DataContext"
import { Card, CardContent } from "@/components/ui/card"
import { Overview } from "@/components/Overview"
import { RecentTransactions } from "@/components/RecentTransactions"
import { Users, DollarSign, Activity, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Dashboard() {
    const { customers, transactions, formatCurrency, settings } = useData()

    const totalDebt = transactions
        .filter((t) => t.type === "debt")
        .reduce((acc, t) => acc + t.amount, 0)

    const totalPaid = transactions
        .filter((t) => t.type === "payment")
        .reduce((acc, t) => acc + t.amount, 0)

    const netBalance = totalDebt - totalPaid

    const StatCard = ({ title, value, icon: Icon, to, colorClass, trend }: any) => (
        <Link to={to} className="group block h-full">
            <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
                <CardContent className="p-5 flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <h3 className={cn("text-2xl font-bold tracking-tight text-slate-900")}>
                            {value}
                        </h3>
                        {trend && (
                            <div className="flex items-center gap-1 mt-1 text-xs font-medium">
                                <span className={cn("flex items-center gap-0.5", trend === "up" ? "text-emerald-600" : "text-rose-600")}>
                                    {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {trend === "up" ? "+12%" : "+4.5%"}
                                </span>
                                <span className="text-muted-foreground">o'tgan oyga nisbatan</span>
                            </div>
                        )}
                    </div>
                    <div className={cn("p-3 rounded-xl", colorClass)}>
                        <Icon className={cn("h-6 w-6", colorClass.replace("bg-", "text-").replace("/10", ""))} />
                    </div>
                </CardContent>
            </Card>
        </Link>
    )

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24">
            {/* Header Section - Minimal */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Boshqaruv Paneli</h1>
                    <p className="text-slate-500 text-sm">Do'kon: <span className="font-semibold text-slate-700">{settings.storeName}</span></p>
                </div>
                <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                    {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Jami Nasiya"
                    value={formatCurrency(totalDebt)}
                    icon={DollarSign}
                    to="/customers?filter=debt"
                    colorClass="bg-rose-100 text-rose-600"
                    trend="down"
                />
                <StatCard
                    title="Undirilgan"
                    value={formatCurrency(totalPaid)}
                    icon={Activity}
                    to="#"
                    colorClass="bg-emerald-100 text-emerald-600"
                    trend="up"
                />
                <StatCard
                    title="Kutilayotgan"
                    value={formatCurrency(netBalance)}
                    icon={TrendingUp}
                    to="/customers?filter=debt"
                    colorClass="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Mijozlar"
                    value={customers.length}
                    icon={Users}
                    to="/customers"
                    colorClass="bg-indigo-100 text-indigo-600"
                />
            </div>

            {/* Charts & Lists */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-slate-200 shadow-sm h-full">
                    <div className="p-6 pb-0">
                        <h3 className="text-lg font-semibold text-slate-900">Moliyaviy Oqim</h3>
                    </div>
                    <div className="p-6 pt-4">
                        <Overview />
                    </div>
                </Card>

                {/* Recent Activity */}
                <div className="h-full">
                    <RecentTransactions limit={6} />
                </div>
            </div>
        </div>
    )
}
