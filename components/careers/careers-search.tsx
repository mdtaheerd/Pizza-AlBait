'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Department {
  id: string
  name: string
}

interface CareersSearchProps {
  departments: Department[]
  currentSearch?: string
  currentDepartment?: string
}

function CareersSearchInner({ departments, currentSearch, currentDepartment }: CareersSearchProps) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch || '')
  const [selectedDepartment, setSelectedDepartment] = useState(currentDepartment || 'all')
  const [isInitialized, setIsInitialized] = useState(false)

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Debounced search - only run after user interaction, not on initial render
  useEffect(() => {
    if (!isInitialized) return
    
    // Don't update if values match the current URL params
    if (search === (currentSearch || '') && selectedDepartment === (currentDepartment || 'all')) {
      return
    }

    const debounce = setTimeout(() => {
      const params = new URLSearchParams()
      if (search) {
        params.set('search', search)
      }
      if (selectedDepartment && selectedDepartment !== 'all') {
        params.set('department', selectedDepartment)
      }
      const queryString = params.toString()
      router.push(queryString ? `/careers?${queryString}` : '/careers')
    }, 500)

    return () => clearTimeout(debounce)
  }, [search, selectedDepartment, isInitialized, router, currentSearch, currentDepartment])

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value)
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedDepartment('all')
    router.push('/careers')
  }

  const hasFilters = search || (selectedDepartment && selectedDepartment !== 'all')

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search positions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  )
}

export function CareersSearch(props: CareersSearchProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search positions..." className="pl-9" disabled />
        </div>
        <div className="w-full sm:w-[200px] h-10 bg-muted animate-pulse rounded-md" />
      </div>
    }>
      <CareersSearchInner {...props} />
    </Suspense>
  )
}
