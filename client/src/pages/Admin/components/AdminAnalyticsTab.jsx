import { useMemo } from "react";

const StatCard = ({ label, value, icon, color, trend }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}-icon`}>{icon}</div>
    <div className="stat-details">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {trend && <span className={`stat-trend ${trend.positive ? "positive" : "negative"}`}>{trend.value}</span>}
    </div>
  </div>
);

const ChartPlaceholder = ({ title, data }) => (
  <div className="chart-placeholder">
    <h4>{title}</h4>
    <div className="chart-bars">
      {(data || []).map((item, i) => (
        <div key={i} className="chart-bar" style={{ height: `${Math.min(item.value || 100, 100)}%` }}>
          <span className="chart-bar-label">{item.label || `Item ${i + 1}`}</span>
          <span className="chart-bar-value">{item.value || 0}</span>
        </div>
      ))}
      {(data || []).length === 0 && Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="chart-bar" style={{ height: `${20 + i * 15}%` }}>
          <span className="chart-bar-label">Data {i + 1}</span>
          <span className="chart-bar-value">{(i + 1) * 200}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminAnalyticsTab({ analytics, loading, timeRange, setTimeRange }) {
  const timeRanges = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
  ];

  const statCards = useMemo(() => [
    { label: "Total Revenue", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(analytics?.revenue?.total || 0), icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ), color: "revenue", trend: { value: "+23%", positive: true }},
    { label: "Total Enrollments", value: analytics?.enrollments?.total?.toLocaleString() || "0", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ), color: "enrollments", trend: { value: "+18%", positive: true }},
    { label: "Active Users", value: analytics?.users?.active?.toLocaleString() || "0", icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ), color: "users", trend: { value: "+12%", positive: true }},
    { label: "Completion Rate", value: `${analytics?.courses?.avgCompletionRate || 0}%`, icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ), color: "courses", trend: { value: "+2%", positive: true }},
  ], [analytics]);

  if (loading) {
    return (
      <div className="state-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-tab">
      <div className="pane-header">
        <div>
          <h2 className="pane-title">Analytics & Reports</h2>
          <p className="pane-description">Platform performance metrics and insights</p>
        </div>
        <div className="pane-actions">
          <select
            className="time-range-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>

      <section className="stats-strip">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </section>

      <div className="analytics-grid">
        <div className="analytics-card">
          <ChartPlaceholder title="Revenue Over Time" data={analytics?.revenue?.monthly} />
        </div>
        <div className="analytics-card">
          <ChartPlaceholder title="Enrollments Over Time" data={analytics?.enrollments?.monthly} />
        </div>
        <div className="analytics-card wide">
          <ChartPlaceholder title="Courses by Category" data={analytics?.courses?.byCategory} />
        </div>
        <div className="analytics-card wide">
          <ChartPlaceholder title="User Growth by Role" data={analytics?.users?.byRole} />
        </div>
        <div className="analytics-card">
          <ChartPlaceholder title="Top Courses by Completion" data={analytics?.courses?.completionRates} />
        </div>
        <div className="analytics-card">
          <ChartPlaceholder title="Revenue by Course" data={analytics?.courses?.revenueByCourse} />
        </div>
      </div>
    </div>
  );
}