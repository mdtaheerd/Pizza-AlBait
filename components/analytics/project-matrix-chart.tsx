'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ProjectMatrixData {
  project: string
  jobs: number
  applicants: number
  interviews: number
  offers: number
  rejections: number
  offerDeclines: number
  hires: number
}

interface ProjectMatrixChartProps {
  data: ProjectMatrixData[]
}

const COLORS = {
  jobs: '#6366f1', // indigo
  applicants: '#3b82f6', // blue
  interviews: '#8b5cf6', // purple
  offers: '#10b981', // green
  rejections: '#ef4444', // red
  offerDeclines: '#f59e0b', // amber
  hires: '#06b6d4', // cyan
}

export function ProjectMatrixChart({ data }: ProjectMatrixChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        No project data available
      </div>
    )
  }

  // Transform data for stacked bar chart - include jobs and all metrics
  const chartData = data.map(d => ({
    name: d.project.length > 15 ? d.project.substring(0, 15) + '...' : d.project,
    fullName: d.project,
    Jobs: d.jobs,
    Applicants: d.applicants,
    Interviews: d.interviews,
    Offers: d.offers,
    Rejections: d.rejections,
    'Offer Declines': d.offerDeclines,
    Hires: d.hires,
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={90}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [value, name]}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return payload[0].payload.fullName
            }
            return label
          }}
        />
        <Legend />
        <Bar dataKey="Jobs" stackId="a" fill={COLORS.jobs} />
        <Bar dataKey="Applicants" stackId="a" fill={COLORS.applicants} />
        <Bar dataKey="Interviews" stackId="a" fill={COLORS.interviews} />
        <Bar dataKey="Offers" stackId="a" fill={COLORS.offers} />
        <Bar dataKey="Hires" stackId="a" fill={COLORS.hires} />
        <Bar dataKey="Rejections" stackId="a" fill={COLORS.rejections} />
        <Bar dataKey="Offer Declines" stackId="a" fill={COLORS.offerDeclines} />
      </BarChart>
    </ResponsiveContainer>
  )
}
