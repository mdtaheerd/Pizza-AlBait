'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface DepartmentChartProps {
  data: {
    department: string
    jobs: number
    applications: number
  }[]
}

export function DepartmentChart({ data }: DepartmentChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No department data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis 
          dataKey="department" 
          type="category" 
          width={120}
          tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>}
        />
        <Bar 
          dataKey="jobs" 
          name="Jobs Posted" 
          fill="#3B82F6" 
          radius={[0, 4, 4, 0]} 
        />
        <Bar 
          dataKey="applications" 
          name="Applications" 
          fill="#10B981" 
          radius={[0, 4, 4, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
