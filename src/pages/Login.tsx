import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/contexts/DataContext"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useData()
    const navigate = useNavigate()

    // Komponent yuklanganda qotib qolgan eski sessiyalarni tozalaydi
    useState(() => {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
            console.error("Storage clear error", e)
        }
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const success = await login(email, password)
            if (success) {
                if (email === "admin@0707.com") {
                    navigate("/admin")
                } else {
                    navigate("/")
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader className="text-center space-y-2">
                    <img 
                        src="/logo.png" 
                        alt="Nasiya Daftar Logo" 
                        className="w-24 h-24 mx-auto object-contain rounded-xl shadow-sm mb-2"
                    />
                    <CardTitle className="text-2xl font-bold text-slate-900">Tizimga Kirish</CardTitle>
                    <CardDescription>
                        Foydalanuvchi hisobingizga kiring
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email manzilingiz (masalan: dukon@0707.com)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Parolingiz"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Kirish"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            className="w-full text-xs text-slate-500 hover:text-rose-600"
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                        >
                            Qotib qolsa: Keshni tozalash va Yangilash
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
