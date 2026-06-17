import { redirect } from 'next/navigation'

// Public HR/Recruiter self-registration has been disabled.
// Recruiter/HRBP and Hiring Manager accounts are now created by an admin
// from the User Management dashboard. Job applicants should register as
// candidates via /candidate/register. Any visit here is sent to login.
export default function SignUpPage() {
  redirect('/auth/login')
}
