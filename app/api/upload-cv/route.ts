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

    // Upload to Vercel Blob (private storage)
    const blob = await put(filePath, file, {
      access: 'private',
    })

    return NextResponse.json({
      success: true,
      url: blob.pathname,
      filename: file.name,
      size: file.size,
      path: blob.pathname
    })

  } catch (error) {
    console.error('[v0] CV upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload file. Please try again.' 
    }, { status: 500 })
  }
}
