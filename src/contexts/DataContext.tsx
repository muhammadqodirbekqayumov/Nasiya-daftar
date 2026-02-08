import React, { createContext, useContext, useState, useEffect } from "react"

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
    addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void // Kept original Omit for addCustomer as instruction's was likely a typo
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
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9)

// Initial Mock Users
const INITIAL_USERS = [
    {
        id: "admin_id",
        email: "admin@nasiya.uz",
        password: "123",
        name: "Super Admin",
        storeName: "Bosh Ofis",
        isAdmin: true,
        subscriptionDate: new Date().toISOString(), // Always active
        isBlocked: false
    },
    {
        id: "demo_id",
        email: "demo@nasiya.uz",
        password: "123",
        name: "Demo Do'kon",
        storeName: "Demo Market",
        subscriptionDate: new Date().toISOString(),
        isBlocked: false
    }
]

export function DataProvider({ children }: { children: React.ReactNode }) {
    // Auth State
    const [usersList, setUsersList] = useState<any[]>(() => {
        const saved = localStorage.getItem("nasiya_users_db")
        return saved ? JSON.parse(saved) : INITIAL_USERS
    })

    const [user, setUser] = useState<any | null>(() => {
        const saved = localStorage.getItem("nasiya_current_user")
        return saved ? JSON.parse(saved) : null
    })

    // Check Subscription Status on Load/Change
    useEffect(() => {
        if (user && !user.isAdmin) {
            const subDate = new Date(user.subscriptionDate)
            const now = new Date()
            const diffTime = Math.abs(now.getTime() - subDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays > 30 && !user.isBlocked) {
                // Auto-block logic
                const updatedUser = { ...user, isBlocked: true }
                setUser(updatedUser)
                localStorage.setItem("nasiya_current_user", JSON.stringify(updatedUser))

                // Update in usersList as well
                setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: true } : u))
            }
        }
    }, [user?.id])

    useEffect(() => {
        localStorage.setItem("nasiya_users_db", JSON.stringify(usersList))
    }, [usersList])

    const registerUser = (email: string, pass: string, name: string, storeName: string) => {
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            password: pass,
            name,
            storeName,
            subscriptionDate: new Date().toISOString(),
            isBlocked: false
        }
        setUsersList(prev => [...prev, newUser])
        return newUser
    }

    const login = async (email: string, pass: string) => {
        // Simulate Network Delay
        await new Promise(resolve => setTimeout(resolve, 800))

        const foundUser = usersList.find(u => u.email === email && u.password === pass)

        if (foundUser) {
            const userData = { ...foundUser }
            // Check expiry immediately on login too
            const subDate = new Date(userData.subscriptionDate)
            const now = new Date()
            const diffTime = Math.abs(now.getTime() - subDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays > 30 && !userData.isAdmin) {
                userData.isBlocked = true
            }

            // Don't store password in state/storage
            // @ts-ignore
            delete userData.password

            setUser(userData)
            localStorage.setItem("nasiya_current_user", JSON.stringify(userData))
            return true
        }
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("nasiya_current_user")
    }

    const updateUserPassword = (id: string, newPass: string) => {
        setUsersList(prev => prev.map(u => u.id === id ? { ...u, password: newPass } : u))
    }

    const toggleUserBlock = (id: string) => {
        setUsersList(prev => prev.map(u => {
            if (u.id === id) {
                return { ...u, isBlocked: !u.isBlocked }
            }
            return u
        }))

        // Also update current user if it's the one being blocked (though unlikely to block self, good for safety)
        if (user && user.id === id) {
            const updated = { ...user, isBlocked: !user.isBlocked }
            setUser(updated)
            localStorage.setItem("nasiya_current_user", JSON.stringify(updated))
        }
    }

    const updateUserLogin = (id: string, newLogin: string) => {
        setUsersList(prev => prev.map(u => u.id === id ? { ...u, email: newLogin } : u))
        // Update current session if needed
        if (user && user.id === id) {
            const updated = { ...user, email: newLogin }
            setUser(updated)
            localStorage.setItem("nasiya_current_user", JSON.stringify(updated))
        }
    }

    // Data State - Depends on User ID
    const [customers, setCustomers] = useState<Customer[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [settings, setSettings] = useState<Settings>(defaultSettings)

    // Load data when User changes
    useEffect(() => {
        if (user) {
            const userKey = `nasiya_data_${user.id}`
            const savedData = localStorage.getItem(userKey)

            if (savedData) {
                const parsed = JSON.parse(savedData)
                setCustomers(parsed.customers || [])
                setTransactions(parsed.transactions || [])
                setSettings(parsed.settings || { ...defaultSettings, storeName: user.storeName, ownerName: user.name })
            } else {
                // Initialize fresh data for this user
                setCustomers([])
                setTransactions([])
                setSettings({ ...defaultSettings, storeName: user.storeName, ownerName: user.name })
            }
        } else {
            setCustomers([])
            setTransactions([])
        }
    }, [user])

    // Save data whenever it changes (only if logged in)
    useEffect(() => {
        if (user) {
            const userKey = `nasiya_data_${user.id}`
            const dataToSave = {
                customers,
                transactions,
                settings
            }
            localStorage.setItem(userKey, JSON.stringify(dataToSave))
        }
    }, [user, customers, transactions, settings])

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }))
    }

    const addCustomer = (data: Omit<Customer, "id" | "createdAt">) => {
        const newCustomer: Customer = {
            ...data,
            id: generateId(),
            createdAt: new Date().toISOString(),
        }
        setCustomers((prev) => [newCustomer, ...prev])
    }

    const updateCustomer = (id: string, data: Partial<Customer>) => {
        setCustomers((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...data } : c))
        )
    }

    const deleteCustomer = (id: string) => {
        setCustomers((prev) => prev.filter((c) => c.id !== id))
        setTransactions((prev) => prev.filter((t) => t.customerId !== id))
    }

    const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
        }
        setTransactions(prev => [...prev, newTransaction])
    }

    const deleteTransaction = (id: string) => {
        setTransactions((prev) => prev.filter((t) => t.id !== id))
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
                allUsers: usersList
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
