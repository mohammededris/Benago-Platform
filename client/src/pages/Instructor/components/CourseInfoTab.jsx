export default function CourseInfoTab({
  title,
  instructor,
  description,
  onInstructorChange,
  onDescriptionChange,
}) {
  return (
    <div className="tab-pane">
      <div className="pane-header">
        <div>
          <h3 className="pane-title">Course Information</h3>
          <p className="pane-description">
            Configure the course metadata displayed to enrolled students.
          </p>
        </div>
      </div>

      <div className="details-form-card">
        <div className="form-group">
          <label htmlFor="course-title" className="form-label">
            Course Title
          </label>
          <input
            type="text"
            id="course-title"
            className="form-input"
            value={title}
            readOnly
            placeholder="Enter course title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="course-instructor" className="form-label">
            Instructor Display Name
          </label>
          <input
            type="text"
            id="course-instructor"
            className="form-input"
            value={instructor}
            onChange={(e) => onInstructorChange(e.target.value)}
            placeholder="Enter instructor display name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="course-desc" className="form-label">
            Course Description
          </label>
          <textarea
            id="course-desc"
            className="form-textarea"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Provide a description of the course contents and objectives"
            rows="6"
            required
          />
        </div>
      </div>
    </div>
  );
}
