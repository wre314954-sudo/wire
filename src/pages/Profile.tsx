import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserAuth } from "@/context/UserAuthContext";
import { Mail, Phone, User } from "lucide-react";

const Profile = () => {
  const { user, logout } = useUserAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
        <div className="container mx-auto px-4 py-24 max-w-xl text-center space-y-6">
          <h1 className="text-3xl font-bold">No active session</h1>
          <p className="text-muted-foreground">
            Please log in or sign up from the header to access your personalized dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="border-border/60 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">My Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <h2 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h2>
                  <p className="text-lg font-semibold">{user.full_name || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <h2 className="text-sm font-medium text-muted-foreground mb-1">Email</h2>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-start gap-3 p-3 bg-accent/20 rounded-lg">
                  <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <h2 className="text-sm font-medium text-muted-foreground mb-1">Phone</h2>
                    <p className="text-lg font-semibold">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={logout} className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
