import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useState } from "react";
import { formatPEN } from "@/utils/currency";

interface DataPoint {
  month: string;
  kuna: number;
  bank: number;
}

const data6m: DataPoint[] = [
  { month: "Dic", kuna: 200, bank: 200 },
  { month: "Ene", kuna: 410, bank: 401 },
  { month: "Feb", kuna: 632, bank: 603 },
  { month: "Mar", kuna: 868, bank: 805 },
  { month: "Abr", kuna: 1019, bank: 909 },
  { month: "May", kuna: 1070, bank: 951 },
];

const data1y: DataPoint[] = [
  ...data6m,
  { month: "Jun", kuna: 1175, bank: 1003 },
  { month: "Jul", kuna: 1287, bank: 1056 },
  { month: "Ago", kuna: 1398, bank: 1109 },
  { month: "Sep", kuna: 1503, bank: 1162 },
  { month: "Oct", kuna: 1620, bank: 1216 },
  { month: "Nov", kuna: 1745, bank: 1271 },
];

export function SavingsChart() {
  const [range, setRange] = useState<"6m" | "1y">("6m");
  const data = range === "6m" ? data6m : data1y;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">Evolución de ahorros</h3>
        <div className="flex gap-1 p-1 bg-bg-tertiary rounded-xl">
          {(["6m", "1y"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                range === r
                  ? "bg-bg-secondary text-accent-gold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {r === "6m" ? "6M" : "1A"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              stroke="#8892A4"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#8892A4"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `S/${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#0D1526",
                border: "1px solid rgba(245,166,35,0.3)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "#F0F4FF" }}
              formatter={(v, name) => [
                formatPEN(Number(v)),
                name === "kuna" ? "KUNA" : "Banco",
              ]}
            />
            <Line
              type="monotone"
              dataKey="kuna"
              stroke="#F5A623"
              strokeWidth={3}
              dot={{ fill: "#F5A623", r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="bank"
              stroke="#4A5568"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-5 mt-3 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-accent-gold" /> Tu ahorro KUNA
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-text-muted border-dashed" /> Banco tradicional
        </div>
      </div>
    </div>
  );
}
