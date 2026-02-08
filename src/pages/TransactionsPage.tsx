import { useState } from "react"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Filter } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export default function TransactionsPage() {
    const { transactions, customers, formatCurrency } = useData()
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState<"all" | "debt" | "payment">("all")
    const [dateFilter, setDateFilter] = useState<"all" | "today">("all")

    // Helper to get customer name
    const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || "Noma'lum"

    // Helper to normalize strings for search
    const normalize = (str: string) => str.toLowerCase().replace(/[\s\+\(\)\-]/g, "")

    const filteredTransactions = transactions.filter(t => {
        const customerName = getCustomerName(t.customerId)
        const matchesSearch = normalize(customerName).includes(normalize(search)) ||
            (t.note && normalize(t.note).includes(normalize(search)))

        const matchesType = filterType === "all" || t.type === filterType

        const matchesDate = dateFilter === "all" || (
            dateFilter === "today" &&
            new Date(t.date).toDateString() === new Date().toDateString()
        )

        return matchesSearch && matchesType && matchesDate
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-24">
            <div className="flex flex-col gap-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur pt-2 pb-2">
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Barcha Harakatlar</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Mijoz ismi yoki izoh bo'yicha qidirish..."
                            className="pl-10 h-10 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <Button
                            variant={filterType === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterType("all")}
                            className="whitespace-nowrap"
                        >
                            Barchasi
                        </Button>
                        <Button
                            variant={filterType === "debt" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterType("debt")}
                            className={cn("whitespace-nowrap", filterType === "debt" && "bg-rose-600 hover:bg-rose-700")}
                        >
                            Faqat Qarzlar
                        </Button>
                        <Button
                            variant={filterType === "payment" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterType("payment")}
                            className={cn("whitespace-nowrap", filterType === "payment" && "bg-emerald-600 hover:bg-emerald-700")}
                        >
                            Faqat To'lovlar
                        </Button>
                        <Button
                            variant={dateFilter === "today" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setDateFilter(dateFilter === "today" ? "all" : "today")}
                            className="whitespace-nowrap ml-auto"
                        >
                            {dateFilter === "today" ? "📅 Bugun" : "📅 Barcha vaqt"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
                {filteredTransactions.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-slate-900">
                                        {getCustomerName(transaction.customerId)}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {new Date(transaction.date).toLocaleString('uz-UZ')}
                                    </span>
                                    {transaction.note && (
                                        <span className="text-xs text-slate-400 itchalic">
                                            {transaction.note}
                                        </span>
                                    )}
                                </div>
                                <div className={cn(
                                    "font-bold whitespace-nowrap",
                                    transaction.type === "debt" ? "text-rose-600" : "text-emerald-600"
                                )}>
                                    {transaction.type === "debt" ? "-" : "+"}{formatCurrency(transaction.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                        <Filter className="h-12 w-12 mb-3 opacity-20" />
                        <p>Harakatlar topilmadi</p>
                    </div>
                )}
            </div>
        </div>
    )
}
