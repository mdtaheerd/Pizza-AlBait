import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Building2, Mail, Bell, Shield, Palette } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Company Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Company Information</CardTitle>
            </div>
            <CardDescription>
              Update your company details and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" defaultValue="China Petroleum Engineering and Construction Corporation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Website</Label>
                <Input id="companyWebsite" defaultValue="https://cloudae.org" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Input id="companyAddress" placeholder="Enter company address" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Email Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure email templates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input id="fromEmail" type="email" placeholder="careers@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replyTo">Reply-To Email</Label>
                <Input id="replyTo" type="email" placeholder="hr@company.com" />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Email Templates</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Application Confirmation</p>
                    <p className="text-sm text-muted-foreground">Send when candidate applies</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Interview Invitation</p>
                    <p className="text-sm text-muted-foreground">Send when interview is scheduled</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Rejection Notification</p>
                    <p className="text-sm text-muted-foreground">Send when candidate is rejected</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
            <Button>Save Email Settings</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">New Applications</p>
                  <p className="text-sm text-muted-foreground">Get notified when new applications arrive</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Interview Reminders</p>
                  <p className="text-sm text-muted-foreground">Receive reminders before scheduled interviews</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Get weekly hiring activity summary</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">User Registration Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <Button>Save Notification Settings</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage security and access settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Allow Re-registration</p>
                  <p className="text-sm text-muted-foreground">Let rejected users re-apply for approval</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <Button>Save Security Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
