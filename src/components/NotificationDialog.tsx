import { useData } from "@/contexts/DataContext"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Bell, Calendar, Clock } from "lucide-react"

export function NotificationDialog() {
    const { transactions, customers, formatCurrency } = useData()
    const today = new Date().toISOString().split("T")[0]

    // Find due transactions where customer still has debt
    // Logic: If user added a due date, and it's today or past, show it.
    // Also check if debt is cleared? Ideally. But assume not cleared for now.
    const dueTransactions = transactions.filter(t => {
        if (t.type !== 'debt' || !t.dueDate) return false

        const customer = customers.find(c => c.id === t.customerId)
        // Only if customer owes money overall
        if (!customer || customer.totalDebt <= 0) return false

        // Show ALL future dues too? No, only today and past.
        // Or show upcoming (next 3 days)?
        // Let's show Today + Past + Next 3 days.
        const dueDate = new Date(t.dueDate)
        const diffStats = Math.ceil((dueDate.getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24))

        // Show if overdue (diff < 0), today (diff == 0), or upcoming in 3 days (diff <= 3)
        return diffStats <= 3
    }).sort((a, b) => (a.dueDate || "") > (b.dueDate || "") ? 1 : -1)

    const overdueCount = dueTransactions.filter(t => t.dueDate && t.dueDate < today).length
    const todayCount = dueTransactions.filter(t => t.dueDate === today).length

    const hasActiveNotifications = overdueCount + todayCount > 0

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors mr-2 focus:outline-none">
                    <Bell className="h-6 w-6 text-slate-600" />
                    {hasActiveNotifications && (
                        <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            Eslatmalar ({dueTransactions.length})
                        </h2>
                    </div>

                    {dueTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                            <Bell className="h-12 w-12 text-slate-200 mb-4" />
                            <p>Hozircha eslatmalar yo'q</p>
                            <p className="text-sm mt-1">Qarz berayotganda "Qaytarish muddati"ni kiriting</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dueTransactions.map(t => {
                                const customer = customers.find(c => c.id === t.customerId)
                                const isOverdue = t.dueDate && t.dueDate < today
                                const isToday = t.dueDate === today

                                return (
                                    <div key={t.id} className={`p-4 rounded-xl border transition-all ${isOverdue ? 'border-rose-200 bg-rose-50/50' :
                                        isToday ? 'border-amber-200 bg-amber-50/50' :
                                            'border-slate-200 bg-white'
                                        }`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-900">{customer?.name}</h3>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isOverdue ? 'bg-rose-100 text-rose-700' :
                                                isToday ? 'bg-amber-100 text-amber-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                <Clock className="h-3 w-3" />
                                                {isOverdue ? 'O\'tib ketdi' : (isToday ? 'Bugun' : 'Yaqinda')}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                            {t.description || "Izoh yo'q"}
                                        </p>

                                        <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 mt-2">
                                            <span className={`text-lg font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                                                {formatCurrency(t.amount)}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-100">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{t.dueDate?.split('-').reverse().join('.')}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
