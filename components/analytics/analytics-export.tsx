'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'

interface AnalyticsData {
  summary: {
    totalJobs: number
    openJobs: number
    totalCandidates: number
    totalApplications: number
    applicationsLast30Days: number
    applicationChangePercent: number
  }
  departmentStats: { department: string; jobs: number; applications: number }[]
  applicantsPerJob: { job: string; applicants: number }[]
  pipelineData: { stage: string; count: number }[]
  sourceData: { source: string; count: number }[]
  nationalityData: { name: string; value: number }[]
  genderData: { name: string; value: number }[]
  ageData: { name: string; value: number }[]
  applicationsOverTime: { date: string; applications: number }[]
}

interface AnalyticsExportProps {
  data: AnalyticsData
}

export function AnalyticsExport({ data }: AnalyticsExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToExcel = async (reportType: 'full' | 'department' | 'demographics' | 'pipeline') => {
    setIsExporting(true)
    
    try {
      const workbook = XLSX.utils.book_new()
      const dateStr = format(new Date(), 'yyyy-MM-dd')

      if (reportType === 'full' || reportType === 'department') {
        // Summary Sheet
        if (reportType === 'full') {
          const summaryData = [
            ['CPECC Recruitment Analytics Report'],
            ['Generated on:', format(new Date(), 'MMMM d, yyyy h:mm a')],
            [''],
            ['Key Metrics'],
            ['Metric', 'Value'],
            ['Total Jobs', data.summary.totalJobs],
            ['Open Jobs', data.summary.openJobs],
            ['Total Candidates', data.summary.totalCandidates],
            ['Total Applications', data.summary.totalApplications],
            ['Applications (Last 30 Days)', data.summary.applicationsLast30Days],
            ['Application Change (%)', `${data.summary.applicationChangePercent}%`],
          ]
          const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
          summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }]
          XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
        }

        // Department Stats Sheet
        const deptData = [
          ['Department Analytics'],
          ['Department', 'Jobs Posted', 'Applications'],
          ...data.departmentStats.map(d => [d.department, d.jobs, d.applications])
        ]
        const deptSheet = XLSX.utils.aoa_to_sheet(deptData)
        deptSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }]
        XLSX.utils.book_append_sheet(workbook, deptSheet, 'By Department')

        // Applicants per Job Sheet
        const jobData = [
          ['Candidates per Position'],
          ['Position', 'Number of Applicants'],
          ...data.applicantsPerJob.map(j => [j.job, j.applicants])
        ]
        const jobSheet = XLSX.utils.aoa_to_sheet(jobData)
        jobSheet['!cols'] = [{ wch: 40 }, { wch: 20 }]
        XLSX.utils.book_append_sheet(workbook, jobSheet, 'By Position')
      }

      if (reportType === 'full' || reportType === 'demographics') {
        // Nationality Sheet
        const nationalitySheetData = [
          ['Candidates by Nationality'],
          ['Nationality', 'Count', 'Percentage'],
          ...data.nationalityData.map(n => {
            const total = data.nationalityData.reduce((sum, item) => sum + item.value, 0)
            const percentage = total > 0 ? ((n.value / total) * 100).toFixed(1) + '%' : '0%'
            return [n.name, n.value, percentage]
          })
        ]
        const nationalitySheet = XLSX.utils.aoa_to_sheet(nationalitySheetData)
        nationalitySheet['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 12 }]
        XLSX.utils.book_append_sheet(workbook, nationalitySheet, 'By Nationality')

        // Age Distribution Sheet
        const ageSheetData = [
          ['Candidates by Age Group'],
          ['Age Group', 'Count', 'Percentage'],
          ...data.ageData.map(a => {
            const total = data.ageData.reduce((sum, item) => sum + item.value, 0)
            const percentage = total > 0 ? ((a.value / total) * 100).toFixed(1) + '%' : '0%'
            return [a.name, a.value, percentage]
          })
        ]
        const ageSheet = XLSX.utils.aoa_to_sheet(ageSheetData)
        ageSheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }]
        XLSX.utils.book_append_sheet(workbook, ageSheet, 'By Age')

        // Gender Distribution Sheet
        const genderSheetData = [
          ['Candidates by Gender'],
          ['Gender', 'Count', 'Percentage'],
          ...data.genderData.map(g => {
            const total = data.genderData.reduce((sum, item) => sum + item.value, 0)
            const percentage = total > 0 ? ((g.value / total) * 100).toFixed(1) + '%' : '0%'
            return [g.name, g.value, percentage]
          })
        ]
        const genderSheet = XLSX.utils.aoa_to_sheet(genderSheetData)
        genderSheet['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 12 }]
        XLSX.utils.book_append_sheet(workbook, genderSheet, 'By Gender')
      }

      if (reportType === 'full' || reportType === 'pipeline') {
        // Pipeline Sheet
        const pipelineSheetData = [
          ['Pipeline Distribution'],
          ['Stage', 'Count', 'Percentage'],
          ...data.pipelineData.map(p => {
            const total = data.pipelineData.reduce((sum, item) => sum + item.count, 0)
            const percentage = total > 0 ? ((p.count / total) * 100).toFixed(1) + '%' : '0%'
            return [p.stage, p.count, percentage]
          })
        ]
        const pipelineSheet = XLSX.utils.aoa_to_sheet(pipelineSheetData)
        pipelineSheet['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 12 }]
        XLSX.utils.book_append_sheet(workbook, pipelineSheet, 'Pipeline')

        // Source Sheet
        const sourceSheetData = [
          ['Candidate Sources'],
          ['Source', 'Count', 'Percentage'],
          ...data.sourceData.map(s => {
            const total = data.sourceData.reduce((sum, item) => sum + item.count, 0)
            const percentage = total > 0 ? ((s.count / total) * 100).toFixed(1) + '%' : '0%'
            return [s.source, s.count, percentage]
          })
        ]
        const sourceSheet = XLSX.utils.aoa_to_sheet(sourceSheetData)
        sourceSheet['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 12 }]
        XLSX.utils.book_append_sheet(workbook, sourceSheet, 'Sources')

        // Applications Over Time Sheet
        if (reportType === 'full') {
          const timeData = [
            ['Applications Over Time (Last 30 Days)'],
            ['Date', 'Applications'],
            ...data.applicationsOverTime.map(t => [t.date, t.applications])
          ]
          const timeSheet = XLSX.utils.aoa_to_sheet(timeData)
          timeSheet['!cols'] = [{ wch: 15 }, { wch: 15 }]
          XLSX.utils.book_append_sheet(workbook, timeSheet, 'Daily Applications')
        }
      }

      // Generate filename based on report type
      const reportNames = {
        full: 'Full_Analytics',
        department: 'Department_Report',
        demographics: 'Demographics_Report',
        pipeline: 'Pipeline_Report'
      }

      // Download the file
      XLSX.writeFile(workbook, `CPECC_${reportNames[reportType]}_${dateStr}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export to Excel</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => exportToExcel('full')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Full Analytics Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel('department')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Department Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel('demographics')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Demographics Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToExcel('pipeline')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Pipeline Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
