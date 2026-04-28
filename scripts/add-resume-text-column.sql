-- Add resume_text column to candidates table for keyword search
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS resume_text TEXT;

-- Add an index for full-text search on resume_text
CREATE INDEX IF NOT EXISTS idx_candidates_resume_text_gin 
ON candidates USING gin(to_tsvector('english', COALESCE(resume_text, '')));

-- Create a function for searching resumes by keywords
CREATE OR REPLACE FUNCTION search_candidates_by_keywords(search_query TEXT)
RETURNS SETOF candidates AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM candidates
  WHERE 
    to_tsvector('english', COALESCE(resume_text, '')) @@ plainto_tsquery('english', search_query)
    OR resume_text ILIKE '%' || search_query || '%'
  ORDER BY 
    ts_rank(to_tsvector('english', COALESCE(resume_text, '')), plainto_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql;
