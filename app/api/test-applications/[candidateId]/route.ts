import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params
  const supabase = await createClient()

  // Test 1: Simple count
  const { count, error: countError } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('candidate_id', candidateId)

  // Test 2: Full data
  const { data: applications, error: appsError } = await supabase
    .from('applications')
    .select('*')
    .eq('candidate_id', candidateId)

  // Test 3: All applications (no filter)
  const { data: allApps, error: allError } = await supabase
    .from('applications')
    .select('id, candidate_id')
    .limit(20)

  return NextResponse.json({
    candidateId,
    count,
    countError: countError?.message,
    applicationsCount: applications?.length || 0,
    appsError: appsError?.message,
    applications: applications?.map(a => ({ id: a.id, candidate_id: a.candidate_id, stage: a.stage })),
    allAppsCount: allApps?.length || 0,
    allApps: allApps?.map(a => ({ id: a.id, candidate_id: a.candidate_id })),
    allError: allError?.message
  })
}
