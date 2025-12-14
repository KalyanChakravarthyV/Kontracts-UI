import { createRoot } from "react-dom/client";
import App from "./App";
import { Auth0ProviderWithNavigate } from "./components/auth/Auth0ProviderWithNavigate";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Auth0ProviderWithNavigate>
    <App />
  </Auth0ProviderWithNavigate>
);
