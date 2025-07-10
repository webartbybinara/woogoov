import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Store, User, Bell, Shield, CreditCard } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your store preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span>Store Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" defaultValue="My WooCommerce Store" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Store Email</Label>
                <Input id="store-email" type="email" defaultValue="admin@mystore.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description">Store Description</Label>
              <Input id="store-description" defaultValue="Premium quality products for everyday life" />
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" defaultValue="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="john@example.com" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "new-orders", label: "New order notifications", description: "Get notified when new orders are placed" },
              { id: "low-stock", label: "Low stock alerts", description: "Alert when products are running low" },
              { id: "customer-reviews", label: "Customer reviews", description: "Notify when customers leave reviews" },
              { id: "marketing", label: "Marketing updates", description: "Receive marketing tips and updates" },
            ].map((setting) => (
              <div key={setting.id} className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor={setting.id} className="text-sm font-medium">
                    {setting.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <Switch id={setting.id} defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Active Sessions</h4>
              <p className="text-xs text-muted-foreground">Manage where you're signed in</p>
              <Button variant="outline" size="sm">
                View All Sessions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Accept Credit Cards</Label>
                <p className="text-xs text-muted-foreground">Enable credit card payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">PayPal Integration</Label>
                <p className="text-xs text-muted-foreground">Accept PayPal payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline" className="w-full justify-start">
              Configure Payment Methods
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}