import { useData } from "@/contexts/DataContext"
import { format } from "date-fns"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

export function RecentTransactions() {
    const { transactions, customers, formatCurrency } = useData()

    const recent = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

    return (
        <div className="space-y-8">
            {recent.map((transaction) => {
                const customer = customers.find((c) => c.id === transaction.customerId)
                return (
                    <div key={transaction.id} className="flex items-center">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${transaction.type === 'debt' ? 'bg-destructive/10 border-destructive/20' : 'bg-green-100 border-green-200'}`}>
                            {transaction.type === 'debt' ? (
                                <ArrowUpRight className="h-4 w-4 text-destructive" />
                            ) : (
                                <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            )}
                        </div>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{customer?.name || "Noma'lum"}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(transaction.date), "dd.MM.yyyy HH:mm")}
                            </p>
                        </div>
                        <div className={`ml-auto font-medium ${transaction.type === 'debt' ? 'text-destructive' : 'text-green-600'}`}>
                            {transaction.type === 'debt' ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </div>
                    </div>
                )
            })}
            {recent.length === 0 && (
                <div className="text-center text-muted-foreground">
                    Operatsiyalar yo'q
                </div>
            )}
        </div>
    )
}
