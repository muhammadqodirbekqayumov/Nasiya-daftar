import { useState } from "react"
import type { ReactNode } from "react"
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
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface CustomerDialogProps {
    trigger?: ReactNode
}

export function CustomerDialog({ trigger }: CustomerDialogProps) {
    const { addCustomer } = useData()
    const [open, setOpen] = useState(false)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        try {
            addCustomer({
                name: formData.get("name") as string,
                phone: formData.get("phone") as string,
                note: formData.get("note") as string,
            })
            setOpen(false)
            toast.success("Mijoz qo'shildi")
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Yangi Mijoz
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yangi Mijoz Qo'shish</DialogTitle>
                    <DialogDescription>
                        Mijoz ma'lumotlarini kiriting.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Ism</Label>
                            <Input id="name" name="name" placeholder="Ali Valiyev" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input id="phone" name="phone" placeholder="+998 90 123 45 67" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="note">Izoh (ixtiyoriy)</Label>
                            <Input id="note" name="note" placeholder="Qo'shimcha ma'lumot" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Saqlash</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
