import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// Add to vercel.json: { "crons": [{ "path": "/api/cron/cleanup-cvs", "schedule": "0 0 * * *" }] }

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow in development or if no CRON_SECRET is set
      if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = await createClient()
    
    // Calculate date 6 months ago
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Find candidates with CVs older than 6 months
    const { data: oldCVs, error: fetchError } = await supabase
      .from('candidates')
      .select('id, resume_url, cv_filename')
      .not('cv_uploaded_at', 'is', null)
      .lt('cv_uploaded_at', sixMonthsAgo.toISOString())

    if (fetchError) {
      console.error('Error fetching old CVs:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch old CVs' }, { status: 500 })
    }

    if (!oldCVs || oldCVs.length === 0) {
      return NextResponse.json({ 
        message: 'No CVs to clean up',
        deleted: 0 
      })
    }

    let deletedCount = 0
    const errors: string[] = []

    for (const candidate of oldCVs) {
      try {
        // Extract file path from URL
        if (candidate.resume_url) {
          const urlParts = candidate.resume_url.split('/cvs/')
          if (urlParts.length > 1) {
            const filePath = `cvs/${urlParts[1]}`
            
            // Delete from storage
            const { error: deleteStorageError } = await supabase.storage
              .from('cvs')
              .remove([filePath])

            if (deleteStorageError) {
              errors.push(`Storage delete error for ${candidate.id}: ${deleteStorageError.message}`)
            }
          }
        }

        // Clear CV fields in candidate record
        const { error: updateError } = await supabase
          .from('candidates')
          .update({
            resume_url: null,
            cv_uploaded_at: null,
            cv_filename: null,
            cv_size_bytes: null
          })
          .eq('id', candidate.id)

        if (updateError) {
          errors.push(`Update error for ${candidate.id}: ${updateError.message}`)
        } else {
          deletedCount++
        }

        // Log the cleanup action
        await supabase
          .from('candidate_history')
          .insert({
            candidate_id: candidate.id,
            action_type: 'note_added',
            notes: 'CV auto-deleted after 6 months for storage optimization'
          })

      } catch (err) {
        errors.push(`Error processing ${candidate.id}: ${err}`)
      }
    }

    return NextResponse.json({
      message: `CV cleanup completed`,
      processed: oldCVs.length,
      deleted: deletedCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('CV cleanup cron error:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500 })
  }
}
