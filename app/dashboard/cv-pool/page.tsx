import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Download, Eye, MapPin, Building2, Briefcase, Phone, Mail, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function CVPoolPage() {
  const supabase = await createClient()

  // Fetch candidates who have uploaded CVs but haven't applied for any job (is_cv_only = true)
  // OR candidates who have registered with CV but have no applications
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select(`
      id,
      full_name,
      email,
      phone,
      whatsapp_number,
      nationality,
      current_location,
      current_company,
      current_job_title,
      resume_url,
      cv_filename,
      cv_uploaded_at,
      created_at,
      is_cv_only,
      referral_type,
      referral_name,
      applications:applications(id)
    `)
    .not('resume_url', 'is', null)
    .order('created_at', { ascending: false })

  // Filter to only those with no applications (CV only candidates)
  const cvOnlyCandidates = (candidates || []).filter(
    (c) => c.is_cv_only === true || (c.applications && c.applications.length === 0)
  )

  const getReferralBadge = (referralType: string | null) => {
    if (!referralType || referralType === 'none') return null
    if (referralType === 'cpecc_employee') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">CPECC Referral</Badge>
    }
    if (referralType === 'adnoc') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">ADNOC Referral</Badge>
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">CV Pool</h1>
          <p className="text-muted-foreground mt-1">
            Candidates who have uploaded their CVs without applying for a specific job
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Users className="mr-1 h-4 w-4" />
            {cvOnlyCandidates.length} Candidates
          </Badge>
        </div>
      </div>

      {cvOnlyCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-6 text-lg font-medium">No CVs in the Pool</p>
            <p className="mt-2 text-center text-muted-foreground max-w-md">
              When candidates register and upload their CVs without applying for a specific job, they will appear here for your review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Available Candidates</CardTitle>
            <CardDescription>
              Review and process candidates from the CV pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead className="hidden md:table-cell">Current Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell">Referral</TableHead>
                  <TableHead className="hidden sm:table-cell">CV Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cvOnlyCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{candidate.full_name}</div>
                        <div className="flex flex-col text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {candidate.email}
                          </span>
                          {candidate.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {candidate.phone}
                            </span>
                          )}
                        </div>
                        {candidate.nationality && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {candidate.nationality}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {candidate.current_job_title || candidate.current_company ? (
                        <div className="space-y-1">
                          {candidate.current_job_title && (
                            <div className="flex items-center gap-1 text-sm">
                              <Briefcase className="h-3 w-3 text-muted-foreground" />
                              {candidate.current_job_title}
                            </div>
                          )}
                          {candidate.current_company && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {candidate.current_company}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {candidate.current_location ? (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {candidate.current_location}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="space-y-1">
                        {getReferralBadge(candidate.referral_type)}
                        {candidate.referral_name && (
                          <div className="text-xs text-muted-foreground">
                            {candidate.referral_name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {candidate.cv_uploaded_at
                          ? format(new Date(candidate.cv_uploaded_at), 'MMM d, yyyy')
                          : format(new Date(candidate.created_at), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/candidates/${candidate.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        {candidate.resume_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/api/download-cv?candidateId=${candidate.id}`}>
                              <Download className="mr-1 h-4 w-4" />
                              CV
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
