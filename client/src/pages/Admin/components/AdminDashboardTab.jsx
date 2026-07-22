import { memo } from "react";

const ActivityItem = memo(function ActivityItem({ activity }) {
  const getIcon = (type) => {
    switch (type) {
      case "user_registered":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
        );
      case "course_created":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
        );
      case "enrollment":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case "payment":
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      default:
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "user_registered":
        return "var(--color-primary)";
      case "course_created":
        return "#10b981";
      case "enrollment":
        return "#f59e0b";
      case "payment":
        return "#06b6d4";
      default:
        return "var(--text-muted)";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="activity-item">
      <div
        className="activity-icon"
        style={{
          backgroundColor: `${getTypeColor(activity.type)}20`,
          color: getTypeColor(activity.type),
        }}
      >
        {getIcon(activity.type)}
      </div>
      <div className="activity-content">
        <div className="activity-message">
          <span className="activity-user">{activity.userName || "System"}</span>
          <span>{activity.message}</span>
        </div>
        <span className="activity-time">{formatTime(activity.timestamp)}</span>
      </div>
    </div>
  );
});

const StatCard = memo(function StatCard({ label, value, icon, color, trend }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}-icon`}>{icon}</div>
      <div className="stat-details">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {trend && (
          <span
            className={`stat-trend ${trend.positive ? "positive" : "negative"}`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
});

export default function AdminDashboardTab({ stats, recentActivity, loading }) {
  if (loading) {
    return (
      <div className="state-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers?.toLocaleString() || "0",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: "users",
      trend: { value: "+12%", positive: true },
    },
    {
      label: "Total Courses",
      value: stats.totalCourses?.toLocaleString() || "0",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      ),
      color: "courses",
      trend: { value: "+8%", positive: true },
    },
    {
      label: "Instructors",
      value: stats.totalInstructors?.toLocaleString() || "0",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      ),
      color: "instructors",
      trend: { value: "+5%", positive: true },
    },
    {
      label: "Students",
      value: stats.totalStudents?.toLocaleString() || "0",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: "students",
      trend: { value: "+15%", positive: true },
    },
    {
      label: "Total Enrollments",
      value: stats.totalEnrollments?.toLocaleString() || "0",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      color: "enrollments",
      trend: { value: "+18%", positive: true },
    },
  ];

  return (
    <div className="dashboard-tab">
      <div className="pane-header">
        <div>
          <h2 className="pane-title">Dashboard Overview</h2>
          <p className="pane-description">
            Key metrics and recent activity across your platform
          </p>
        </div>
      </div>

      <section className="stats-strip">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </section>

      <div className="recent-activity-card">
        <h3 className="card-title">Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <p>No recent activity to display</p>
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
