import { createRoot } from "react-dom/client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import App from "./App";
import { Auth0ProviderWithNavigate } from "./components/auth/Auth0ProviderWithNavigate";
import "./index.css";

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com",
    capture_pageview: false,
  });
}

createRoot(document.getElementById("root")!).render(
  <PostHogProvider client={posthog}>
    <Auth0ProviderWithNavigate>
      <App />
    </Auth0ProviderWithNavigate>
  </PostHogProvider>
);
