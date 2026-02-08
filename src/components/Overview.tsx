import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useData } from "@/contexts/DataContext"

export function Overview() {
    const { transactions, formatCurrency } = useData()

    const debtTotal = transactions
        .filter((t) => t.type === "debt")
        .reduce((sum, t) => sum + t.amount, 0)

    const paymentTotal = transactions
        .filter((t) => t.type === "payment")
        .reduce((sum, t) => sum + t.amount, 0)

    const balance = debtTotal - paymentTotal

    // Use a tiny offset to avoid visual glitches if one is 0
    const data = [
        { name: "Qarz", value: debtTotal || 0, color: "#f43f5e" }, // Rose-500
        { name: "To'lov", value: paymentTotal || 0, color: "#10b981" }, // Emerald-500
    ]

    const isEmpty = debtTotal === 0 && paymentTotal === 0

    return (
        <div className="relative h-[300px] w-full flex items-center justify-center">
            {isEmpty ? (
                <div className="text-slate-400 font-medium">Ma'lumot yo'q</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={85}
                            outerRadius={110}
                            paddingAngle={0}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    style={{ filter: `drop-shadow(0px 4px 6px ${entry.color}50)` }} // Glowing effect
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-3 rounded-xl shadow-xl">
                                            <p className="text-sm font-semibold text-slate-600">{data.name}</p>
                                            <p className="text-lg font-bold" style={{ color: data.color }}>
                                                {formatCurrency(Number(payload[0].value))}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}

            {/* Central Summary Text (Absolute Center) */}
            {!isEmpty && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm text-slate-400 font-medium tracking-wide uppercase">Balans</span>
                    <span className={`text-2xl font-bold ${balance >= 0 ? "text-rose-500" : "text-emerald-600"}`}>
                        {formatCurrency(Math.abs(balance))}
                    </span>
                </div>
            )}
        </div>
    )
}
