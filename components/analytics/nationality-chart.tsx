'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

interface NationalityChartProps {
  data: {
    name: string
    value: number
  }[]
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
]

export function NationalityChart({ data }: NationalityChartProps) {
  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No nationality data available
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={75}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'Candidates']}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        />
        <Bar 
          dataKey="value" 
          radius={[0, 4, 4, 0]}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
