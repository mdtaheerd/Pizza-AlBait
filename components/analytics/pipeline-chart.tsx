'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface PipelineChartProps {
  data: { stage: string; count: number }[]
}

const COLORS = [
  '#64748b', // slate - Applied
  '#3b82f6', // blue - Screening
  '#f59e0b', // amber - Interview
  '#a855f7', // purple - Assessment
  '#10b981', // emerald - Offer
  '#22c55e', // green - Hired
  '#ef4444', // red - Rejected
]

export function PipelineChart({ data }: PipelineChartProps) {
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No pipeline data available yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" />
        <YAxis dataKey="stage" type="category" width={80} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [value, 'Candidates']}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
