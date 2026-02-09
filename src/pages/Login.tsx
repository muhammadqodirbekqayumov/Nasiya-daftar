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
    const { login } = useData()
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulation of login for now, will be real with Supabase
        try {
            const success = await login(email, password)
            if (success) {
                toast.success("Xush kelibsiz!")
                if (email === "admin@nasiya.uz") {
                    navigate("/admin")
                } else {
                    navigate("/")
                }
            } else {
                toast.error("Login yoki parol xato")
            }
        } catch (error) {
            toast.error("Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
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
                                placeholder="Email manzilingiz (masalan: dukon@nasiya.uz)"
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
                    </form>




                </CardContent>
            </Card>
        </div>
    )
}
