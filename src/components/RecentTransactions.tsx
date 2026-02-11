import { useData } from "@/contexts/DataContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"

export function RecentTransactions({ limit }: { limit?: number }) {
    const { transactions, customers, formatCurrency } = useData()

    const sortedTransactions = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const displayTransactions = limit ? sortedTransactions.slice(0, limit) : sortedTransactions

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Oxirgi harakatlar</CardTitle>
                <CardDescription>
                    So'nggi 5 ta qarz va to'lovlar
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="divide-y divide-slate-100">
                    {displayTransactions.map((transaction) => {
                        const customer = customers.find((c) => c.id === transaction.customerId)
                        const isDebt = transaction.type === "debt"

                        return (
                            <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-9 w-9 border border-slate-200">
                                        <AvatarFallback className={isDebt ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}>
                                            {isDebt ? "Q" : "T"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none text-slate-900">
                                            {customer?.name || "Noma'lum mijoz"}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {format(new Date(transaction.date), "dd.MM.yyyy HH:mm")}
                                        </p>
                                    </div>
                                </div>
                                <div className={`font-bold ${isDebt ? "text-rose-600" : "text-emerald-600"}`}>
                                    {isDebt ? "+" : "-"}{formatCurrency(transaction.amount)}
                                </div>
                            </div>
                        )
                    })}
                    {displayTransactions.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            Hozircha operatsiyalar yo'q.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
