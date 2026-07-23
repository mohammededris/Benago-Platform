import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { router } from "./routes";
import { Analytics } from "@vercel/analytics/react"
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const API_URL = import.meta.env.VITE_API_URL;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables.");
}

if (!API_URL && import.meta.env.PROD) {
  console.warn("VITE_API_URL is not set. API calls will default to relative paths.");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <RouterProvider router={router} />
      <Analytics />
    </ClerkProvider>
  </StrictMode>,
);
