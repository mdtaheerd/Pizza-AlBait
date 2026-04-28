-- ATS Database Schema
-- Run this script to create all necessary tables for the Applicant Tracking System

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'recruiter' CHECK (role IN ('admin', 'recruiter', 'hiring_manager')),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  location TEXT,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship', 'remote')),
  salary_min INTEGER,
  salary_max INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paused', 'closed')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Candidates table
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  source TEXT CHECK (source IN ('career_page', 'linkedin', 'referral', 'agency', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table (links candidates to jobs with pipeline stage)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  interview_type TEXT CHECK (interview_type IN ('phone', 'video', 'onsite', 'technical', 'panel')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log for tracking all changes
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON public.jobs(department_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON public.applications(stage);
CREATE INDEX IF NOT EXISTS idx_interviews_application ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled ON public.interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Departments: All authenticated users can read, only admins can modify
CREATE POLICY "departments_select_authenticated" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "departments_insert_admin" ON public.departments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "departments_update_admin" ON public.departments FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "departments_delete_admin" ON public.departments FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles: Users can see all profiles but only edit their own
CREATE POLICY "profiles_select_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Jobs: All authenticated users can read, recruiters and admins can modify
CREATE POLICY "jobs_select_authenticated" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "jobs_select_public" ON public.jobs FOR SELECT TO anon USING (status = 'open');
CREATE POLICY "jobs_insert_recruiter" ON public.jobs FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter'))
);
CREATE POLICY "jobs_update_recruiter" ON public.jobs FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'recruiter'))
);
CREATE POLICY "jobs_delete_admin" ON public.jobs FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Candidates: All authenticated users can view and modify
CREATE POLICY "candidates_select_authenticated" ON public.candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "candidates_insert_authenticated" ON public.candidates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "candidates_insert_anon" ON public.candidates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "candidates_update_authenticated" ON public.candidates FOR UPDATE TO authenticated USING (true);

-- Applications: All authenticated users can view and modify
CREATE POLICY "applications_select_authenticated" ON public.applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "applications_insert_authenticated" ON public.applications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "applications_insert_anon" ON public.applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "applications_update_authenticated" ON public.applications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "applications_delete_authenticated" ON public.applications FOR DELETE TO authenticated USING (true);

-- Interviews: All authenticated users can view and modify
CREATE POLICY "interviews_select_authenticated" ON public.interviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "interviews_insert_authenticated" ON public.interviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "interviews_update_authenticated" ON public.interviews FOR UPDATE TO authenticated USING (true);
CREATE POLICY "interviews_delete_authenticated" ON public.interviews FOR DELETE TO authenticated USING (true);

-- Activity Log: All authenticated users can view, system inserts
CREATE POLICY "activity_log_select_authenticated" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity_log_insert_authenticated" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'recruiter')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
