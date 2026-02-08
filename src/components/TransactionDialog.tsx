import { useState } from "react"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CalendarIcon } from "lucide-react"

interface TransactionDialogProps {
    customerId?: string
    trigger?: React.ReactNode
    defaultType?: 'debt' | 'payment'
}

export function TransactionDialog({ customerId, trigger, defaultType = 'debt' }: TransactionDialogProps) {
    const { addTransaction, customers } = useData()
    const [open, setOpen] = useState(false)
    const [amount, setAmount] = useState("")
    const [type, setType] = useState<'debt' | 'payment'>(defaultType)
    const [note, setNote] = useState("")
    const [returnDate, setReturnDate] = useState("")
    const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || "")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!amount || isNaN(parseFloat(amount))) { // Changed Number(amount) to parseFloat(amount)
            toast.error("Summani to'g'ri kiriting")
            return
        }

        if (!selectedCustomerId) {
            toast.error("Mijozni tanlang")
            return
        }

        addTransaction({
            customerId: selectedCustomerId,
            amount: parseFloat(amount), // Changed Number(amount) to parseFloat(amount)
            type,
            note,
            returnDate: type === 'debt' ? returnDate : undefined
        })

        toast.success(type === 'debt' ? "Qarz yozildi" : "To'lov qabul qilindi")
        setOpen(false)
        resetForm()
    }

    const resetForm = () => {
        setAmount("")
        setNote("")
        setReturnDate("")
        if (!customerId) setSelectedCustomerId("")
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>{defaultType === 'debt' ? 'Qarz Berish' : "To'lov Olish"}</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{type === 'debt' ? 'Qarz Yozish' : "To'lov Qabul Qilish"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    {!customerId && (
                        <div className="grid gap-2">
                            <Label htmlFor="customer">Mijoz</Label>
                            <select
                                id="customer"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                            >
                                <option value="">Tanlang...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant={type === 'debt' ? 'default' : 'outline'}
                            onClick={() => setType('debt')}
                            className={type === 'debt' ? 'bg-rose-600 hover:bg-rose-700' : ''}
                        >
                            Qarz Berish
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'payment' ? 'default' : 'outline'}
                            onClick={() => setType('payment')}
                            className={type === 'payment' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                        >
                            To'lov Olish
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Summa</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-lg font-bold"
                        />
                    </div>

                    {type === 'debt' && (
                        <div className="grid gap-2">
                            <Label htmlFor="returnDate">Qaytarish muddati</Label>
                            <div className="relative">
                                <Input
                                    id="returnDate"
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    className="pl-10"
                                />
                                <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="note">Izoh (ixtiyoriy)</Label>
                        <Textarea
                            id="note"
                            placeholder="Masalan: Mahsulot nomi..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full">Saqlash</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
