import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface Transaction {
    id: string
    customerId: string
    amount: number
    type: 'debt' | 'payment'
    date: string
    description: string
    dueDate?: string
}

export interface Customer {
    id: string
    name: string
    phone: string
    totalDebt: number
    lastTransactionDate: string
}

export interface User {
    id: string
    email: string
    name: string
    storeName: string
    isAdmin: boolean
    password?: string
    isBlocked?: boolean
    subscriptionEndDate?: string
}

export interface AppSettings {
    theme: 'light' | 'dark'
    currency: "SO'M" | "$"
    language: 'uz' | 'ru' | 'en'
    notifications: boolean
    ownerName: string
    phone: string
    storeName: string
    smsTemplate: string
}

interface DataContextType {
    user: User | null
    customers: Customer[]
    transactions: Transaction[]
    loading: boolean
    settings: AppSettings
    allUsers: User[]
    login: (email: string, password: string) => Promise<boolean>
    logout: () => Promise<void>
    registerUser: (email: string, password: string, name: string, storeName: string, subscriptionEndDate?: string) => Promise<boolean>
    addCustomer: (name: string, phone: string) => Promise<void>
    updateCustomer: (id: string, name: string, phone: string) => Promise<void>
    deleteCustomer: (id: string) => Promise<void>
    addTransaction: (customerId: string, amount: number, type: 'debt' | 'payment', description: string, date: string, dueDate?: string) => Promise<void>
    deleteTransaction: (id: string) => Promise<void>
    updateSettings: (settings: Partial<AppSettings>) => void
    importData: (jsonData: string) => boolean
    updateUserPassword: (id: string, password: string) => Promise<void>
    updateUserSubscription: (id: string, newDate: string) => Promise<void>
    toggleUserBlock: (id: string) => Promise<void>
    updateUserLogin: (id: string, email: string) => Promise<void>
    formatCurrency: (amount: number) => string
    fetchData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
    const context = useContext(DataContext)
    if (!context) {
        throw new Error("useData must be used within a DataProvider")
    }
    return context
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState<AppSettings>({
        theme: 'light',
        currency: "SO'M",
        language: 'uz',
        notifications: true,
        ownerName: '',
        phone: '',
        storeName: '',
        smsTemplate: "Hurmatli {mijoz}, sizning {do'kon} do'konidan {summa} qarz qarzingiz mavjud."
    })

    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: settings.currency === "SO'M" ? 'UZS' : 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }, [settings.currency])

    const fetchData = useCallback(async () => {
        try {
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })

            if (txError) throw txError

            const mappedTransactions: Transaction[] = (txData || []).map((t: any) => {
                const note = t.description || t.note || ''
                const dueMatch = note.match(/\| Muddat: ([\d-]+)/)
                const dueDate = dueMatch ? dueMatch[1] : undefined
                const cleanDesc = note.replace(/\| Muddat: [\d-]+/, '').trim()

                return {
                    id: t.id,
                    customerId: t.customer_id,
                    amount: Number(t.amount),
                    type: t.type,
                    date: t.date,
                    description: cleanDesc,
                    dueDate: dueDate
                }
            })

            setTransactions(mappedTransactions)

            const { data: custData, error: custError } = await supabase
                .from('customers')
                .select('*')
                .order('name')

            if (custError) throw custError

            const mappedCustomers: Customer[] = (custData || []).map((c: any) => {
                const custTx = mappedTransactions.filter(t => t.customerId === c.id)
                const debt = custTx.filter(t => t.type === 'debt').reduce((sum, t) => sum + t.amount, 0)
                const payment = custTx.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0)

                return {
                    id: c.id,
                    name: c.name,
                    phone: c.phone || '',
                    totalDebt: debt - payment,
                    lastTransactionDate: custTx.length > 0 ? custTx[0].date : ''
                }
            })

            setCustomers(mappedCustomers)
        } catch (error: any) {
            console.error("Fetch Data Error:", error)
            toast.error("Ma'lumotlarni yuklashda xatolik: " + error.message)
        }
    }, [])

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }))
    }

    useEffect(() => {
        const saved = localStorage.getItem('settings')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (parsed && typeof parsed === 'object') {
                    setSettings(prev => ({ ...prev, ...parsed }))
                }
            } catch (e) {
                console.error("Settings parse error", e)
            }
        }
    }, [])

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('settings', JSON.stringify(settings))
        }
    }, [settings, loading])

    useEffect(() => {
        try {
            const savedTx = localStorage.getItem('transactions')
            if (savedTx) {
                const parsed = JSON.parse(savedTx)
                if (Array.isArray(parsed)) setTransactions(parsed)
            }
            const savedCust = localStorage.getItem('customers')
            if (savedCust) {
                const parsed = JSON.parse(savedCust)
                if (Array.isArray(parsed)) setCustomers(parsed)
            }
        } catch (e) {
            console.error("Cache loading error", e)
        }
    }, [])

    useEffect(() => {
        if (transactions.length > 0) localStorage.setItem('transactions', JSON.stringify(transactions))
    }, [transactions])

    useEffect(() => {
        if (customers.length > 0) localStorage.setItem('customers', JSON.stringify(customers))
    }, [customers])

    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => setLoading(false), 10000)
            return () => clearTimeout(timer)
        }
    }, [loading])

    useEffect(() => {
        const initSession = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase.auth.getSession()
                if (error) throw error
                if (data.session?.user) {
                    const { data: profile } = await supabase.from('user_profiles').select('is_blocked').eq('id', data.session.user.id).maybeSingle()
                    const userData: User = {
                        id: data.session.user.id,
                        email: data.session.user.email || "",
                        name: data.session.user.user_metadata?.name || "Foydalanuvchi",
                        storeName: data.session.user.user_metadata?.store_name || "Do'kon",
                        isAdmin: data.session.user.email === "admin@0707.com",
                        isBlocked: profile?.is_blocked || false
                    }
                    setUser(userData)
                    await fetchData()
                }
            } catch (error) {
                console.error("Auth init error:", error)
            } finally {
                setLoading(false)
            }
        }
        initSession()

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            if (session?.user) {
                const { data: profile } = await supabase.from('user_profiles').select('is_blocked').eq('id', session.user.id).maybeSingle()
                const userData: User = {
                    id: session.user.id,
                    email: session.user.email || "",
                    name: session.user.user_metadata?.name || "Foydalanuvchi",
                    storeName: session.user.user_metadata?.store_name || "Do'kon",
                    isAdmin: session.user.email === "admin@0707.com",
                    isBlocked: profile?.is_blocked || false
                }
                setUser(userData)
                await fetchData()
            } else {
                setUser(null)
                setCustomers([])
                setTransactions([])
            }
        })
        return () => authListener.subscription.unsubscribe()
    }, [fetchData])

    const login = async (email: string, password: string) => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            toast.error("Login yoki parol xato: " + error.message)
            setLoading(false)
            return false
        }
        toast.success("Xush kelibsiz!")
        await fetchData().catch(() => toast.warning("Internet sekin. Offline rejimda ishlashingiz mumkin."))
        setLoading(false)
        return true
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setCustomers([])
        setTransactions([])
        toast.info("Tizimdan chiqildi")
    }

    const addCustomer = async (name: string, phone: string) => {
        try {
            if (!user?.id) {
                toast.error("Siz tizimga kirmagansiz!")
                return
            }
            const { data, error } = await supabase.from('customers').insert([{ name, phone, user_id: user.id }]).select().single()
            if (error) {
                console.error("Add Customer DB Error:", error)
                throw error
            }
            const newCustomer: Customer = { id: data.id, name: data.name, phone: data.phone || '', totalDebt: 0, lastTransactionDate: new Date().toISOString() }
            setCustomers(prev => [newCustomer, ...prev])
            toast.success("Mijoz qo'shildi")
        } catch (error: any) {
            console.error("Add Customer Exception:", error)
            toast.error("Mijoz qo'shishda xatolik: " + error.message)
        }
    }

    const updateCustomer = async (id: string, name: string, phone: string) => {
        try {
            const { error } = await supabase.from('customers').update({ name, phone }).eq('id', id)
            if (error) throw error
            setCustomers(prev => prev.map(c => c.id === id ? { ...c, name, phone } : c))
            toast.success("Mijoz yangilandi")
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
        }
    }

    const deleteCustomer = async (id: string) => {
        try {
            const { error } = await supabase.from('customers').delete().eq('id', id)
            if (error) throw error
            setCustomers(prev => prev.filter(c => c.id !== id))
            setTransactions(prev => prev.filter(t => t.customerId !== id))
            toast.success("Mijoz o'chirildi")
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
        }
    }

    const addTransaction = async (customerId: string, amount: number, type: 'debt' | 'payment', description: string, date: string, dueDate?: string) => {
        try {
            let finalNote = description
            if (dueDate) finalNote = `${description} | Muddat: ${dueDate}`

            const { data, error } = await supabase
                .from('transactions')
                .insert([{ customer_id: customerId, amount, type, created_at: new Date().toISOString(), date, description: finalNote, note: finalNote, user_id: user?.id }])
                .select()
                .maybeSingle()

            if (error) {
                console.error("Add Transaction DB Error:", error)
                throw error
            }

            if (!data) throw new Error("Ma'lumot saqlanmadi (RLS bo'lishi mumkin)")

            const newTransaction: Transaction = { id: data.id, customerId: data.customer_id, amount: Number(data.amount), type: data.type as 'debt' | 'payment', date: data.date, description: data.description || data.note || '' }
            setTransactions(prev => [newTransaction, ...prev])
            setCustomers(prev => prev.map(c => {
                if (c.id === customerId) {
                    const change = type === 'debt' ? amount : -amount
                    return { ...c, totalDebt: c.totalDebt + change, lastTransactionDate: date }
                }
                return c
            }))
            toast.success("Amaliyot bajarildi")
        } catch (error: any) {
            console.error("Transaction Exception:", error)
            toast.error(`Xatolik: ${error.message}. Iltimos, SQL kodni bazada yuklaganingizni tekshiring.`)
        }
    }

    const deleteTransaction = async (id: string) => {
        try {
            const t = transactions.find(t => t.id === id)
            if (!t) return
            const { error } = await supabase.from('transactions').delete().eq('id', id)
            if (error) throw error
            setTransactions(prev => prev.filter(tx => tx.id !== id))
            setCustomers(prev => prev.map(c => {
                if (c.id === t.customerId) {
                    const change = t.type === 'debt' ? -t.amount : t.amount
                    return { ...c, totalDebt: c.totalDebt + change }
                }
                return c
            }))
            toast.success("O'chirildi")
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
        }
    }

    const [allUsers, setAllUsers] = useState<User[]>([])

    const fetchAllUsers = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false })
            if (error) throw error
            setAllUsers((data || []).map((p: any) => ({
                id: p.id,
                email: p.email,
                name: p.name,
                storeName: p.store_name,
                isAdmin: false,
                password: p.plain_password,
                isBlocked: p.is_blocked || false,
                subscriptionEndDate: p.subscription_end_date
            })))
        } catch (e: any) {
            console.error("Fetch Users Error:", e)
        }
    }, [])

    useEffect(() => {
        if (user?.isAdmin) fetchAllUsers()
    }, [user, fetchAllUsers])

    const registerUser = async (email: string, password: string, name: string, storeName: string, subscriptionEndDate?: string) => {
        try {
            const defaultSubDate = new Date()
            defaultSubDate.setDate(defaultSubDate.getDate() + 30)
            const finalSubDate = subscriptionEndDate || defaultSubDate.toISOString().split('T')[0]
            const tempClient = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
            const { data, error } = await tempClient.auth.signUp({ email, password, options: { data: { name, store_name: storeName, subscription_end_date: finalSubDate } } })
            if (error) throw error
            if (data.user) {
                const { error: profileError } = await tempClient.from('user_profiles').insert({ id: data.user.id, email, plain_password: password, name, store_name: storeName, is_blocked: false, subscription_end_date: finalSubDate })
                if (profileError) throw profileError
                await fetchAllUsers()
                toast.success("Yangi do'kon qo'shildi")
            }
            await tempClient.auth.signOut()
            return true
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
            return false
        }
    }

    const updateUserPassword = async (id: string, password: string) => {
        const { error } = await supabase.from('user_profiles').update({ plain_password: password }).eq('id', id)
        if (!error) {
            setAllUsers(prev => prev.map(u => u.id === id ? { ...u, password } : u))
            toast.success("Parol yangilandi")
        } else toast.error("Xatolik: " + error.message)
    }

    const updateUserSubscription = async (id: string, newDate: string) => {
        try {
            const tempClient = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
            const { error } = await tempClient.from('user_profiles').update({ subscription_end_date: newDate }).eq('id', id)
            if (error) throw error
            setAllUsers(prev => prev.map(u => u.id === id ? { ...u, subscriptionEndDate: newDate } : u))
            toast.success("Obuna vaqti yangilandi")
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
        }
    }

    const toggleUserBlock = async (id: string) => {
        const u = allUsers.find(u => u.id === id)
        if (!u) return
        const newValue = !u.isBlocked
        const { error } = await supabase.from('user_profiles').update({ is_blocked: newValue }).eq('id', id)
        if (!error) {
            setAllUsers(prev => prev.map(user => user.id === id ? { ...user, isBlocked: newValue } : user))
            toast.success(newValue ? "Bloklandi" : "Faollashtirildi")
        } else toast.error("Xatolik: " + error.message)
    }

    const updateUserLogin = async (id: string, email: string) => {
        const { error } = await supabase.from('user_profiles').update({ email }).eq('id', id)
        if (!error) {
            setAllUsers(prev => prev.map(u => u.id === id ? { ...u, email } : u))
            toast.success("Login yangilandi")
        }
    }

    const importData = (_jsonData: string): boolean => {
        toast.info("Import funksiyasi server rejimida vaqtincha ochirilgan")
        return false
    }

    return (
        <DataContext.Provider value={{
            user, customers, transactions, loading, settings, allUsers,
            login, logout, registerUser, addCustomer, updateCustomer, deleteCustomer,
            addTransaction, deleteTransaction, updateSettings, importData,
            updateUserPassword, updateUserSubscription, toggleUserBlock, updateUserLogin,
            formatCurrency, fetchData
        }}>
            {children}
        </DataContext.Provider>
    )
}
