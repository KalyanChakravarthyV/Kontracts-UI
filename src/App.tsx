import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Switch, Route, useLocation } from "wouter";
import posthog from "posthog-js";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DocumentManager from "@/pages/document-manager";
import ASC842Schedules from "@/pages/asc842-schedules";
import IFRS16Compliance from "@/pages/ifrs16-schedules";
import JournalEntries from "@/pages/journal-entries";
import AccountSettings from "@/pages/account-settings";
import AIRecommendations from "@/pages/ai-recommendations";
import Contracts from "@/pages/contracts";
import Auth from "@/pages/auth";
import AuthCallback from "@/pages/auth-callback";
import { Provider } from 'react-redux';
import { store } from './store';

function PostHogPageView() {
  const [location] = useLocation();

  useEffect(() => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
      posthog.capture("$pageview");
    }
  }, [location]);

  return null;
}

function PostHogIdentity() {
  const { isAuthenticated, user } = useAuth0();

  useEffect(() => {
    if (!import.meta.env.VITE_POSTHOG_KEY) return;

    if (!isAuthenticated || !user) {
      posthog.reset();
      return;
    }

    const distinctId = user.sub || user.email || user.nickname;
    if (!distinctId) return;

    posthog.identify(distinctId, {
      email: user.email,
      name: user.name,
      nickname: user.nickname,
    });
  }, [isAuthenticated, user]);

  return null;
}

function Router() {
  return (
    <>
      <PostHogPageView />
      <PostHogIdentity />
      <Switch>
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/auth" component={Auth} />
        <Route path="/auth/*" component={Auth} />
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/ai-recommendations" component={AIRecommendations} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/document-manager" component={DocumentManager} />
        <Route path="/asc842-schedules" component={ASC842Schedules} />
        <Route path="/ifrs16-compliance" component={IFRS16Compliance} />
        <Route path="/journal-entries" component={JournalEntries} />
        <Route path="/account-settings" component={AccountSettings} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
      <AuthWrapper>
        <div>
          {/* <Toaster /> */}
          <Router />
        </div>
      </AuthWrapper>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
