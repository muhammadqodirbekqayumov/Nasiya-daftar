import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useData } from "@/contexts/DataContext"
import { useNavigate, Link } from "react-router-dom"
import { Loader2 } from "lucide-react"

export default function Register() {
    const [name, setName] = useState("")
    const [storeName, setStoreName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const { registerUser } = useData()
    const navigate = useNavigate()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await registerUser(email, password, name, storeName)
            if (result) {
                // If registration requires confirmation, Supabase usually doesn't sign them in directly?
                // But registerUser returns 'data'. If session is null, it means confirmation is needed.
                // We should check that.
                // For now, let's assume if result is truthy, we redirect or show success.
                // DataContext.tsx toast said "Success".
                navigate("/login")
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
                    <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
                        <span className="text-2xl font-bold text-white">N</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Ro'yxatdan O'tish</CardTitle>
                    <CardDescription>
                        Yangi do'kon ochish uchun ma'lumotlarni kiriting
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                placeholder="Ismingiz (masalan: Alisher)"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Do'kon Nomi (masalan: Super Market)"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email (haqiqiy email kiriting)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 border-amber-200 focus:border-amber-400 bg-amber-50/50"
                            />
                            <p className="text-xs text-amber-600 px-1">
                                * Email tasdiqlash uchun xat boradi!
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Parol (kamida 6 ta belgi)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-11"
                            />
                        </div>
                        <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ro'yxatdan O'tish"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500">Akkauntingiz bormi? </span>
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            Kirish
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
