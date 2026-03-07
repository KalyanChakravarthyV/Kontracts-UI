import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "wouter";

export default function AuthCallback() {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      setLocation("/dashboard");
    } else if (error) {
      console.error("Auth callback error", error);
      setLocation("/auth");
    }
  }, [error, isAuthenticated, isLoading, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Processing sign in...</p>
      </div>
    </div>
  );
}
