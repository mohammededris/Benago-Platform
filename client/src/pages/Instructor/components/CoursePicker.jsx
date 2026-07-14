import "./CoursePicker.css";

/**
 * CoursePicker
 *
 * Full-screen overlay shown when an instructor manages more than one course.
 * The instructor clicks a card to select which course to work on for this session.
 *
 * Props:
 *   courseIds  — string[]  — list of courseId values from Clerk metadata
 *   onSelect   — (id: string) => void — called when a card is clicked
 */
export default function CoursePicker({ courseIds, onSelect }) {
  return (
    <div className="picker-overlay" role="main">
      <div className="picker-container">
        <div className="picker-header">
          <div className="picker-icon" aria-hidden="true">🎓</div>
          <h1 className="picker-title">Select a Course</h1>
          <p className="picker-subtitle">
            You manage multiple courses. Choose one to open your workspace.
          </p>
        </div>

        <div className="picker-grid">
          {courseIds.map((id, index) => (
            <button
              key={id}
              id={`course-pick-${id}`}
              className="picker-card"
              onClick={() => onSelect(id)}
              aria-label={`Open workspace for course ${id}`}
            >
              <div className="picker-card-number" aria-hidden="true">
                {index + 1}
              </div>
              <div className="picker-card-body">
                <span className="picker-card-label">Course ID</span>
                <span className="picker-card-id">{id}</span>
              </div>
              <div className="picker-card-arrow" aria-hidden="true">→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
