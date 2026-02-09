import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

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
    email: string
    name: string
    storeName: string
    isAdmin?: boolean
    isBlocked?: boolean
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
}

interface DataContextType {
    user: User | null
    customers: Customer[]
    transactions: Transaction[]
    loading: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    registerUser: (email: string, password: string, name: string, storeName: string) => Promise<boolean>
    addCustomer: (name: string, phone: string) => void
    updateCustomer: (id: string, name: string, phone: string) => void
    deleteCustomer: (id: string) => void
    addTransaction: (customerId: string, amount: number, type: 'debt' | 'payment', description: string, date: string) => void
    deleteTransaction: (id: string) => void
    settings: AppSettings
    updateSettings: (newSettings: Partial<AppSettings>) => void
    importData: (jsonData: string) => boolean
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
        smsTemplate: "Hurmatli {mijoz}, sizning {do'kon} do'konidan {summa} qarz qarzingiz mavjud."
    })

    // Initialize data from localStorage
    useEffect(() => {
        const loadData = () => {
            try {
                const storedUser = localStorage.getItem('user')
                const storedCustomers = localStorage.getItem('customers')
                const storedTransactions = localStorage.getItem('transactions')
                const storedSettings = localStorage.getItem('settings')

                if (storedUser) setUser(JSON.parse(storedUser))
                if (storedCustomers) setCustomers(JSON.parse(storedCustomers))
                if (storedTransactions) setTransactions(JSON.parse(storedTransactions))
                if (storedSettings) setSettings(JSON.parse(storedSettings))
            } catch (error) {
                console.error("Failed to load data from localStorage", error)
                toast.error("Ma'lumotlarni yuklashda xatolik!")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    // Persist data whenever it changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('customers', JSON.stringify(customers))
        }
    }, [customers, loading])

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('transactions', JSON.stringify(transactions))
        }
    }, [transactions, loading])

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('settings', JSON.stringify(settings))
        }
    }, [settings, loading])

    const login = async (email: string, password: string) => {
        setLoading(true)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))

        if (email === "admin@nasiya.uz" && password === "123") {
            const adminUser: User = {
                email,
                name: "Admin",
                storeName: "Asosiy Do'kon",
                isAdmin: true
            }
            setUser(adminUser)
            // Save user to stay logged in
            localStorage.setItem('user', JSON.stringify(adminUser))
            toast.success("Xush kelibsiz!")
            setLoading(false)
            return true
        }

        toast.error("Login yoki parol xato")
        setLoading(false)
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        toast.info("Tizimdan chiqildi")
    }

    // Mock register for consistency, though we are hiding it
    const registerUser = async (_email: string, _password: string, _name: string, _storeName: string) => {
        return false;
    }

    const addCustomer = (name: string, phone: string) => {
        const newCustomer: Customer = {
            id: Date.now().toString(),
            name,
            phone,
            totalDebt: 0,
            lastTransactionDate: new Date().toISOString()
        }
        setCustomers(prev => [newCustomer, ...prev])
        toast.success("Mijoz qo'shildi")
    }

    const updateCustomer = (id: string, name: string, phone: string) => {
        setCustomers(prev => prev.map(c =>
            c.id === id ? { ...c, name, phone } : c
        ))
        toast.success("Mijoz ma'lumotlari yangilandi")
    }

    const deleteCustomer = (id: string) => {
        setCustomers(prev => prev.filter(c => c.id !== id))
        // Also delete associated transactions
        setTransactions(prev => prev.filter(t => t.customerId !== id))
        toast.success("Mijoz o'chirildi")
    }

    const addTransaction = (customerId: string, amount: number, type: 'debt' | 'payment', description: string, date: string) => {
        const newTransaction: Transaction = {
            id: Date.now().toString(),
            customerId,
            amount,
            type,
            description,
            date
        }

        setTransactions(prev => [newTransaction, ...prev])

        // Update customer total debt
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

        toast.success("Muammo qo'shildi")
    }

    const deleteTransaction = (id: string) => {
        const transaction = transactions.find(t => t.id === id)
        if (!transaction) return

        setTransactions(prev => prev.filter(t => t.id !== id))

        // Revert customer debt
        setCustomers(prev => prev.map(c => {
            if (c.id === transaction.customerId) {
                const change = transaction.type === 'debt' ? -transaction.amount : transaction.amount
                return {
                    ...c,
                    totalDebt: c.totalDebt + change
                }
            }
            return c
        }))

        toast.success("O'chirildi")
    }

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }))
        toast.success("Sozlamalar saqlandi")
    }

    const importData = (jsonData: string): boolean => {
        try {
            const data = JSON.parse(jsonData)

            if (data.customers && Array.isArray(data.customers)) {
                setCustomers(data.customers)
            }

            if (data.transactions && Array.isArray(data.transactions)) {
                setTransactions(data.transactions)
            }

            if (data.settings) {
                setSettings(data.settings)
            }

            toast.success("Ma'lumotlar tiklandi!")
            return true
        } catch (e) {
            console.error(e)
            toast.error("Fayl formati noto'g'ri")
            return false
        }
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
            updateSettings,
            importData
        }}>
            {children}
        </DataContext.Provider>
    )
}
