'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteDepartmentButtonProps {
  departmentId: string
  departmentName: string
  hasJobs: boolean
  hasUsers: boolean
}

export function DeleteDepartmentButton({
  departmentId,
  departmentName,
  hasJobs,
  hasUsers,
}: DeleteDepartmentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const canDelete = !hasJobs && !hasUsers

  const handleDelete = async () => {
    setIsLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId)

      if (error) throw error

      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error('Failed to delete department:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!canDelete) {
    return (
      <Button variant="ghost" size="sm" disabled title="Cannot delete department with jobs or members">
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Department</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{departmentName}&quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
