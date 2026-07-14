import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { router } from "./routes";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables.");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
);
