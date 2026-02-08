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
}

export type Settings = {
    storeName: string
    ownerName: string
    phone: string
    smsTemplate: string
    isSetupCompleted: boolean
}

const defaultSettings: Settings = {
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
    updateSettings: (settings: Settings) => void
    addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void
    updateCustomer: (id: string, data: Partial<Customer>) => void
    deleteCustomer: (id: string) => void
    addTransaction: (transaction: Omit<Transaction, "id">) => void
    getCustomerBalance: (customerId: string) => number
    formatCurrency: (amount: number) => string
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Helper to generate IDs (simple numeric timestamp-based or random)
const generateId = () => Math.random().toString(36).substr(2, 9)

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [customers, setCustomers] = useState<Customer[]>(() => {
        const saved = localStorage.getItem("customers")
        return saved ? JSON.parse(saved) : []
    })

    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem("transactions")
        return saved ? JSON.parse(saved) : []
    })

    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem("settings")
        return saved ? JSON.parse(saved) : defaultSettings
    })

    useEffect(() => {
        localStorage.setItem("customers", JSON.stringify(customers))
    }, [customers])

    useEffect(() => {
        localStorage.setItem("transactions", JSON.stringify(transactions))
    }, [transactions])

    useEffect(() => {
        localStorage.setItem("settings", JSON.stringify(settings))
    }, [settings])

    const updateSettings = (newSettings: Settings) => {
        setSettings(newSettings)
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

    const addTransaction = (data: Omit<Transaction, "id">) => {
        const newTransaction: Transaction = {
            ...data,
            id: generateId(),
        }
        setTransactions((prev) => [newTransaction, ...prev])
    }

    const getCustomerBalance = (customerId: string) => {
        const customerTransactions = transactions.filter((t) => t.customerId === customerId)
        const debt = customerTransactions
            .filter((t) => t.type === "debt")
            .reduce((sum, t) => sum + t.amount, 0)
        const payment = customerTransactions
            .filter((t) => t.type === "payment")
            .reduce((sum, t) => sum + t.amount, 0)
        return debt - payment
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
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
                getCustomerBalance,
                formatCurrency,
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
