import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CareersHeader } from '@/components/careers/careers-header'
import { ApplicationForm } from '@/components/careers/application-form'

interface ApplyPageProps {
  params: Promise<{ id: string }>
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('id, title, department:departments(name)')
    .eq('id', id)
    .eq('status', 'open')
    .single()

  if (error || !job) {
    notFound()
  }

  return (
    <div className="min-h-svh bg-muted/30">
      <CareersHeader />

      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href={`/careers/${id}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to job details
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-balance">Apply for {job.title}</h1>
            {job.department?.name && (
              <p className="mt-1 text-muted-foreground">{job.department.name}</p>
            )}
          </div>

          <ApplicationForm jobId={id} jobTitle={job.title} />
        </div>
      </div>
    </div>
  )
}
