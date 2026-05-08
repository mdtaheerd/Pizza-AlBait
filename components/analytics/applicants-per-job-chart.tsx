'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ApplicantsPerJobChartProps {
  data: {
    job: string
    applicants: number
  }[]
}

// Gradient colors from high to low
const COLORS = [
  '#8B5CF6', // Violet (highest)
  '#A855F7', // Purple
  '#C084FC', // Light Purple
  '#D8B4FE', // Lighter Purple
  '#E879F9', // Fuchsia
  '#F0ABFC', // Pink-Purple
  '#F5D0FE', // Light Pink
  '#FAE8FF', // Very Light Pink
  '#FCE7F3', // Pale Pink
  '#FDF4FF', // Almost White
]

export function ApplicantsPerJobChart({ data }: ApplicantsPerJobChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No job application data available
      </div>
    )
  }

  // Sort by applicants descending and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.applicants - a.applicants)
    .slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis 
          dataKey="job" 
          type="category" 
          width={150}
          tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
          tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
          formatter={(value: number) => [value, 'Applicants']}
          cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
        />
        <Bar 
          dataKey="applicants" 
          radius={[0, 6, 6, 0]}
          name="Applicants"
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
