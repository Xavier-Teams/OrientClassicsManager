import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/app-layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Works from "@/pages/works";
import Contracts from "@/pages/contracts";
import Payments from "@/pages/payments";
import Reviews from "@/pages/reviews";
import Editing from "@/pages/editing";
import AdminTasks from "@/pages/admin-tasks";
import Users from "@/pages/users";
import AdminUsers from "@/pages/admin/users";
import Translators from "@/pages/translators";
import MyProfile from "@/pages/my-profile";
import AIAssistant from "@/pages/ai-assistant";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { canManageUsers, canManageTranslators } from "@/lib/permissions";

// Component to protect routes that require authentication
function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    // Save the current location to redirect back after login
    const currentPath = location === "/" ? "/" : location;
    setLocation(`/login?next=${encodeURIComponent(currentPath)}`);
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        {() => (
          <AuthenticatedRoute>
            <AppLayout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/works" component={Works} />
                <Route path="/contracts" component={Contracts} />
                <Route path="/payments" component={Payments} />
                <Route path="/reviews" component={Reviews} />
                <Route path="/editing" component={Editing} />
                <Route path="/admin-tasks" component={AdminTasks} />
                <Route path="/users" component={Users} />
                <Route path="/my-profile" component={MyProfile} />
                <Route path="/admin/users">
                  {() => (
                    <ProtectedRoute requiredPermission={canManageUsers} fallbackPath="/users">
                      <AdminUsers />
                    </ProtectedRoute>
                  )}
                </Route>
                <Route path="/translators">
                  {() => (
                    <ProtectedRoute requiredPermission={canManageTranslators} fallbackPath="/">
                      <Translators />
                    </ProtectedRoute>
                  )}
                </Route>
                <Route path="/ai-assistant" component={AIAssistant} />
                <Route path="/settings" component={Settings} />
                <Route component={NotFound} />
              </Switch>
            </AppLayout>
          </AuthenticatedRoute>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
