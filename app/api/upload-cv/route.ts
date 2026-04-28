import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

// Extract text from PDF buffer
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text || ''
  } catch (error) {
    console.error('PDF parsing error:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()
    const file = formData.get('cv') as File
    const candidateId = formData.get('candidateId') as string

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

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${candidateId || 'new'}_${Date.now()}.${fileExt}`
    const filePath = `cvs/${fileName}`

    // Extract text from PDF for keyword search
    let resumeText = ''
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      resumeText = await extractTextFromPDF(buffer)
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload file. Please try again.' 
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('cvs')
      .getPublicUrl(filePath)

    // If candidateId provided, update the candidate record
    if (candidateId) {
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          resume_url: urlData.publicUrl,
          cv_uploaded_at: new Date().toISOString(),
          cv_filename: file.name,
          cv_size_bytes: file.size,
          resume_text: resumeText || null
        })
        .eq('id', candidateId)

      if (updateError) {
        console.error('Update error:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filename: file.name,
      size: file.size,
      path: filePath,
      textExtracted: !!resumeText
    })

  } catch (error) {
    console.error('CV upload error:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500 })
  }
}
