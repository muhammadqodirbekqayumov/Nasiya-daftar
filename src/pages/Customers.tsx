import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useData } from "@/contexts/DataContext"
import { CustomerDialog } from "@/components/CustomerDialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Phone, User, ChevronRight } from "lucide-react"

export default function Customers() {
    const { customers, getCustomerBalance, formatCurrency } = useData()
    const [searchParams] = useSearchParams()
    const filter = searchParams.get("filter")
    const [search, setSearch] = useState("")

    const filteredCustomers = customers.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search)

        if (!matchesSearch) return false

        if (filter === 'debt') {
            return getCustomerBalance(c.id) > 0
        }

        return true
    })

    const title = filter === 'debt' ? "Qarzorlar Ro'yxati" : "Mijozlar Bazasi"

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-20">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">{title}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {filteredCustomers.length} ta mijoz topildi
                    </p>
                </div>
                <CustomerDialog />
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Ism yoki telefon orqali qidirish..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-14 text-lg bg-white shadow-sm border-slate-200 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCustomers.map((customer) => {
                    const balance = getCustomerBalance(customer.id)
                    const isDebt = balance > 0

                    return (
                        <Link to={`/customers/${customer.id}`} key={customer.id} className="group">
                            <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white hover:bg-primary/5 cursor-pointer overflow-hidden">
                                <CardContent className="p-6 flex flex-col h-full justify-between gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-800 line-clamp-1">{customer.name}</h3>
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {customer.phone || "---"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-200">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Balans</span>
                                            <span className={`text-xl font-bold ${isDebt ? "text-rose-600" : "text-emerald-600"}`}>
                                                {isDebt ? "+" : ""}{formatCurrency(balance)}
                                            </span>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
                {filteredCustomers.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white/50 rounded-3xl border border-dashed border-slate-300">
                        <div className="bg-slate-100 p-6 rounded-full mb-4">
                            <User className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700">Hech narsa topilmadi</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm">
                            Qidiruv so'zini o'zgartirib ko'ring yoki yangi mijoz qo'shing.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
