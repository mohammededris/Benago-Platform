import { memo } from "react";

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

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

export default function AdminStats({ stats }) {
  const statCards = [
    {
      label: "Total Users",
      value: formatNumber(stats.totalUsers),
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
      value: formatNumber(stats.totalCourses),
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
      value: formatNumber(stats.totalInstructors),
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
      value: formatNumber(stats.totalStudents),
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
  ];

  return (
    <section className="stats-strip">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </section>
  );
}
