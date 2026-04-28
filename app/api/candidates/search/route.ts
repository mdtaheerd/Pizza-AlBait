import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const keywords = searchParams.get('keywords')
    const searchType = searchParams.get('type') || 'all' // 'resume', 'notes', 'all'

    if (!keywords || keywords.trim().length === 0) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 })
    }

    // Clean and prepare keywords for full-text search
    const cleanKeywords = keywords
      .trim()
      .split(/\s+/)
      .filter(k => k.length > 0)
      .map(k => k.replace(/[^\w]/g, ''))
      .filter(k => k.length > 0)
      .join(' & ')

    if (!cleanKeywords) {
      return NextResponse.json({ error: 'No valid keywords provided' }, { status: 400 })
    }

    // Build the full-text search query based on search type
    let searchCondition = ''
    if (searchType === 'resume') {
      searchCondition = `to_tsvector('english', COALESCE(resume_text, '')) @@ to_tsquery('english', '${cleanKeywords}')`
    } else if (searchType === 'notes') {
      searchCondition = `to_tsvector('english', COALESCE(notes, '')) @@ to_tsquery('english', '${cleanKeywords}')`
    } else {
      // Search in both resume_text and notes
      searchCondition = `(
        to_tsvector('english', COALESCE(resume_text, '')) @@ to_tsquery('english', '${cleanKeywords}')
        OR to_tsvector('english', COALESCE(notes, '')) @@ to_tsquery('english', '${cleanKeywords}')
        OR LOWER(full_name) LIKE LOWER('%${keywords}%')
        OR LOWER(email) LIKE LOWER('%${keywords}%')
      )`
    }

    // Execute the search using RPC or raw query
    const { data, error } = await supabase.rpc('search_candidates_by_keywords', {
      search_keywords: cleanKeywords,
      search_type: searchType,
      original_keywords: keywords.trim()
    })

    if (error) {
      // Fallback: use direct query with ilike for simpler search
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('candidates')
        .select('*')
        .or(
          `resume_text.ilike.%${keywords}%,notes.ilike.%${keywords}%,full_name.ilike.%${keywords}%,email.ilike.%${keywords}%`
        )
        .order('created_at', { ascending: false })
        .limit(50)

      if (fallbackError) {
        console.error('Search error:', fallbackError)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
      }

      return NextResponse.json({
        candidates: fallbackData || [],
        count: fallbackData?.length || 0,
        keywords: keywords.trim()
      })
    }

    return NextResponse.json({
      candidates: data || [],
      count: data?.length || 0,
      keywords: keywords.trim()
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
