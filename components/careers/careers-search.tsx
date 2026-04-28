'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
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

export function CareersSearch({ departments, currentSearch, currentDepartment }: CareersSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch || '')

  useEffect(() => {
    const debounce = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) {
        params.set('search', search)
      } else {
        params.delete('search')
      }
      router.push(`/careers?${params.toString()}`)
    }, 300)

    return () => clearTimeout(debounce)
  }, [search, searchParams, router])

  const handleDepartmentChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('department')
    } else {
      params.set('department', value)
    }
    router.push(`/careers?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    router.push('/careers')
  }

  const hasFilters = search || currentDepartment

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
      <Select value={currentDepartment || 'all'} onValueChange={handleDepartmentChange}>
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
