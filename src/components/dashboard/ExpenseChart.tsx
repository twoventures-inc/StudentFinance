import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseChartProps {
  data: ExpenseData[];
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="h-[220px] w-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                padding: "8px 12px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`$${value.toFixed(0)}`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">${total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 justify-center md:flex-col md:gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
            <span className="text-sm font-medium ml-auto">${item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
