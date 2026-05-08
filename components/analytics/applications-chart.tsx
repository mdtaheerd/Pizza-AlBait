'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ApplicationsChartProps {
  data: { date: string; applications: number }[]
}

export function ApplicationsChart({ data }: ApplicationsChartProps) {
  const hasData = data.some((d) => d.applications > 0)

  if (!hasData) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No applications in the last 30 days
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
          formatter={(value: number) => [value, 'Applications']}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Area
          type="monotone"
          dataKey="applications"
          stroke="#10B981"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorApplications)"
          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
