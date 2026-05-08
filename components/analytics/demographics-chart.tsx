'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface DemographicsChartProps {
  data: {
    name: string
    value: number
  }[]
  title: string
}

// Vibrant, distinct colors for better visibility
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
  '#06B6D4', // Cyan
  '#A855F7', // Purple
]

export function DemographicsChart({ data, title }: DemographicsChartProps) {
  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        No {title.toLowerCase()} data available
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={2}
          stroke="#fff"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'Count']}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        />
        <Legend 
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={(value, entry) => {
            const item = data.find(d => d.name === value)
            const percentage = item ? ((item.value / total) * 100).toFixed(0) : 0
            return <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value} ({percentage}%)</span>
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
