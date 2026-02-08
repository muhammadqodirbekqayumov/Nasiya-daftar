import { useState, useRef } from "react"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { startOfDay, startOfWeek, startOfMonth, isAfter } from "date-fns"
import { cn } from "@/lib/utils"

type TimeRange = "today" | "week" | "month" | "all"

export default function Reports() {
    const { customers, transactions, formatCurrency, settings } = useData()
    const [timeRange, setTimeRange] = useState<TimeRange>("month")
    const componentRef = useRef<HTMLDivElement>(null)

    // Filter Logic
    const filteredTransactions = transactions.filter(t => {
        if (timeRange === "all") return true

        const date = new Date(t.date)
        const now = new Date()

        if (timeRange === "today") {
            return isAfter(date, startOfDay(now))
        }
        if (timeRange === "week") {
            return isAfter(date, startOfWeek(now, { weekStartsOn: 1 }))
        }
        if (timeRange === "month") {
            return isAfter(date, startOfMonth(now))
        }
        return true
    })

    // Calculations
    const totalDebt = filteredTransactions
        .filter(t => t.type === 'debt')
        .reduce((sum, t) => sum + t.amount, 0)

    const totalPaid = filteredTransactions
        .filter(t => t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0)

    const netChange = totalDebt - totalPaid

    // Chart Data Preparation
    const chartData = [
        { name: "Berilgan Qarz", amount: totalDebt, color: "#f43f5e" },
        { name: "Undirilgan", amount: totalPaid, color: "#10b981" },
    ]

    // Top Debtors Logic (for the selected period)
    const periodDebtors = customers.map(c => {
        const debt = filteredTransactions.filter(t => t.customerId === c.id && t.type === 'debt').reduce((a, b) => a + b.amount, 0)
        const paid = filteredTransactions.filter(t => t.customerId === c.id && t.type === 'payment').reduce((a, b) => a + b.amount, 0)
        return {
            ...c,
            periodDebt: debt,
            periodPaid: paid,
            periodBalance: debt - paid
        }
    }).filter(c => c.periodDebt > 0 || c.periodPaid > 0).sort((a, b) => b.periodBalance - a.periodBalance)


    const handlePrint = () => {
        window.print()
    }

    const FilterButton = ({ label, value }: { label: string, value: TimeRange }) => (
        <Button
            variant={timeRange === value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(value)}
            className="flex-1 sm:flex-none"
        >
            {label}
        </Button>
    )

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-24">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <FilterButton label="Bugun" value="today" />
                    <FilterButton label="Bu Hafta" value="week" />
                    <FilterButton label="Bu Oy" value="month" />
                    <FilterButton label="Barchasi" value="all" />
                </div>
                <Button onClick={handlePrint} variant="outline" className="gap-2 w-full sm:w-auto">
                    <Printer className="h-4 w-4" />
                    Chop etish
                </Button>
            </div>

            <div ref={componentRef} className="space-y-6 print-container">
                {/* Header for Print */}
                <div className="hidden print:block text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">{settings.storeName}</h1>
                    <p className="text-slate-500">Moliyaviy Hisobot ({timeRange === 'today' ? 'Bugungi' : timeRange === 'week' ? 'Haftalik' : timeRange === 'month' ? 'Oylik' : 'Umumiy'})</p>
                    <p className="text-sm text-slate-400">{new Date().toLocaleDateString('uz-UZ')}</p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-rose-100 bg-rose-50/30">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-rose-600">Berilgan Qarz</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalDebt)}</div>
                            <p className="text-xs text-slate-500 mt-1">Tanlangan davr uchun</p>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-emerald-50/30">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-emerald-600">Undirilgan</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalPaid)}</div>
                            <p className="text-xs text-slate-500 mt-1">Tanlangan davr uchun</p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-100 bg-blue-50/30">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium text-blue-600">Sof O'zgarish</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{formatCurrency(netChange)}</div>
                            <p className="text-xs text-slate-500 mt-1">Qarz - To'lov</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Moliyaviy Tahlil</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748B', fontSize: 12 }}
                                        />
                                        <YAxis
                                            hide={true}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F1F5F9' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value: any) => [formatCurrency(Number(value || 0)) as string, 'Summa']}
                                        />
                                        <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={80}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Faol Mijozlar ({timeRange === 'today' ? 'Bugun' : timeRange === 'week' ? 'Bu hafta' : timeRange === 'month' ? 'So\'nggi 30 kun' : 'Umumiy'})</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-4">
                                {periodDebtors.slice(0, 5).map((customer) => (
                                    <div key={customer.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{customer.name}</span>
                                            <span className="text-xs text-slate-500">
                                                +{formatCurrency(customer.periodDebt)} / -{formatCurrency(customer.periodPaid)}
                                            </span>
                                        </div>
                                        <span className={cn(
                                            "font-bold text-sm",
                                            customer.periodBalance > 0 ? "text-rose-600" : "text-emerald-600"
                                        )}>
                                            {formatCurrency(customer.periodBalance)}
                                        </span>
                                    </div>
                                ))}
                                {periodDebtors.length === 0 && (
                                    <p className="text-center text-slate-400 py-10">Bu davrda harakatlar yo'q</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Print Only Styles */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        .print-container, .print-container * { visibility: visible; }
                        .print-container { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none; }
                    }
                `}</style>
            </div>
        </div>
    )
}
