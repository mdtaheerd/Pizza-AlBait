'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ApplicantsPerJobChartProps {
  data: {
    job: string
    applicants: number
  }[]
}

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
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" />
        <YAxis 
          dataKey="job" 
          type="category" 
          width={150}
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
          formatter={(value: number) => [value, 'Applicants']}
        />
        <Bar 
          dataKey="applicants" 
          fill="hsl(var(--chart-3))" 
          radius={[0, 4, 4, 0]}
          name="Applicants"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
