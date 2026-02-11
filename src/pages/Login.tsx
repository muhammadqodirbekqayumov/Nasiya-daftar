import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/contexts/DataContext"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"


export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { login, registerUser } = useData()
    const isLocal = window.location.hostname === "localhost"
    const navigate = useNavigate()

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

    const setupAdmin = async () => {
        setLoading(true)
        // Adminni yaratishga urinib ko'ramiz
        const success = await registerUser("admin@0707.com", "123", "Super Admin", "Nasiya Daftar Admin")
        if (success) {
            setEmail("admin@0707.com")
            setPassword("123")
            toast.success("Admin yaratildi! Endi 'Kirish' tugmasini bosing.")
        }
        setLoading(false)
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
                        <span className="text-2xl font-bold text-white">N</span>
                    </div>
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

                        {isLocal && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-dashed text-slate-500 text-xs h-8"
                                onClick={setupAdmin}
                                disabled={loading}
                            >
                                Admin hisobini yaratish (Vaqtinchalik)
                            </Button>
                        )}
                    </form>




                </CardContent>
            </Card>
        </div>
    )
}
