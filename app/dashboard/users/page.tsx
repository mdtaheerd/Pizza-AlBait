import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserManagementClient } from '@/components/admin/user-management-client'

export default async function UsersPage() {
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
  
  // Fetch only Recruiters/HRBP, Hiring Managers, and Admins (not candidates)
  // Candidates are auto-approved and don't need admin verification
  const { data: users } = await supabase
    .from('profiles')
    .select('*, department:departments(*)')
    .neq('role', 'candidate')
    .order('created_at', { ascending: false })
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Approve or reject Recruiter/HRBP and Hiring Manager registrations
        </p>
      </div>
      
      <UserManagementClient users={users || []} currentUserId={user.id} />
    </div>
  )
}
