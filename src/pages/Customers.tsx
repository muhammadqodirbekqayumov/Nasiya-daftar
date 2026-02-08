import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "@/contexts/DataContext"
import { CustomerDialog } from "@/components/CustomerDialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Phone, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export default function Customers() {
    const { customers, getCustomerBalance, formatCurrency } = useData()
    const [search, setSearch] = useState("")
    const navigate = useNavigate()

    const normalize = (str: string) => str.replace(/[\s\+\(\)\-]/g, "")

    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        normalize(customer.phone).includes(normalize(search))
    )

    return (
        <div className="flex flex-col gap-4 max-w-5xl mx-auto pb-24 px-4 sm:px-6">
            {/* Header & Search */}
            <div className="flex flex-col gap-4 sticky top-0 z-30 bg-slate-50/95 backdrop-blur pt-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Mijozlar</h1>
                    <CustomerDialog trigger={<Button size="sm" className="bg-primary text-white rounded-full px-4 text-xs sm:text-sm shadow-md shadow-primary/20">+ Yangi</Button>} />
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                    <Input
                        placeholder="Qidirish..."
                        className="pl-9 sm:pl-10 h-10 sm:h-12 bg-white border-none shadow-sm text-sm sm:text-base"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Smart List */}
            <div className="grid gap-2 sm:gap-3">
                {filteredCustomers.map((customer) => {
                    const balance = getCustomerBalance(customer.id)
                    const isDebt = balance > 0
                    const isCredit = balance < 0

                    return (
                        <div key={customer.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group bg-white rounded-xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform" onClick={() => navigate(`/customers/${customer.id}`)}>
                            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border border-slate-200">
                                    <AvatarFallback className={cn("font-bold text-xs sm:text-base", isDebt ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                                        {customer.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base group-hover:text-primary transition-colors truncate pr-2">
                                        {customer.name}
                                    </h3>
                                    <div className="flex items-center text-xs sm:text-sm text-slate-500 gap-1 min-w-0">
                                        <Phone className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{customer.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <span className={cn(
                                    "block font-bold whitespace-nowrap",
                                    isDebt ? "text-rose-600" :
                                        isCredit ? "text-emerald-600" : "text-slate-600"
                                )}>
                                    {formatCurrency(Math.abs(balance))}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                    {isDebt ? "Qarz" :
                                        isCredit ? "Haqdor" : "Balans"}
                                </span>
                            </div>
                        </div>
                    )
                })}
                {filteredCustomers.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <User className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <p>Mijoz topilmadi</p>
                    </div>
                )}
            </div>
        </div>
    )
}
