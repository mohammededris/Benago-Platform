import { UserButton } from "@clerk/react";

export default function AdminHeader({ user }) {
  return (
    <header className="admin-header">
      <div className="header-brand">
        <div className="brand-logo">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
        </div>
        <div className="brand-details">
          <span className="brand-name">Benago Platform</span>
          <span className="brand-tagline">Admin Dashboard</span>
        </div>
      </div>

      <div className="header-actions">
        <div className="admin-profile">
          <span className="admin-welcome-msg">
            Welcome, {user?.firstName || "Admin"}
          </span>
          <span className="admin-badge">Administrator</span>
        </div>
        <div className="clerk-user-wrapper">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}