'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { APPROVAL_STATUS_LABELS, APPROVAL_STATUS_COLORS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Clock, Search, UserCheck, UserX, Loader2, UserPlus, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

interface UserManagementClientProps {
  users: Profile[]
  currentUserId: string
}

export function UserManagementClient({ users, currentUserId }: UserManagementClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [revokeReason, setRevokeReason] = useState('')

  // Add User dialog state
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [addUserLoading, setAddUserLoading] = useState(false)
  const [addUserError, setAddUserError] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'recruiter',
  })

  // Reset Password dialog state
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [resetPasswordValue, setResetPasswordValue] = useState('')
  const [showResetPwd, setShowResetPwd] = useState(false)

  const openResetDialog = (user: Profile) => {
    setSelectedUser(user)
    setResetPasswordValue('')
    setResetError(null)
    setResetSuccess(null)
    setResetDialogOpen(true)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setResetLoading(true)
    setResetError(null)
    setResetSuccess(null)
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.email, newPassword: resetPasswordValue }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password')
      }
      setResetSuccess(result.message || 'Password updated successfully')
      setResetPasswordValue('')
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setResetLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddUserLoading(true)
    setAddUserError(null)
    try {
      const response = await fetch('/api/auth/admin-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          fullName: newUser.fullName,
          role: newUser.role,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user')
      }
      setAddUserOpen(false)
      setNewUser({ fullName: '', email: '', password: '', role: 'recruiter' })
      router.refresh()
    } catch (error) {
      setAddUserError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setAddUserLoading(false)
    }
  }

  const pendingUsers = users.filter(u => u.approval_status === 'pending' && u.role !== 'admin')
  const approvedUsers = users.filter(u => u.approval_status === 'approved')
  const rejectedUsers = users.filter(u => u.approval_status === 'rejected')

  // Helper to display user-friendly role names
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'recruiter':
        return 'Recruiter/HRBP'
      case 'hiring_manager':
        return 'Hiring Manager'
      case 'admin':
        return 'Admin'
      default:
        return role.replace('_', ' ')
    }
  }

  const filterUsers = (userList: Profile[]) => {
    if (!searchQuery) return userList
    const query = searchQuery.toLowerCase()
    return userList.filter(u => 
      u.full_name?.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    )
  }

  const handleApprove = async (userId: string) => {
    setLoading(userId)
    try {
      const { error } = await supabase.rpc('approve_user', {
        p_user_id: userId,
        p_admin_id: currentUserId
      })
      
      if (error) throw error

      // Send approval confirmation email
      try {
        await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, action: 'approve' }),
        })
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
      }

      router.refresh()
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve user')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!selectedUser) return
    setLoading(selectedUser.id)
    try {
      const { error } = await supabase.rpc('reject_user', {
        p_user_id: selectedUser.id,
        p_admin_id: currentUserId,
        p_reason: rejectionReason || null
      })
      
      if (error) throw error

      // Send rejection email
      try {
        await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: selectedUser.id, 
            action: 'reject',
            reason: rejectionReason || undefined
          }),
        })
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError)
      }

      setRejectDialogOpen(false)
      setSelectedUser(null)
      setRejectionReason('')
      router.refresh()
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Failed to reject user')
    } finally {
      setLoading(null)
    }
  }

  const openRejectDialog = (user: Profile) => {
    setSelectedUser(user)
    setRejectDialogOpen(true)
  }

  const openRevokeDialog = (user: Profile) => {
    setSelectedUser(user)
    setRevokeDialogOpen(true)
  }

  const handleRevoke = async () => {
    if (!selectedUser) return
    setLoading(selectedUser.id)
    try {
      const { error } = await supabase.rpc('reject_user', {
        p_user_id: selectedUser.id,
        p_admin_id: currentUserId,
        p_reason: revokeReason || 'Access revoked by administrator'
      })
      
      if (error) throw error

      // Send revocation email
      try {
        await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: selectedUser.id, 
            action: 'revoke',
            reason: revokeReason || 'Your access has been revoked by an administrator.'
          }),
        })
      } catch (emailError) {
        console.error('Failed to send revocation email:', emailError)
      }

      setRevokeDialogOpen(false)
      setSelectedUser(null)
      setRevokeReason('')
      router.refresh()
    } catch (error) {
      console.error('Error revoking user access:', error)
      alert('Failed to revoke user access')
    } finally {
      setLoading(null)
    }
  }

  const UserTable = ({ userList, showActions = false, showRevokeAction = false, showReapproveAction = false, showResetPassword = false }: { userList: Profile[], showActions?: boolean, showRevokeAction?: boolean, showReapproveAction?: boolean, showResetPassword?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Registered</TableHead>
          {(showActions || showRevokeAction || showReapproveAction || showResetPassword) && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={(showActions || showRevokeAction || showReapproveAction || showResetPassword) ? 6 : 5} className="text-center text-muted-foreground py-8">
              No users found
            </TableCell>
          </TableRow>
        ) : (
          userList.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleDisplayName(user.role)}</TableCell>
              <TableCell>
                <Badge className={APPROVAL_STATUS_COLORS[user.approval_status]}>
                  {APPROVAL_STATUS_LABELS[user.approval_status]}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
              {(showActions || showRevokeAction || showReapproveAction || showResetPassword) && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {showActions && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleApprove(user.id)}
                          disabled={loading === user.id}
                        >
                          {loading === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => openRejectDialog(user)}
                          disabled={loading === user.id}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {showReapproveAction && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleApprove(user.id)}
                        disabled={loading === user.id}
                      >
                        {loading === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Re-approve
                          </>
                        )}
                      </Button>
                    )}
                    {showResetPassword && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-primary border-primary/30 hover:bg-primary/5"
                        onClick={() => openResetDialog(user)}
                        disabled={loading === user.id}
                      >
                        <KeyRound className="h-4 w-4 mr-1" />
                        Reset Password
                      </Button>
                    )}
                    {showRevokeAction && user.id !== currentUserId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => openRevokeDialog(user)}
                        disabled={loading === user.id}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Revoke Access
                      </Button>
                    )}
                    {showRevokeAction && user.id === currentUserId && (
                      <span className="text-xs text-muted-foreground">Current user</span>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">Users waiting for approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedUsers.length}</div>
            <p className="text-xs text-muted-foreground">Active system users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Users</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedUsers.length}</div>
            <p className="text-xs text-muted-foreground">Declined registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Add User */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setAddUserOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingUsers.length > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white">{pendingUsers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <Badge variant="outline" className="ml-2">{approvedUsers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {rejectedUsers.length > 0 && (
              <Badge variant="outline" className="ml-2">{rejectedUsers.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">
            All Users
            <Badge variant="outline" className="ml-2">{users.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable userList={filterUsers(pendingUsers)} showActions={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Users</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable userList={filterUsers(approvedUsers)} showRevokeAction={true} showResetPassword={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Users</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable userList={filterUsers(rejectedUsers)} showReapproveAction={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable userList={filterUsers(users)} showResetPassword={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add HR/Recruiter User</DialogTitle>
            <DialogDescription>
              Create a new Recruiter/HRBP or Hiring Manager account. The account is
              activated and approved immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-fullName">Full Name</Label>
              <Input
                id="new-fullName"
                required
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Temporary Password</Label>
              <Input
                id="new-password"
                type="text"
                required
                minLength={6}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Role</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger id="new-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recruiter">Recruiter/HRBP</SelectItem>
                  <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addUserError && (
              <p className="text-sm text-destructive">{addUserError}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addUserLoading}>
                {addUserLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.full_name || selectedUser?.email}. The
              change takes effect immediately - no email is sent. Share the new password
              with the user securely.
            </DialogDescription>
          </DialogHeader>
          {resetSuccess ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {resetSuccess}
              </div>
              <DialogFooter>
                <Button onClick={() => setResetDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" value={selectedUser?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="reset-password"
                    type={showResetPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={resetPasswordValue}
                    onChange={(e) => setResetPasswordValue(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPwd(!showResetPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showResetPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {resetError && (
                <p className="text-sm text-destructive">{resetError}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Update Password
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {selectedUser?.full_name || selectedUser?.email}?
              You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={loading === selectedUser?.id}
            >
              {loading === selectedUser?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Access Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke User Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke access for {selectedUser?.full_name || selectedUser?.email}?
              This will prevent them from logging in. You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for revoking access (optional)"
            value={revokeReason}
            onChange={(e) => setRevokeReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRevoke}
              disabled={loading === selectedUser?.id}
            >
              {loading === selectedUser?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
