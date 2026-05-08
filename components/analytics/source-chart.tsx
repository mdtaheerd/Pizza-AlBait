'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface SourceChartProps {
  data: { source: string; count: number }[]
}

// Vibrant, distinct colors
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
]

export function SourceChart({ data }: SourceChartProps) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No candidate source data available yet
      </div>
    )
  }

  // Filter out zero counts
  const filteredData = data.filter((d) => d.count > 0)
  const total = filteredData.reduce((sum, item) => sum + item.count, 0)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="count"
          nameKey="source"
          strokeWidth={2}
          stroke="#fff"
          label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {filteredData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
          formatter={(value: number, name: string) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]}
        />
        <Legend 
          formatter={(value) => <span style={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
