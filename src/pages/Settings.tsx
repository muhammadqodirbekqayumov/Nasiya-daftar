import { useState, useEffect } from "react"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function SettingsPage() {
    const { settings, updateSettings } = useData()
    const [formData, setFormData] = useState(settings)

    useEffect(() => {
        setFormData(settings)
    }, [settings])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateSettings(formData)
        toast.success("Sozlamalar saqlandi!")
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Sozlamalar</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Do'kon Proflili</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="storeName">Do'kon Nomi</Label>
                            <Input
                                id="storeName"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleChange}
                                placeholder="Masalan: Super Market"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Sizning telefoningiz</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+998 90 123 45 67"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="smsTemplate">SMS Shablon</Label>
                            <p className="text-xs text-muted-foreground">
                                Mavjud o'zgaruvchilar: {`{mijoz}`}, {`{do'kon}`}, {`{summa}`}
                            </p>
                            <Textarea
                                id="smsTemplate"
                                name="smsTemplate"
                                value={formData.smsTemplate}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>

                        <Button type="submit">Saqlash</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
