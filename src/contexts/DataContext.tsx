import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
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
    profileImage?: string
    isSetupCompleted?: boolean
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
    const [allUsers, setAllUsers] = useState<User[]>([])
    const userIdRef = useRef<string | null>(null)
    const initDoneRef = useRef(false)
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

    // ==================== FETCH DATA ====================
    const fetchData = useCallback(async (uid?: string) => {
        const activeId = uid || userIdRef.current
        if (!activeId) return

        try {
            const [txResult, custResult] = await Promise.all([
                supabase.from('transactions').select('*').eq('user_id', activeId).order('date', { ascending: false }),
                supabase.from('customers').select('*').eq('user_id', activeId).order('name')
            ])

            if (txResult.error) { console.error("TX Error:", txResult.error); return }
            if (custResult.error) { console.error("Cust Error:", custResult.error); return }

            const txData = txResult.data || []
            const custData = custResult.data || []

            const mappedTransactions: Transaction[] = txData.map((t: any) => {
                const note = t.description || t.note || ''
                const dueMatch = note.match(/\| Muddat: ([\d-]+)/)
                const dueDate = dueMatch ? dueMatch[1] : undefined
                const cleanDesc = note.replace(/\| Muddat: [\d-]+/, '').trim()
                return {
                    id: t.id, customerId: t.customer_id, amount: Number(t.amount),
                    type: t.type, date: t.date, description: cleanDesc, dueDate
                }
            })

            const balanceMap = new Map<string, { debt: number; lastDate: string }>()
            mappedTransactions.forEach(t => {
                const cur = balanceMap.get(t.customerId) || { debt: 0, lastDate: t.date }
                balanceMap.set(t.customerId, {
                    debt: cur.debt + (t.type === 'debt' ? t.amount : -t.amount),
                    lastDate: cur.lastDate || t.date
                })
            })

            const mappedCustomers: Customer[] = custData.map((c: any) => {
                const stats = balanceMap.get(c.id) || { debt: 0, lastDate: '' }
                return { id: c.id, name: c.name, phone: c.phone || '', totalDebt: stats.debt, lastTransactionDate: stats.lastDate }
            })

            setTransactions(mappedTransactions)
            setCustomers(mappedCustomers)
        } catch (error: any) {
            console.error("Fetch Data Error:", error)
        }
    }, [])

    // ==================== SETTINGS ====================
    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }))
    }

    useEffect(() => {
        try {
            const saved = localStorage.getItem('settings')
            if (saved) setSettings(JSON.parse(saved))
        } catch (e) { console.error("Settings parse error", e) }
    }, [])

    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify(settings))
    }, [settings])

    // ==================== HELPER: Build User from Session ====================
    const buildUserFromSession = async (sessionUser: any): Promise<User> => {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('is_blocked, name, store_name')
            .eq('id', sessionUser.id)
            .maybeSingle()

        return {
            id: sessionUser.id,
            email: sessionUser.email || "",
            name: profile?.name || sessionUser.user_metadata?.name || "Foydalanuvchi",
            storeName: profile?.store_name || sessionUser.user_metadata?.store_name || "Do'kon",
            isAdmin: sessionUser.email === "admin@0707.com",
            isBlocked: profile?.is_blocked || false
        }
    }

    // ==================== AUTH INIT ====================
    useEffect(() => {
        let isMounted = true

        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user && isMounted) {
                    const userData = await buildUserFromSession(session.user)
                    userIdRef.current = session.user.id
                    setUser(userData)
                    fetchData(session.user.id)
                    initDoneRef.current = true
                }
            } catch (err) {
                console.error("Init Error", err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        init()

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return

            if (event === 'SIGNED_IN' && session?.user) {
                // Skip if init() already handled this
                if (initDoneRef.current && userIdRef.current === session.user.id) return

                const userData = await buildUserFromSession(session.user)
                userIdRef.current = session.user.id
                setUser(userData)
                setLoading(false)
                fetchData(session.user.id)
            } else if (event === 'SIGNED_OUT') {
                userIdRef.current = null
                setUser(null)
                setCustomers([])
                setTransactions([])
                setAllUsers([])
            }
        })

        return () => {
            isMounted = false
            authListener.subscription.unsubscribe()
        }
    }, [fetchData])

    // ==================== LOGIN / LOGOUT ====================
    const login = async (email: string, password: string) => {
        try {
            setLoading(true)
            initDoneRef.current = false
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                toast.error("Login yoki parol xato: " + error.message)
                setLoading(false)
                return false
            }
            // Set user immediately from login response
            if (data.user) {
                const userData = await buildUserFromSession(data.user)
                userIdRef.current = data.user.id
                setUser(userData)
                initDoneRef.current = true
                // Non-blocking fetch
                fetchData(data.user.id)
            }
            toast.success("Xush kelibsiz!")
            setLoading(false)
            return true
        } catch (e: any) {
            toast.error(e.message)
            setLoading(false)
            return false
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        userIdRef.current = null
        initDoneRef.current = false
        setUser(null)
        setCustomers([])
        setTransactions([])
        setAllUsers([])
        toast.info("Tizimdan chiqildi")
    }

    // ==================== CUSTOMER CRUD ====================
    const addCustomer = async (name: string, phone: string) => {
        try {
            const uid = userIdRef.current
            if (!uid) { toast.error("Siz tizimga kirmagansiz!"); return }
            const { data, error } = await supabase.from('customers').insert([{ name, phone, user_id: uid }]).select().single()
            if (error) throw error
            setCustomers(prev => [{ id: data.id, name: data.name, phone: data.phone || '', totalDebt: 0, lastTransactionDate: new Date().toISOString() }, ...prev])
            toast.success("Mijoz qo'shildi")
        } catch (error: any) {
            console.error("Add Customer Error:", error)
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

    // ==================== TRANSACTION CRUD ====================
    const addTransaction = async (customerId: string, amount: number, type: 'debt' | 'payment', description: string, date: string, dueDate?: string) => {
        try {
            const uid = userIdRef.current
            if (!uid) { toast.error("Siz tizimga kirmagansiz!"); return }

            let finalNote = description
            if (dueDate) finalNote = `${description} | Muddat: ${dueDate}`

            const { data, error } = await supabase
                .from('transactions')
                .insert([{ customer_id: customerId, amount, type, date, description: finalNote, note: finalNote, user_id: uid }])
                .select()
                .maybeSingle()

            if (error) throw error
            if (!data) throw new Error("Ma'lumot saqlanmadi")

            const newTx: Transaction = {
                id: data.id, customerId: data.customer_id, amount: Number(data.amount),
                type: data.type as 'debt' | 'payment', date: data.date,
                description: data.description || data.note || ''
            }
            setTransactions(prev => [newTx, ...prev])
            setCustomers(prev => prev.map(c => {
                if (c.id === customerId) {
                    return { ...c, totalDebt: c.totalDebt + (type === 'debt' ? amount : -amount), lastTransactionDate: date }
                }
                return c
            }))
            toast.success("Amaliyot bajarildi")
        } catch (error: any) {
            console.error("Transaction Error:", error)
            toast.error("Xatolik: " + error.message)
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
                    return { ...c, totalDebt: c.totalDebt + (t.type === 'debt' ? -t.amount : t.amount) }
                }
                return c
            }))
            toast.success("O'chirildi")
        } catch (error: any) {
            toast.error("Xatolik: " + error.message)
        }
    }

    // ==================== ADMIN: FETCH ALL USERS ====================
    const fetchAllUsers = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error("Fetch Users Error:", error)
                return
            }

            setAllUsers((data || []).map((p: any) => ({
                id: p.id,
                email: p.email,
                name: p.name,
                storeName: p.store_name,
                isAdmin: p.email === "admin@0707.com",
                password: p.plain_password,
                isBlocked: p.is_blocked || false,
                subscriptionEndDate: p.subscription_end_date
            })))
        } catch (e: any) {
            console.error("Fetch Users Exception:", e)
        }
    }, [])

    useEffect(() => {
        if (user?.isAdmin) fetchAllUsers()
    }, [user?.isAdmin, fetchAllUsers])

    // ==================== ADMIN: REGISTER USER ====================
    const registerUser = async (email: string, password: string, name: string, storeName: string, subscriptionEndDate?: string) => {
        try {
            if (password.length < 6) {
                toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak")
                return false
            }

            const defaultSubDate = new Date()
            defaultSubDate.setDate(defaultSubDate.getDate() + 30)
            const finalSubDate = subscriptionEndDate || defaultSubDate.toISOString().split('T')[0]

            // Use temp client so we don't lose admin session
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
            )

            // Step 1: Create auth user
            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email, password,
                options: { data: { name, store_name: storeName } }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("Foydalanuvchi yaratilmadi")

            // Step 2: Insert profile
            // Try with tempClient first (as the new user). If Confirm Email is OFF, this works.
            // If it fails (RLS), fall back to main admin supabase client.
            let profileInserted = false

            if (authData.session) {
                // tempClient has a session as the new user -> insert as that user
                const { error: pErr } = await tempClient.from('user_profiles').insert({
                    id: authData.user.id, email, plain_password: password,
                    name, store_name: storeName, is_blocked: false,
                    subscription_end_date: finalSubDate
                })
                if (!pErr) {
                    profileInserted = true
                } else {
                    console.warn("tempClient insert failed, trying admin client:", pErr.message)
                }
            }

            if (!profileInserted) {
                // Fallback: use admin's supabase client
                const { error: pErr2 } = await supabase.from('user_profiles').insert({
                    id: authData.user.id, email, plain_password: password,
                    name, store_name: storeName, is_blocked: false,
                    subscription_end_date: finalSubDate
                })
                if (pErr2) throw pErr2
            }

            toast.success("Yangi do'kon muvaffaqiyatli qo'shildi!")
            await fetchAllUsers()
            return true
        } catch (error: any) {
            console.error("Register User Error:", error)
            toast.error("Xatolik: " + (error.message || "Noma'lum xatolik"))
            return false
        }
    }

    // ==================== ADMIN: USER MANAGEMENT ====================
    const updateUserPassword = async (id: string, password: string) => {
        const { error } = await supabase.from('user_profiles').update({ plain_password: password }).eq('id', id)
        if (!error) {
            setAllUsers(prev => prev.map(u => u.id === id ? { ...u, password } : u))
            toast.success("Parol yangilandi")
        } else toast.error("Xatolik: " + error.message)
    }

    const updateUserSubscription = async (id: string, newDate: string) => {
        try {
            // Use main admin supabase client (admin is authenticated)
            const { error } = await supabase.from('user_profiles').update({ subscription_end_date: newDate }).eq('id', id)
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
