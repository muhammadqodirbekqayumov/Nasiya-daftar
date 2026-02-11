import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

// Types
export interface Transaction {
    id: string
    customerId: string
    amount: number
    type: 'debt' | 'payment'
    date: string
    description: string
}

export interface Customer {
    id: string
    name: string
    phone: string
    totalDebt: number
    lastTransactionDate: string
}

export interface User {
    id?: string
    email: string
    name: string
    storeName: string
    isAdmin?: boolean
    isBlocked?: boolean
    password?: string
}

export interface AppSettings {
    theme: 'light' | 'dark'
    currency: string
    language: string
    notifications: boolean
    ownerName?: string
    phone?: string
    smsTemplate?: string
    storeName?: string
    profileImage?: string
    isSetupCompleted?: boolean
}

interface DataContextType {
    user: User | null
    customers: Customer[]
    transactions: Transaction[]
    loading: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    registerUser: (email: string, password: string, name: string, storeName: string) => Promise<boolean>
    addCustomer: (name: string, phone: string) => Promise<void>
    updateCustomer: (id: string, name: string, phone: string) => Promise<void>
    deleteCustomer: (id: string) => Promise<void>
    addTransaction: (customerId: string, amount: number, type: 'debt' | 'payment', description: string, date: string) => Promise<void>
    deleteTransaction: (id: string) => Promise<void>
    settings: AppSettings
    updateSettings: (newSettings: Partial<AppSettings>) => void
    importData: (jsonData: string) => boolean
    allUsers: User[]
    updateUserPassword: (id: string, password: string) => void
    toggleUserBlock: (id: string) => void
    updateUserLogin: (id: string, email: string) => void
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

    // Fetch Data from Supabase
    const fetchData = useCallback(async () => {
        try {
            // 1. Fetch Transactions
            const { data: txData, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })

            if (txError) throw txError

            // Map transactions to app format
            const mappedTransactions: Transaction[] = (txData || []).map((t: any) => ({
                id: t.id,
                customerId: t.customer_id,
                amount: Number(t.amount),
                type: t.type,
                date: t.date,
                description: t.note || ''
            }))

            setTransactions(mappedTransactions)

            // 2. Fetch Customers
            const { data: custData, error: custError } = await supabase
                .from('customers')
                .select('*')
                .order('name')

            if (custError) throw custError

            // Map customers and calculate totals
            const mappedCustomers: Customer[] = (custData || []).map((c: any) => {
                // Calculate debt based on transactions
                const custTx = mappedTransactions.filter(t => t.customerId === c.id)
                const debt = custTx
                    .filter(t => t.type === 'debt')
                    .reduce((sum, t) => sum + t.amount, 0)
                const payment = custTx
                    .filter(t => t.type === 'payment')
                    .reduce((sum, t) => sum + t.amount, 0)

                const lastTx = custTx.length > 0 ? custTx[0].date : c.created_at

                return {
                    id: c.id,
                    name: c.name,
                    phone: c.phone || '',
                    totalDebt: debt - payment,
                    lastTransactionDate: lastTx
                }
            })

            setCustomers(mappedCustomers)

        } catch (error: any) {
            console.error("Error fetching data:", error)
            toast.error("Xatolik: " + (error.message || "Internet bilan aloqa yo'q"))
        }
    }, [])

    // Load Settings from LocalStorage (continue using LS for device settings)
    useEffect(() => {
        const storedSettings = localStorage.getItem('settings')
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings)
                setSettings(prev => ({ ...prev, ...parsed }))
            } catch (e) {
                console.error("Error parsing settings", e)
            }
        }
    }, [])

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('settings', JSON.stringify(settings))
        }
    }, [settings, loading])

    // Safety: If loading gets stuck for > 10s, force it off
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false)
                toast.warning("Internet sekin ishlayapti")
            }, 10000)
            return () => clearTimeout(timer)
        }
    }, [loading])

    // Auth & Data Fetching
    useEffect(() => {
        const initSession = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase.auth.getSession()

                if (error) {
                    console.error("Session check error:", error)
                    throw error
                }

                if (data.session?.user) {
                    // Fetch extended profile data (is_blocked status)
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('is_blocked')
                        .eq('id', data.session.user.id)
                        .maybeSingle() // Use maybeSingle to avoid error if table missing

                    const userData: User = {
                        id: data.session.user.id,
                        email: data.session.user.email || "",
                        name: data.session.user.user_metadata?.name || "Foydalanuvchi",
                        storeName: data.session.user.user_metadata?.store_name || "Do'kon",
                        isAdmin: data.session.user.email === "admin@nasiya.uz",
                        isBlocked: profile?.is_blocked || false
                    }
                    setUser(userData)
                    await fetchData()
                } else {
                    setUser(null)
                    setCustomers([])
                    setTransactions([])
                }
            } catch (error) {
                console.error("Auth init error:", error)
                // Fallback: stop loading so user sees something (likely Login)
            } finally {
                setLoading(false)
            }
        }

        initSession()

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            if (session?.user) {
                // Fetch extended profile data (is_blocked status)
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('is_blocked')
                    .eq('id', session.user.id)
                    .maybeSingle()

                const userData: User = {
                    id: session.user.id,
                    email: session.user.email || "",
                    name: session.user.user_metadata?.name || "Foydalanuvchi",
                    storeName: session.user.user_metadata?.store_name || "Do'kon",
                    isAdmin: session.user.email === "admin@nasiya.uz",
                    isBlocked: profile?.is_blocked || false
                }
                setUser(userData)
                // Only fetch if we transitioned from no user
                if (!user) await fetchData()
            } else {
                setUser(null)
                setCustomers([])
                setTransactions([])
            }
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])



    // Realtime Subscription
    useEffect(() => {
        if (!user) return

        const channel = supabase
            .channel('realtime_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
                fetchData()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
                fetchData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, fetchData])

    const login = async (email: string, password: string) => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            toast.error("Login yoki parol xato: " + error.message)
            setLoading(false)
            return false
        }

        toast.success("Xush kelibsiz!")
        await fetchData()
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
            const { data, error } = await supabase
                .from('customers')
                .insert([
                    { name, phone, user_id: user?.id }
                ])
                .select()
                .single()

            if (error) throw error

            const newCustomer: Customer = {
                id: data.id,
                name: data.name,
                phone: data.phone || '',
                totalDebt: 0,
                lastTransactionDate: new Date().toISOString()
            }

            setCustomers(prev => [newCustomer, ...prev])
            toast.success("Mijoz qo'shildi")
        } catch (error: any) {
            toast.error("Mijoz qo'shishda xatolik: " + error.message)
        }
    }

    const updateCustomer = async (id: string, name: string, phone: string) => {
        try {
            const { error } = await supabase
                .from('customers')
                .update({ name, phone })
                .eq('id', id)

            if (error) throw error

            setCustomers(prev => prev.map(c =>
                c.id === id ? { ...c, name, phone } : c
            ))
            toast.success("Mijoz yangilandi")
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
        }
    }

    const deleteCustomer = async (id: string) => {
        try {
            const { error } = await supabase
                .from('customers')
                .delete()
                .eq('id', id)

            if (error) throw error

            setCustomers(prev => prev.filter(c => c.id !== id))
            setTransactions(prev => prev.filter(t => t.customerId !== id))
            toast.success("Mijoz o'chirildi")
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
        }
    }

    const addTransaction = async (customerId: string, amount: number, type: 'debt' | 'payment', description: string, date: string) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert([
                    {
                        customer_id: customerId,
                        amount,
                        type,
                        note: description,
                        date,
                        user_id: user?.id
                    }
                ])
                .select()
                .single()

            if (error) throw error

            const newTransaction: Transaction = {
                id: data.id,
                customerId: data.customer_id,
                amount: Number(data.amount),
                type: data.type as 'debt' | 'payment',
                date: data.date,
                description: data.note || ''
            }

            setTransactions(prev => [newTransaction, ...prev])

            // Update local customer state immediately for UX
            setCustomers(prev => prev.map(c => {
                if (c.id === customerId) {
                    const change = type === 'debt' ? amount : -amount
                    return {
                        ...c,
                        totalDebt: c.totalDebt + change,
                        lastTransactionDate: date
                    }
                }
                return c
            }))

            toast.success("Amaliyot bajarildi")
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
            console.error(error)
        }
    }

    const deleteTransaction = async (id: string) => {
        try {
            const transactionToDelete = transactions.find(t => t.id === id)
            if (!transactionToDelete) return

            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)

            if (error) throw error

            setTransactions(prev => prev.filter(t => t.id !== id))

            // Revert customer debt in local state
            setCustomers(prev => prev.map(c => {
                if (c.id === transactionToDelete.customerId) {
                    const change = transactionToDelete.type === 'debt' ? -transactionToDelete.amount : transactionToDelete.amount
                    return {
                        ...c,
                        totalDebt: c.totalDebt + change
                    }
                }
                return c
            }))

            toast.success("O'chirildi")
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
        }
    }

    const importData = (_jsonData: string): boolean => {
        toast.info("Import funksiyasi server rejimida vaqtincha `ochirilgan")
        return false
    }

    // Admin functions
    const [allUsers, setAllUsers] = useState<User[]>([])

    useEffect(() => {
        if (user?.isAdmin) {
            fetchAllUsers()
        }
    }, [user])

    const fetchAllUsers = async () => {
        const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) {
            const mapped: User[] = data.map((p: any) => ({
                id: p.id,
                email: p.email,
                name: p.name,
                storeName: p.store_name,
                isAdmin: false,
                password: p.plain_password,
                isBlocked: p.is_blocked || false
            }))
            setAllUsers(mapped)
        }
    }

    const registerUser = async (email: string, password: string, name: string, storeName: string) => {
        try {
            // 1. Create temporary client to not affect current admin session
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY
            )

            // 2. Sign Up
            const { data, error } = await tempClient.auth.signUp({
                email,
                password,
                options: {
                    data: { name, store_name: storeName }
                }
            })

            if (error) throw error

            if (data.user) {
                // 3. Insert into profiles (so Admin can see it)
                const { error: profileError } = await tempClient
                    .from('user_profiles')
                    .insert({
                        id: data.user.id,
                        email,
                        plain_password: password,
                        name,
                        store_name: storeName,
                        is_blocked: false
                    })

                if (profileError) {
                    console.warn("Profile insert failed", profileError)
                }

                // 4. Update local list
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
        } else {
            toast.error("Xatolik: " + error.message)
        }
    }

    const toggleUserBlock = async (id: string) => {
        const userToToggle = allUsers.find(u => u.id === id)
        if (!userToToggle) return

        const newValue = !userToToggle.isBlocked
        const { error } = await supabase.from('user_profiles').update({ is_blocked: newValue }).eq('id', id)

        if (!error) {
            setAllUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: newValue } : u))
            toast.success(newValue ? "Bloklandi" : "Faollashtirildi")
        } else {
            toast.error("Xatolik: " + error.message)
        }
    }

    const updateUserLogin = async (id: string, email: string) => {
        const { error } = await supabase.from('user_profiles').update({ email }).eq('id', id)
        if (!error) {
            setAllUsers(prev => prev.map(u => u.id === id ? { ...u, email } : u))
            toast.success("Login yangilandi")
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: settings.currency === "SO'M" ? 'UZS' : 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <DataContext.Provider value={{
            user,
            customers,
            transactions,
            loading,
            login,
            logout,
            registerUser,
            addCustomer,
            updateCustomer,
            deleteCustomer,
            addTransaction,
            deleteTransaction,
            settings,
            updateSettings: (newSettings) => setSettings(prev => ({ ...prev, ...newSettings })),
            importData,
            allUsers,
            updateUserPassword,
            toggleUserBlock,
            updateUserLogin,
            formatCurrency,
            fetchData
        }}>
            {children}
        </DataContext.Provider>
    )
}
