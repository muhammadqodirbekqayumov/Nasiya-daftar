import { useParams, useNavigate } from "react-router-dom"
import { useData } from "@/contexts/DataContext"
import { TransactionDialog } from "@/components/TransactionDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Phone, Calendar, MessageSquare } from "lucide-react"
import { format } from "date-fns"

export default function CustomerDetails() {
    const { customerId } = useParams()
    const navigate = useNavigate()
    const { customers, transactions, getCustomerBalance, formatCurrency, settings } = useData()

    const customer = customers.find((c) => c.id === customerId)

    if (!customer) {
        return <div>Mijoz topilmadi</div>
    }

    const customerTransactions = transactions
        .filter((t) => t.customerId === customerId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const balance = getCustomerBalance(customer.id)

    const handleCall = () => {
        if (customer.phone) {
            window.location.href = `tel:${customer.phone}`
        }
    }

    const handleSms = () => {
        if (customer.phone) {
            let message = settings.smsTemplate
                .replace("{mijoz}", customer.name)
                .replace("{do'kon}", settings.storeName)
                .replace("{summa}", formatCurrency(balance))

            const phone = customer.phone.replace(/[^\d+]/g, "")
            const ua = navigator.userAgent.toLowerCase()
            const isIOS = ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1

            const url = `sms:${phone}${isIOS ? "&" : "?"}body=${encodeURIComponent(message)}`
            window.location.href = url
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Ma'lumotlar</CardTitle>
                        <div className="flex gap-2">
                            {customer.phone && (
                                <>
                                    <Button size="sm" variant="outline" onClick={handleCall}>
                                        <Phone className="h-4 w-4 mr-2" />
                                        Qo'ng'iroq
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleSms}>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        SMS
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{customer.phone || "Telefon yo'q"}</span>
                        </div>
                        {customer.note && (
                            <div className="text-sm text-muted-foreground border-l-2 pl-2 border-muted">
                                {customer.note}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Balans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${balance > 0 ? "text-destructive" : balance < 0 ? "text-green-600" : ""}`}>
                            {balance > 0 ? "+" : ""}{formatCurrency(balance)}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <TransactionDialog customerId={customer.id} type="debt" />
                            <TransactionDialog customerId={customer.id} type="payment" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-bold mt-4">Tarix</h2>
            <div className="space-y-4">
                {customerTransactions.map((t) => (
                    <Card key={t.id} className="overflow-hidden">
                        <div className={`p-4 flex items-center justify-between border-l-4 ${t.type === "debt" ? "border-l-destructive" : "border-l-green-600"}`}>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">
                                    {t.type === "debt" ? "Qarz" : "To'lov"}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(t.date), "dd.MM.yyyy HH:mm")}
                                </span>
                                {t.note && <span className="text-sm mt-1">{t.note}</span>}
                            </div>
                            <div className={`text-xl font-bold ${t.type === "debt" ? "text-destructive" : "text-green-600"}`}>
                                {t.type === "debt" ? "+" : "-"}{formatCurrency(t.amount)}
                            </div>
                        </div>
                    </Card>
                ))}
                {customerTransactions.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        Hozircha operatsiyalar yo'q.
                    </div>
                )}
            </div>
        </div>
    )
}
