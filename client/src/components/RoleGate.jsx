import { useUser } from "@clerk/react";
import { Navigate, useLocation } from "react-router-dom";
import { resolveRole, ROLE_ROUTES, FALLBACK_ROUTE } from "../lib/roles";

export default function RoleGate({ allowedRoles, children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="state-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="loading-spinner" />
        <p style={{ marginTop: "16px", color: "#64748b", fontWeight: 500 }}>Authenticating...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const role = resolveRole(user);

  if (!role || !ROLE_ROUTES[role]) {
    return <Navigate to={FALLBACK_ROUTE} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={ROLE_ROUTES[role]} replace />;
  }

  return children;
}
