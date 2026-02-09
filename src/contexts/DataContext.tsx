import React, { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export type Customer = {
    id: string
    name: string
    phone: string
    note?: string
    createdAt: string
}

export type Transaction = {
    id: string
    customerId: string
    type: "debt" | "payment"
    amount: number
    date: string
    note?: string
    returnDate?: string
}

export type Settings = {
    currency: string
    storeName: string
    ownerName: string
    phone: string
    smsTemplate: string
    isSetupCompleted: boolean
    profileImage?: string
}

const defaultSettings: Settings = {
    currency: "UZS",
    storeName: "",
    ownerName: "",
    phone: "",
    smsTemplate: "Hurmatli {mijoz}, sizning {do'kon}dagi qarzingiz: {summa}",
    isSetupCompleted: false,
}

type DataContextType = {
    customers: Customer[]
    transactions: Transaction[]
    settings: Settings
    updateSettings: (newSettings: Partial<Settings>) => void
    addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void
    updateCustomer: (id: string, data: Partial<Customer>) => void
    deleteCustomer: (id: string) => void
    addTransaction: (transaction: Omit<Transaction, "id" | "date">) => void
    deleteTransaction: (id: string) => void
    getCustomerBalance: (customerId: string) => number
    formatCurrency: (amount: number) => string
    user: any | null
    login: (email: string, pass: string) => Promise<boolean>
    logout: () => void
    registerUser: (email: string, pass: string, name: string, storeName: string) => any
    updateUserPassword: (id: string, newPass: string) => void
    toggleUserBlock: (id: string) => void
    updateUserLogin: (id: string, newLogin: string) => void
    allUsers: any[]
    loading: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null)
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Auth Initialization & State Change Listener
    useEffect(() => {
        // 1. Check active session immediately on mount
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                // User is logged in, fetch profile
                await fetchUserProfile(session.user.id)
            } else {
                // No user, stop loading so Login page can show
                setLoading(false)
            }
        }
        initAuth()

        // 2. Listen for future changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setLoading(true)
                await fetchUserProfile(session.user.id)
            } else {
                setUser(null)
                setCustomers([])
                setTransactions([])
                setSettings(defaultSettings)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching profile:", error)
                setLoading(false)
                return
            }

            if (data) {
                const mappedUser = {
                    id: data.id,
                    email: data.email,
                    name: data.full_name,
                    storeName: data.store_name,
                    isAdmin: data.is_admin,
                    isBlocked: data.is_blocked,
                    subscriptionDate: data.subscription_date,
                    phone: data.phone
                }
                setUser(mappedUser)

                setSettings({
                    ...defaultSettings,
                    currency: data.currency || "UZS",
                    storeName: data.store_name || "",
                    ownerName: data.full_name || "",
                    phone: data.phone || "",
                    smsTemplate: data.sms_template || defaultSettings.smsTemplate,
                    isSetupCompleted: !!data.store_name
                })

                if (data.is_admin) {
                    await fetchAllUsers()
                }

                // Initial data fetch
                await fetchData(data.id)
            } else {
                // Profile missing, allow UI to handle setup or create default
                // For now, we assume profile trigger works or we create it here if needed
                console.warn("Profile not found for user:", userId)
                setLoading(false)
            }
        } catch (e) {
            console.error("Profile fetch error:", e)
            setLoading(false)
        }
        // distinct from finally, because we might mistakenly turn off loading inside fetchData steps
    }

    const fetchData = async (userId: string) => {
        try {
            // Fetch Customers
            const { data: customersData, error: customersError } = await supabase
                .from('customers')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (!customersError && customersData) {
                setCustomers(customersData.map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone,
                    note: c.note,
                    createdAt: c.created_at
                })))
            }

            // Fetch Transactions
            const { data: transactionsData, error: transactionsError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false })

            if (!transactionsError && transactionsData) {
                setTransactions(transactionsData.map(t => ({
                    id: t.id,
                    customerId: t.customer_id,
                    type: t.type,
                    amount: t.amount,
                    date: t.date,
                    note: t.note,
                    returnDate: t.return_date
                })))
            }
        } catch (e) {
            console.error("Data fetch error:", e)
        } finally {
            setLoading(false)
        }
    }

    const fetchAllUsers = async () => {
        const { data, error } = await supabase.from('profiles').select('*')
        if (!error && data) {
            setAllUsers(data.map(u => ({
                id: u.id,
                email: u.email,
                name: u.full_name,
                storeName: u.store_name,
                isAdmin: u.is_admin,
                isBlocked: u.is_blocked,
                subscriptionDate: u.subscription_date
            })))
        }
    }

    const login = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        })

        if (error) {
            toast.error("Xatolik: " + (error.message || "Login yoki parol noto'g'ri"))
            return false
        }
        return true
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setCustomers([])
        setTransactions([])
        setUser(null)
    }

    const registerUser = async (email: string, pass: string, name: string, storeName: string) => {
        setLoading(true)
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: {
                    full_name: name,
                    store_name: storeName
                }
            }
        })

        if (error) {
            toast.error("Ro'yxatdan o'tishda xatolik: " + error.message)
            setLoading(false)
            return null
        }

        toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!")
        return data
    }

    const updateUserPassword = async (_id: string, _newPass: string) => {
        toast.info("Bu funksiya tez orada qo'shiladi")
    }

    const toggleUserBlock = async (id: string) => {
        const u = allUsers.find(u => u.id === id)
        if (!u) return

        const { error } = await supabase
            .from('profiles')
            .update({ is_blocked: !u.isBlocked })
            .eq('id', id)

        if (!error) {
            setAllUsers(prev => prev.map(user => user.id === id ? { ...user, isBlocked: !user.isBlocked } : user))
            toast.success("Holat o'zgartirildi")
        }
    }

    const updateUserLogin = async (_id: string, _newLogin: string) => {
        toast.info("Bu funksiya tez orada qo'shiladi")
    }

    // Data State
    const [customers, setCustomers] = useState<Customer[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [settings, setSettings] = useState<Settings>(defaultSettings)

    const updateSettings = async (newSettings: Partial<Settings>) => {
        if (!user) return

        const updatedSettings = { ...settings, ...newSettings }

        // Map UI Settings to Supabase Profile columns
        const profileUpdates: any = {}
        if (newSettings.currency) profileUpdates.currency = newSettings.currency
        if (newSettings.storeName) profileUpdates.store_name = newSettings.storeName
        if (newSettings.ownerName) profileUpdates.full_name = newSettings.ownerName
        if (newSettings.phone) profileUpdates.phone = newSettings.phone
        if (newSettings.smsTemplate) profileUpdates.sms_template = newSettings.smsTemplate

        const { error } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id)

        if (!error) {
            setSettings(updatedSettings)
            toast.success("Sozlamalar saqlandi")
        } else {
            toast.error("Xatolik: " + error.message)
        }
    }

    const addCustomer = async (data: Omit<Customer, "id" | "createdAt">) => {
        if (!user) return

        const { data: newCustomer, error } = await supabase
            .from('customers')
            .insert({
                user_id: user.id,
                name: data.name,
                phone: data.phone,
                note: data.note
            })
            .select()
            .single()

        if (!error && newCustomer) {
            setCustomers(prev => [{
                id: newCustomer.id,
                name: newCustomer.name,
                phone: newCustomer.phone,
                note: newCustomer.note,
                createdAt: newCustomer.created_at
            }, ...prev])
            toast.success("Mijoz qo'shildi")
        } else {
            toast.error("Xatolik: " + (error?.message || "Mijozni qo'shib bo'lmadi"))
        }
    }

    const updateCustomer = async (id: string, data: Partial<Customer>) => {
        if (!user) return

        const { error } = await supabase
            .from('customers')
            .update({
                name: data.name,
                phone: data.phone,
                note: data.note
            })
            .eq('id', id)
            .eq('user_id', user.id)

        if (!error) {
            setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
            toast.success("Mijoz ma'lumotlari yangilandi")
        }
    }

    const deleteCustomer = async (id: string) => {
        if (!user) return

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (!error) {
            setCustomers(prev => prev.filter(c => c.id !== id))
            setTransactions(prev => prev.filter(t => t.customerId !== id))
            toast.success("Mijoz o'chirildi")
        }
    }

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
        if (!user) return

        const { data: newTransaction, error } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                customer_id: transaction.customerId,
                amount: transaction.amount,
                type: transaction.type,
                note: transaction.note,
                return_date: transaction.returnDate
            })
            .select()
            .single()

        if (!error && newTransaction) {
            setTransactions(prev => [{
                id: newTransaction.id,
                customerId: newTransaction.customer_id,
                type: newTransaction.type,
                amount: newTransaction.amount,
                date: newTransaction.date,
                note: newTransaction.note,
                returnDate: newTransaction.return_date
            }, ...prev])
            toast.success("Savdo saqlandi")
        } else {
            toast.error("Xatolik: " + (error?.message || "Amaliyot saqlanmadi"))
        }
    }

    const deleteTransaction = async (id: string) => {
        if (!user) return

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (!error) {
            setTransactions(prev => prev.filter(t => t.id !== id))
            toast.success("Amaliyot o'chirildi")
        }
    }

    const getCustomerBalance = (customerId: string) => {
        return transactions
            .filter((t) => t.customerId === customerId)
            .reduce((total, t) => {
                return total + (t.type === "debt" ? t.amount : -t.amount)
            }, 0)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: settings.currency || "UZS",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <DataContext.Provider
            value={{
                customers,
                transactions,
                settings,
                updateSettings,
                addCustomer,
                updateCustomer,
                deleteCustomer,
                addTransaction,
                deleteTransaction,
                getCustomerBalance,
                formatCurrency,
                user,
                login,
                logout,
                registerUser,
                updateUserPassword,
                toggleUserBlock,
                updateUserLogin,
                allUsers,
                loading
            }}
        >
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider")
    }
    return context
}
