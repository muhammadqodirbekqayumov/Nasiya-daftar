import { useState, useEffect } from "react"
import { useData } from "@/contexts/DataContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Moon, Sun, Loader2, Upload, Download, User } from "lucide-react"

export default function SettingsPage() {
    const { settings, updateSettings, logout, customers, transactions, importData } = useData()
    const [formData, setFormData] = useState(settings)

    useEffect(() => {
        setFormData(settings)
    }, [settings])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = () => {
        updateSettings(settings)
        toast.success("Sozlamalar saqlandi!")
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                updateSettings({ profileImage: reader.result as string })
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-24">
            <h1 className="text-2xl font-bold text-slate-900">Sozlamalar</h1>

            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Do'kon Ma'lumotlari</CardTitle>
                        <CardDescription>Do'koningiz va shaxsiy ma'lumotlaringizni tahrirlang</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative group cursor-pointer">
                                {settings.profileImage ? (
                                    <img src={settings.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-8 w-8 text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium">O'zgartirish</span>
                                </div>
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium">Profil Rasmi</h3>
                                <p className="text-sm text-slate-500">Rasm yuklash uchun bosing (max 2MB)</p>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Valyuta</Label>
                            <select
                                id="currency"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={settings.currency || "UZS"}
                                onChange={(e) => updateSettings({ currency: e.target.value })}
                            >
                                <option value="UZS">So'm (UZS)</option>
                                <option value="USD">Dollar (USD)</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="storeName">Do'kon Nomi</Label>
                            <Input
                                id="storeName"
                                value={settings.storeName}
                                onChange={(e) => updateSettings({ storeName: e.target.value })}
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

                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Shaxsiy Ma'lumotlar</CardTitle>
                        <CardDescription>Sizning ma'lumotlaringiz</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="ownerName">Ismingiz</Label>
                            <Input
                                id="ownerName"
                                value={settings.ownerName}
                                onChange={(e) => updateSettings({ ownerName: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Telefon Raqam</Label>
                            <Input
                                id="phone"
                                value={settings.phone}
                                onChange={(e) => updateSettings({ ...settings, phone: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4 pt-6 border-t mt-6">
                    <Button onClick={handleSave} className="w-full sm:w-auto ml-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                        Saqlash
                    </Button>
                </div>

                <div className="pt-6 border-t mt-6">
                    <Button
                        variant="destructive"
                        className="w-full h-11"
                        onClick={() => {
                            if (window.confirm("Rostdan ham tizimdan chiqmoqchimisiz?")) {
                                logout();
                            }
                        }}
                    >
                        Tizimdan Chiqish
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ma'lumotlar Bazasi</CardTitle>
                    <CardDescription>Xavfsizlik uchun ma'lumotlarni saqlab qo'ying</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Button
                            variant="outline"
                            className="h-auto py-4 justify-start space-x-4 hover:bg-slate-50 border-slate-200"
                            onClick={() => {
                                const data = {
                                    customers,
                                    transactions,
                                    settings,
                                    exportDate: new Date().toISOString()
                                }
                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `nasiya_backup_${new Date().toISOString().split('T')[0]}.json`
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                            }}
                        >
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Download className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-slate-900">Nusxa olish</div>
                                <div className="text-xs text-slate-500">Barcha ma'lumotlarni saqlash</div>
                            </div>
                        </Button>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    const reader = new FileReader()
                                    reader.onload = (event) => {
                                        const content = event.target?.result as string
                                        importData(content)
                                    }
                                    reader.readAsText(file)
                                }}
                            />
                            <Button
                                variant="outline"
                                className="w-full h-auto py-4 justify-start space-x-4 hover:bg-slate-50 border-slate-200"
                            >
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <Upload className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-slate-900">Qayta tiklash</div>
                                    <div className="text-xs text-slate-500">Fayldan yuklash</div>
                                </div>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Support / Contact Admin */}
            <Card className="border-sky-200 bg-sky-50">
                <CardHeader>
                    <CardTitle className="text-sky-700">Yordam kerakmi?</CardTitle>
                    <CardDescription className="text-sky-600/80">
                        Dastur bo'yicha savollar yoki to'lov masalasida admin bilan bog'laning
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <a
                        href="https://t.me/QayumovMuhammadqodirbek"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-sky-100 shadow-sm hover:shadow-md transition-all text-sky-600 font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                        Telegram: @QayumovMuhammadqodirbek
                    </a>
                    <a
                        href="tel:+998907707806"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-sky-100 shadow-sm hover:shadow-md transition-all text-sky-600 font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .57 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.57A2 2 0 0 1 22 16.92z" /></svg>
                        Tel: +998 90 770 78 06
                    </a>
                </CardContent>
            </Card>
        </div>
    )
}
