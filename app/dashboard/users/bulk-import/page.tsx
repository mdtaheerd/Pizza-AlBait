import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BulkImportForm } from '@/components/admin/bulk-import-form'

export default async function BulkImportPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // Fetch departments for assignment
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .order('name')
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bulk Import Users</h1>
        <p className="text-muted-foreground">
          Add multiple Recruiters/HRBP and Hiring Managers at once
        </p>
      </div>
      
      <BulkImportForm departments={departments || []} />
    </div>
  )
}
