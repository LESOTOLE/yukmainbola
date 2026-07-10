"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ChartData {
  name: string;
  total: number;
}

export default function DashboardCharts({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `Rp${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '8px' }}
            itemStyle={{ color: '#4ade80' }}
            formatter={(value: any) => [`Rp${Number(value || 0).toLocaleString('id-ID')}`, 'Pemasukan']}
          />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="#22c55e" 
            fill="#22c55e" 
            fillOpacity={0.2} 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
