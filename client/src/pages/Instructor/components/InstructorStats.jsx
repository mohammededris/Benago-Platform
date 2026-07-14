import { memo } from "react";

/** Converts raw minutes to "Xh Ym" (or just "Ym" / "Xh") format */
function formatDuration(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return "0 min";
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

const InstructorStats = memo(function InstructorStats({
  totalDuration,
  lecturesCount,
  enrolledCount,
}) {
  return (
    <section className="stats-strip">
      <div className="stat-card">
        <div className="stat-icon duration-icon">
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="stat-details">
          <span className="stat-value">{formatDuration(totalDuration)}</span>
          <span className="stat-label">Total Duration</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon lectures-icon">
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
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <div className="stat-details">
          <span className="stat-value">{lecturesCount}</span>
          <span className="stat-label">Total Lectures</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon students-icon">
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
        </div>
        <div className="stat-details">
          <span className="stat-value">{enrolledCount}</span>
          <span className="stat-label">Enrolled Students</span>
        </div>
      </div>
    </section>
  );
});

export default InstructorStats;
