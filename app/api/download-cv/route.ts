import { createClient } from '@/lib/supabase/server'
import { checkApiAuthorization } from '@/lib/api-security'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Security: Require authentication to download CVs
    const authResult = await checkApiAuthorization(['admin', 'recruiter', 'hiring_manager'])
    if (!authResult.authorized) {
      return authResult.error
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get('candidateId')
    const filePath = searchParams.get('path')

    // Security: Validate input parameters
    if (!candidateId && !filePath) {
      return NextResponse.json({ error: 'Missing candidateId or path' }, { status: 400 })
    }

    // Security: Prevent path traversal attacks
    if (filePath && (filePath.includes('..') || filePath.includes('//'))) {
      console.warn('[SECURITY] Path traversal attempt:', filePath)
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    let cvPath = filePath
    let fileName = 'resume.pdf'

    // If candidateId provided, fetch the CV info from the candidate record
    if (candidateId) {
      const { data: candidate, error } = await supabase
        .from('candidates')
        .select('resume_url, cv_filename')
        .eq('id', candidateId)
        .single()

      if (error || !candidate?.resume_url) {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 })
      }

      // Extract path from URL
      const urlParts = candidate.resume_url.split('/storage/v1/object/public/cvs/')
      if (urlParts.length > 1) {
        cvPath = urlParts[1]
      }
      fileName = candidate.cv_filename || 'resume.pdf'
    }

    if (!cvPath) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Download file from Supabase Storage
    const { data, error: downloadError } = await supabase.storage
      .from('cvs')
      .download(cvPath)

    if (downloadError || !data) {
      console.error('Download error:', downloadError)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    // Determine content type
    const ext = fileName.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === 'pdf') {
      contentType = 'application/pdf'
    } else if (ext === 'doc') {
      contentType = 'application/msword'
    } else if (ext === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }

    // Return file with proper headers for download
    const arrayBuffer = await data.arrayBuffer()
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('CV download error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
