import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/app-layout";
import Dashboard from "@/pages/dashboard";
import Works from "@/pages/works";
import Contracts from "@/pages/contracts";
import Payments from "@/pages/payments";
import Reviews from "@/pages/reviews";
import Editing from "@/pages/editing";
import AdminTasks from "@/pages/admin-tasks";
import Users from "@/pages/users";
import AIAssistant from "@/pages/ai-assistant";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/works" component={Works} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/payments" component={Payments} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/editing" component={Editing} />
      <Route path="/admin-tasks" component={AdminTasks} />
      <Route path="/users" component={Users} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppLayout>
            <Router />
          </AppLayout>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
