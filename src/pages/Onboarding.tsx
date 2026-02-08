import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Store, User, Phone } from "lucide-react"

export default function Onboarding() {
    const { settings, updateSettings } = useData()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        storeName: "",
        ownerName: "",
        phone: "+998 ",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.storeName || !formData.ownerName || !formData.phone) return

        updateSettings({
            ...settings,
            storeName: formData.storeName,
            ownerName: formData.ownerName,
            phone: formData.phone,
            isSetupCompleted: true,
        })
        navigate("/")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md border-none shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Store className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-extrabold text-slate-800">
                        Nasiya Daftar
                    </CardTitle>
                    <CardDescription className="text-base">
                        Ishni boshlash uchun do'kon ma'lumotlarini kiriting
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Do'kon Nomi</Label>
                            <div className="relative">
                                <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="storeName"
                                    name="storeName"
                                    placeholder="Masalan: Baraka Market"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    className="pl-9 h-11"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ownerName">Egasining Ismi</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="ownerName"
                                    name="ownerName"
                                    placeholder="Masalan: Azizbek"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    className="pl-9 h-11"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon Raqam</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="+998 90 123 45 67"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="pl-9 h-11"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 mt-4">
                            Boshlash
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
