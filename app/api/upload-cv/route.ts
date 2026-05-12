import { put, del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('cv') as File
    const oldUrl = formData.get('oldUrl') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Delete old CV if provided (only keep most recent)
    if (oldUrl && oldUrl.includes('.blob.vercel-storage.com')) {
      try {
        await del(oldUrl)
        console.log('[v0] Deleted old CV:', oldUrl)
      } catch (delError) {
        // Log but don't fail if deletion fails
        console.error('[v0] Failed to delete old CV:', delError)
      }
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

    // Validate file size (5MB max)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `cvs/${timestamp}_${sanitizedName}`

    // Upload to Vercel Blob - try public first, fallback to private if it fails
    let blob
    try {
      blob = await put(filePath, file, {
        access: 'public',
      })
    } catch (publicError) {
      // If public access fails, try private access
      console.log('[v0] Public upload failed, trying private:', publicError)
      blob = await put(filePath, file, {
        access: 'private',
      })
    }

    return NextResponse.json({
      success: true,
      url: blob.url || `/api/download-cv?pathname=${encodeURIComponent(blob.pathname)}`,
      filename: file.name,
      size: file.size,
      path: blob.pathname
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] CV upload error:', errorMessage)
    
    // Return actual error for debugging
    return NextResponse.json({ 
      error: `Upload failed: ${errorMessage}` 
    }, { status: 500 })
  }
}
