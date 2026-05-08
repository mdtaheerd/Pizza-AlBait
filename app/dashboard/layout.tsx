import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Block rejected users - sign them out and redirect to login
  if (profile?.approval_status === 'rejected') {
    await supabase.auth.signOut()
    redirect('/auth/login?error=rejected')
  }

  // Block pending users - redirect to pending approval page
  if (profile?.role !== 'candidate' && profile?.role !== 'admin' && profile?.approval_status === 'pending') {
    redirect('/auth/pending-approval')
  }

  return (
    <div className="flex h-svh overflow-hidden bg-muted/30">
      <DashboardSidebar profile={profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
