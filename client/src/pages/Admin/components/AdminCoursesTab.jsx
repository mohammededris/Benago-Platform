import { useState, useMemo, useEffect, useRef } from "react";

export default function AdminCoursesTab({ courses, loading, pagination, setPagination, filters, setFilters, updateCourse, deleteCourse }) {
  const [searchDebounced, setSearchDebounced] = useState(filters.search || "");
  const searchTimer = useRef(null);

  useEffect(() => () => clearTimeout(searchTimer.current), []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchDebounced(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
  };

  const handleStatusChange = async (course, newStatus) => {
    try {
      await updateCourse(course.id, { status: newStatus });
    } catch (err) {
      alert("Failed to update course status: " + err.message);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteCourse(course.id);
    } catch (err) {
      alert("Failed to delete course: " + err.message);
    }
  };

  const columns = useMemo(() => [
    { key: "title", label: "Course", width: "300px" },
    { key: "instructor", label: "Instructor", width: "180px" },
    { key: "category", label: "Category", width: "140px" },
    { key: "status", label: "Status", width: "120px" },
    { key: "students", label: "Students", width: "100px" },
    { key: "duration", label: "Duration", width: "120px" },
    { key: "price", label: "Price", width: "100px" },
    { key: "created", label: "Created", width: "140px" },
    { key: "actions", label: "Actions", width: "160px" },
  ], []);

  if (loading && courses.length === 0) {
    return (
      <div className="state-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="courses-tab">
      <div className="pane-header">
        <div>
          <h2 className="pane-title">Course Management</h2>
          <p className="pane-description">Manage all courses, instructors, and content on the platform</p>
        </div>
        <div className="pane-actions">
          <input
            type="text"
            placeholder="Search courses..."
            className="search-input"
            value={searchDebounced}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-table">
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                      <path d="M6 6h10" />
                      <path d="M6 10h10" />
                    </svg>
                    <p>No courses found</p>
                    <p className="empty-hint">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="course-cell">
                      <div className="course-thumbnail">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} />
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                        )}
                      </div>
                      <div className="course-info">
                        <span className="course-title">{course.title}</span>
                        <span className="course-id">ID: {course.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="instructor-cell">
                      <div className="instructor-avatar">
                        {course.instructorName?.[0]?.toUpperCase() || "I"}
                      </div>
                      <span className="instructor-name">{course.instructorName || "Unassigned"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{course.category || "General"}</span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={course.status || "draft"}
                      onChange={(e) => handleStatusChange(course, e.target.value)}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td>
                    <span className="student-count">{course.enrolledStudents?.length || course.studentCount || 0}</span>
                  </td>
                  <td>
                    <span className="duration-cell">{course.duration || 0}h {course.durationMins || 0}m</span>
                  </td>
                  <td>
                    <span className="price-cell">
                      {course.price > 0 ? `$${course.price}` : "Free"}
                    </span>
                  </td>
                  <td>
                    <span className="date-cell">{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "-"}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        title="View course"
                        onClick={() => window.open(`/instructor?course=${course.id}`, "_blank")}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit course"
                        onClick={() => window.open(`/instructor?course=${course.id}`, "_blank")}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete course"
                        onClick={() => handleDelete(course)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            className="page-btn"
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
