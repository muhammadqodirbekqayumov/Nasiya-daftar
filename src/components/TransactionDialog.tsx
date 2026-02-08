import { useState } from "react"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDown, ArrowUp } from "lucide-react"

interface TransactionDialogProps {
    customerId: string
    type: "debt" | "payment"
    trigger?: React.ReactNode
}

export function TransactionDialog({ customerId, type, trigger }: TransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const { addTransaction } = useData()
    const [amount, setAmount] = useState("")
    const [note, setNote] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addTransaction({
            customerId,
            type,
            amount: Number(amount),
            date: new Date().toISOString(),
            note,
        })
        setOpen(false)
        setAmount("")
        setNote("")
    }

    const isDebt = type === "debt"

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant={isDebt ? "destructive" : "default"} className="flex-1">
                        {isDebt ? <ArrowDown className="mr-2 h-4 w-4" /> : <ArrowUp className="mr-2 h-4 w-4" />}
                        {isDebt ? "Qarz berish" : "To'lov qildi"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isDebt ? "Qarz qo'shish" : "To'lov qabul qilish"}</DialogTitle>
                    <DialogDescription>
                        Summa va izohni kiriting.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Summa
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="col-span-3"
                                required
                                min="0"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="note" className="text-right">
                                Izoh
                            </Label>
                            <Input
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" variant={isDebt ? "destructive" : "default"}>
                            Saqlash
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
