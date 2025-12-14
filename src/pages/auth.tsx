import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "wouter";

export default function Auth() {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();
  const [, setLocation] = useLocation();
  const [hasStartedLogin, setHasStartedLogin] = useState(false);

  useEffect(() => {
    if (isLoading || error) return;

    if (isAuthenticated) {
      setLocation("/dashboard");
      return;
    }

    if (!hasStartedLogin) {
      setHasStartedLogin(true);
      loginWithRedirect({
        appState: { returnTo: "/dashboard" },
      }).catch(console.error);
    }
  }, [error, hasStartedLogin, isAuthenticated, isLoading, loginWithRedirect, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card/90 backdrop-blur border shadow-xl rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-primary text-primary-foreground rounded-xl p-3 shadow-lg">
                <i className="fas fa-lock text-2xl"></i>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Secure sign in</h2>
            <p className="text-muted-foreground text-sm">
              You&apos;ll be redirected to Auth0 to continue.
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
              {error.message}
            </div>
          )}

          <button
            onClick={() =>
              loginWithRedirect({
                appState: { returnTo: "/dashboard" },
              })
            }
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isLoading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-arrow-right" />}
            Continue with Auth0
          </button>

          <p className="text-xs text-center text-muted-foreground">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
