import { createClient } from '@/lib/supabase/server'
import { checkApiAuthorization } from '@/lib/api-security'
import { get } from '@vercel/blob'
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
    const pathname = searchParams.get('pathname') // For Vercel Blob

    // Security: Validate input parameters
    if (!candidateId && !filePath && !pathname) {
      return NextResponse.json({ error: 'Missing candidateId, path, or pathname' }, { status: 400 })
    }

    // Security: Prevent path traversal attacks
    if (filePath && (filePath.includes('..') || filePath.includes('//'))) {
      console.warn('[SECURITY] Path traversal attempt:', filePath)
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Handle Vercel Blob downloads (new system)
    if (pathname) {
      try {
        const result = await get(pathname, {
          access: 'private',
          ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
        })

        if (!result) {
          return new NextResponse('File not found', { status: 404 })
        }

        if (result.statusCode === 304) {
          return new NextResponse(null, {
            status: 304,
            headers: {
              ETag: result.blob.etag,
              'Cache-Control': 'private, no-cache',
            },
          })
        }

        const filename = pathname.split('/').pop() || 'cv.pdf'

        return new NextResponse(result.stream, {
          headers: {
            'Content-Type': result.blob.contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            ETag: result.blob.etag,
            'Cache-Control': 'private, no-cache',
          },
        })
      } catch (blobError) {
        console.error('[v0] Blob download error:', blobError)
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
      }
    }

    // Handle Supabase Storage downloads (legacy system)
    let cvPath = filePath
    let fileName = 'resume.pdf'

    if (candidateId) {
      const { data: candidate, error } = await supabase
        .from('candidates')
        .select('resume_url, cv_filename')
        .eq('id', candidateId)
        .single()

      if (error || !candidate?.resume_url) {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 })
      }

      const resumeUrl = candidate.resume_url
      fileName = candidate.cv_filename || 'resume.pdf'

      // Check if it's a Vercel Blob URL (contains blob.vercel-storage.com)
      if (resumeUrl.includes('.blob.vercel-storage.com')) {
        // It's a Vercel Blob URL - extract pathname and use Blob to download
        try {
          // Extract the pathname from the full URL (e.g., cvs/1234_file.pdf)
          const url = new URL(resumeUrl)
          const blobPathname = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname

          const result = await get(blobPathname, {
            access: 'private',
          })

          if (!result) {
            return new NextResponse('File not found', { status: 404 })
          }

          return new NextResponse(result.stream, {
            headers: {
              'Content-Type': result.blob.contentType || 'application/pdf',
              'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
              'Cache-Control': 'private, no-cache',
            },
          })
        } catch (blobError) {
          console.error('[v0] Blob download error:', blobError)
          // Fallback: try to fetch directly from the URL
          try {
            const directResponse = await fetch(resumeUrl)
            if (directResponse.ok) {
              const buffer = await directResponse.arrayBuffer()
              return new NextResponse(buffer, {
                headers: {
                  'Content-Type': directResponse.headers.get('content-type') || 'application/pdf',
                  'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
                },
              })
            }
          } catch (fetchError) {
            console.error('[v0] Direct fetch error:', fetchError)
          }
          return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
        }
      }

      // Check if it's a Vercel Blob pathname (starts with cvs/)
      if (resumeUrl.startsWith('cvs/')) {
        try {
          const result = await get(resumeUrl, {
            access: 'private',
          })

          if (!result) {
            return new NextResponse('File not found', { status: 404 })
          }

          return new NextResponse(result.stream, {
            headers: {
              'Content-Type': result.blob.contentType || 'application/pdf',
              'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
              'Cache-Control': 'private, no-cache',
            },
          })
        } catch (blobError) {
          console.error('[v0] Blob download error:', blobError)
          return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
        }
      }

      // Legacy Supabase Storage URL
      const urlParts = resumeUrl.split('/storage/v1/object/public/cvs/')
      if (urlParts.length > 1) {
        cvPath = urlParts[1]
      }
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

    const ext = fileName.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === 'pdf') {
      contentType = 'application/pdf'
    } else if (ext === 'doc') {
      contentType = 'application/msword'
    } else if (ext === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }

    const arrayBuffer = await data.arrayBuffer()
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error('[v0] CV download error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
