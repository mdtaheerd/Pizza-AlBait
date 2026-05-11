import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('cv') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload PDF or Word document.' 
      }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `cvs/${timestamp}_${sanitizedName}`

    // Upload to Vercel Blob (private store - most common for user-connected stores)
    const blob = await put(filePath, file, {
      access: 'private',
    })

    console.log('[v0] CV uploaded successfully:', blob.pathname)

    // For private blobs, we store the pathname and use download-cv API to serve files
    return NextResponse.json({
      success: true,
      url: blob.pathname, // Use pathname for private blobs
      filename: file.name,
      size: file.size,
      path: blob.pathname
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] CV upload error:', errorMessage, error)
    
    // Check for specific blob errors
    if (errorMessage.includes('access')) {
      return NextResponse.json({ 
        error: 'Storage configuration error. Please contact support.' 
      }, { status: 500 })
    }
    
    if (errorMessage.includes('size') || errorMessage.includes('too large')) {
      return NextResponse.json({ 
        error: 'File too large. Please upload a smaller file.' 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: `Upload failed: ${errorMessage}` 
    }, { status: 500 })
  }
}
