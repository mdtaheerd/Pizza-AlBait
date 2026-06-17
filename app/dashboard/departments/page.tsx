import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Building2, Users, Briefcase } from 'lucide-react'
import { DepartmentDialog } from '@/components/departments/department-dialog'
import { DeleteDepartmentButton } from '@/components/departments/delete-department-button'

export default async function DepartmentsPage() {
  const supabase = await createClient()

  // Fetch departments with job and user counts
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  // Get job counts per department
  const { data: jobCounts } = await supabase
    .from('jobs')
    .select('department_id')
  
  const jobCountMap = (jobCounts || []).reduce((acc, job) => {
    if (job.department_id) {
      acc[job.department_id] = (acc[job.department_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Get user counts per department
  const { data: userCounts } = await supabase
    .from('profiles')
    .select('department_id')
    .eq('approval_status', 'approved')
    .in('role', ['recruiter', 'hiring_manager'])
  
  const userCountMap = (userCounts || []).reduce((acc, user) => {
    if (user.department_id) {
      acc[user.department_id] = (acc[user.department_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const departmentsWithCounts = (departments || []).map((dept) => ({
    ...dept,
    jobCount: jobCountMap[dept.id] || 0,
    userCount: userCountMap[dept.id] || 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="text-muted-foreground">
            Manage departments and organizational structure
          </p>
        </div>
        <DepartmentDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </DepartmentDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(jobCountMap).reduce((a, b) => a + b, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(userCountMap).reduce((a, b) => a + b, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            Overview of all departments in the organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departmentsWithCounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No departments created yet</p>
              <DepartmentDialog>
                <Button>Create Your First Department</Button>
              </DepartmentDialog>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Jobs</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentsWithCounts.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {dept.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{dept.jobCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{dept.userCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DepartmentDialog department={dept}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </DepartmentDialog>
                        <DeleteDepartmentButton 
                          departmentId={dept.id} 
                          departmentName={dept.name}
                          hasJobs={dept.jobCount > 0}
                          hasUsers={dept.userCount > 0}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
