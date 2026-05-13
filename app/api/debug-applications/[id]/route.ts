import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const results: any = {
    candidateId: id,
    envVars: {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      hasAnonKey: !!anonKey,
    },
    queries: {}
  }
  
  // Test with service role key
  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    // Simple query
    const { data: simpleData, error: simpleError } = await serviceClient
      .from('applications')
      .select('id, candidate_id, stage')
      .eq('candidate_id', id)
    
    results.queries.serviceSimple = {
      data: simpleData,
      error: simpleError?.message,
      count: simpleData?.length ?? 0
    }
    
    // Full query like the page uses
    const { data: fullData, error: fullError } = await serviceClient
      .from('applications')
      .select('*, job:jobs(id, title, department:departments(id, name), salary_min, salary_max, salary_currency, created_by, hiring_manager_id), interviews:interviews(id, scheduled_at, status)')
      .eq('candidate_id', id)
    
    results.queries.serviceFull = {
      data: fullData,
      error: fullError?.message,
      count: fullData?.length ?? 0
    }
  }
  
  // Test with anon key
  if (supabaseUrl && anonKey) {
    const anonClient = createClient(supabaseUrl, anonKey)
    
    const { data, error } = await anonClient
      .from('applications')
      .select('id, candidate_id, stage')
      .eq('candidate_id', id)
    
    results.queries.anon = {
      data: data,
      error: error?.message,
      count: data?.length ?? 0
    }
  }
  
  return NextResponse.json(results, { status: 200 })
}
