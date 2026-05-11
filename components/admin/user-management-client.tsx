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
import { CheckCircle, XCircle, Clock, Search, UserCheck, UserX, Loader2 } from 'lucide-react'
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

  const pendingUsers = users.filter(u => u.approval_status === 'pending' && u.role !== 'admin')
  const approvedUsers = users.filter(u => u.approval_status === 'approved')
  const rejectedUsers = users.filter(u => u.approval_status === 'rejected')

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

  const UserTable = ({ userList, showActions = false, showRevokeAction = false, showReapproveAction = false }: { userList: Profile[], showActions?: boolean, showRevokeAction?: boolean, showReapproveAction?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Registered</TableHead>
          {(showActions || showRevokeAction || showReapproveAction) && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={(showActions || showRevokeAction) ? 6 : 5} className="text-center text-muted-foreground py-8">
              No users found
            </TableCell>
          </TableRow>
        ) : (
          userList.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="capitalize">{user.role.replace('_', ' ')}</TableCell>
              <TableCell>
                <Badge className={APPROVAL_STATUS_COLORS[user.approval_status]}>
                  {APPROVAL_STATUS_LABELS[user.approval_status]}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
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
                  </div>
                </TableCell>
              )}
              {showRevokeAction && user.id !== currentUserId && (
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => openRevokeDialog(user)}
                    disabled={loading === user.id}
                  >
                    {loading === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        Revoke Access
                      </>
                    )}
                  </Button>
                </TableCell>
              )}
              {showRevokeAction && user.id === currentUserId && (
                <TableCell className="text-right">
                  <span className="text-xs text-muted-foreground">Current user</span>
                </TableCell>
              )}
              {showReapproveAction && (
                <TableCell className="text-right">
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
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
              <UserTable userList={filterUsers(approvedUsers)} showRevokeAction={true} />
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
              <UserTable userList={filterUsers(users)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
