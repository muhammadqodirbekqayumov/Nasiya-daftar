import { useState } from "react"
import { useData } from "@/contexts/DataContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Store, Activity, Ban, KeyRound, Plus, Save, User } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminDashboard() {
    const { user, allUsers, registerUser, updateUserPassword, toggleUserBlock } = useData()
    const [isAddOpen, setIsAddOpen] = useState(false)

    // Form State
    const [newUser, setNewUser] = useState({
        name: "",
        storeName: "",
        email: "",
        password: ""
    })

    const handleCreateUser = () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast.error("Barcha maydonlarni to'ldiring")
            return
        }

        registerUser(newUser.email, newUser.password, newUser.name, newUser.storeName)
        toast.success("Yangi do'kon qo'shildi!")
        setIsAddOpen(false)
        setNewUser({ name: "", storeName: "", email: "", password: "" })
    }

    if (user?.email !== "admin@nasiya.uz") {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-center">
                    <Ban className="h-12 w-12 mx-auto text-destructive mb-4" />
                    <h1 className="text-xl font-bold">Ruxsat yo'q</h1>
                    <p className="text-muted-foreground">Bu sahifa faqat Super Admin uchun.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-24 px-4 md:px-0">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 text-primary bg-primary/5">SUPER ADMIN</Badge>
                        <span className="text-slate-400 text-sm">v2.0.0 (SaaS Mode)</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-900">Boshqaruv Paneli</h1>
                    <p className="text-slate-500 max-w-xl">
                        Tizimdagi barcha do'konlar, foydalanuvchilar va to'lovlar nazorati.
                        Yangi do'kon qo'shish uchun pastdagi tugmani bosing.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Do'konlar</h2>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Yangi Do'kon
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Yangi Do'kon Qo'shish</DialogTitle>
                            <DialogDescription>
                                Mijoz uchun yangi login va parol yarating
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Egasi Ismi</Label>
                                <Input
                                    id="name"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="Masalan: Alisher Valiyev"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="store">Do'kon Nomi</Label>
                                <Input
                                    id="store"
                                    value={newUser.storeName}
                                    onChange={e => setNewUser({ ...newUser, storeName: e.target.value })}
                                    placeholder="Masalan: Baraka Market"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Login (Email)</Label>
                                <Input
                                    id="email"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="user@nasiya.uz"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Parol</Label>
                                <Input
                                    id="password"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    placeholder="******"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateUser}>
                                <Save className="h-4 w-4 mr-2" />
                                Saqlash
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jami Do'konlar</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allUsers?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Ro'yxatdan o'tganlar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faol Foydalanuvchilar</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{allUsers?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Faol statusdagilar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tizim Yuklamasi</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Stabil</div>
                        <p className="text-xs text-emerald-600">Server zo'r ishlamoqda</p>
                    </CardContent>
                </Card>
            </div>

            {/* Shops List */}
            <Card>
                <CardHeader>
                    <CardTitle>Do'konlar Ro'yxati</CardTitle>
                    <CardDescription>Barcha do'konlar va ularning hisob holati</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {allUsers?.filter(u => !u.isAdmin).map((shop: any) => (
                            <div key={shop.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all gap-4">
                                {/* Shop Info */}
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${shop.isBlocked ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                                        }`}>
                                        {shop.storeName?.charAt(0) || "D"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-bold text-lg truncate">{shop.storeName || "Nomsiz Do'kon"}</h3>
                                            {shop.isBlocked ? (
                                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">BLOKLANGAN</Badge>
                                            ) : (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] px-1.5 py-0.5">FAOL</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{shop.name}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <KeyRound className="h-3 w-3 shrink-0" />
                                                <span className="font-mono bg-slate-100 px-1 rounded text-xs truncate max-w-[150px]">{shop.email}</span>
                                                <span className="text-xs ml-1 whitespace-nowrap text-slate-400">(Parol: {shop.password})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="flex-1 md:flex-none whitespace-nowrap">
                                                <KeyRound className="h-3 w-3 mr-2" />
                                                Parol
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Parolni Yangilash</DialogTitle>
                                                <DialogDescription>{shop.storeName} uchun yangi parol o'rnating</DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label>Yangi Parol</Label>
                                                <Input id={`pass-${shop.id}`} placeholder="Yangi parol..." />
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={() => {
                                                    const input = document.getElementById(`pass-${shop.id}`) as HTMLInputElement
                                                    if (input && input.value) {
                                                        updateUserPassword(shop.id, input.value)
                                                        toast.success("Parol yangilandi!")
                                                    }
                                                }}>Saqlash</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        size="sm"
                                        variant={shop.isBlocked ? "default" : "destructive"}
                                        className={`flex-1 md:flex-none whitespace-nowrap ${shop.isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                                        onClick={() => {
                                            toggleUserBlock(shop.id)
                                            toast.success(shop.isBlocked ? "Do'kon faollashtirildi!" : "Do'kon bloklandi!")
                                        }}
                                    >
                                        <Ban className="h-3 w-3 mr-2" />
                                        {shop.isBlocked ? "Faollashtirish" : "Bloklash"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
