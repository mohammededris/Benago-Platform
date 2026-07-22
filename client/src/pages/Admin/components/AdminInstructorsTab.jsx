import { useState, useMemo, useEffect, useRef } from "react";

export default function AdminInstructorsTab({ instructors, loading, pagination, setPagination, filters, setFilters, updateInstructor, deleteInstructor }) {
  const [searchDebounced, setSearchDebounced] = useState(filters.search || "");
  const searchTimer = useRef(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

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

  const handleStatusChange = async (instructor, newStatus) => {
    try {
      await updateInstructor(instructor.id, { status: newStatus });
    } catch (err) {
      alert("Failed to update instructor status: " + err.message);
    }
  };

  const handleDelete = async (instructor) => {
    if (!window.confirm(`Are you sure you want to remove ${instructor.name} as an instructor? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteInstructor(instructor.id);
    } catch (err) {
      alert("Failed to remove instructor: " + err.message);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      // Call invite instructor API
      await fetch("/api/admin/instructors/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      setInviteEmail("");
      setShowInviteModal(false);
      alert("Invitation sent!");
    } catch (err) {
      alert("Failed to send invitation: " + err.message);
    }
  };

  const columns = useMemo(() => [
    { key: "name", label: "Instructor", width: "220px" },
    { key: "email", label: "Email", width: "220px" },
    { key: "courses", label: "Courses", width: "100px" },
    { key: "students", label: "Students", width: "100px" },
    { key: "revenue", label: "Revenue", width: "120px" },
    { key: "status", label: "Status", width: "140px" },
    { key: "joined", label: "Joined", width: "140px" },
    { key: "actions", label: "Actions", width: "160px" },
  ], []);

  if (loading && instructors.length === 0) {
    return (
      <div className="state-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading instructors...</p>
      </div>
    );
  }

  return (
    <div className="instructors-tab">
      <div className="pane-header">
        <div>
          <h2 className="pane-title">Instructor Management</h2>
          <p className="pane-description">Manage instructor accounts, courses, and permissions</p>
        </div>
        <div className="pane-actions">
          <input
            type="text"
            placeholder="Search instructors..."
            className="search-input"
            value={searchDebounced}
            onChange={handleSearch}
          />
          <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Invite Instructor
          </button>
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
            {instructors.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-table">
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                    <p>No instructors found</p>
                    <p className="empty-hint">Invite your first instructor to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              instructors.map((instructor) => (
                <tr key={instructor.id}>
                  <td>
                    <div className="instructor-cell">
                      <div className="instructor-avatar">
                        {instructor.name?.[0]?.toUpperCase() || instructor.email?.[0]?.toUpperCase() || "I"}
                      </div>
                      <div className="instructor-info">
                        <span className="instructor-name">{instructor.name || "Unnamed"}</span>
                        <span className="instructor-id">ID: {instructor.id?.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="email-cell">{instructor.email}</span>
                  </td>
                  <td>
                    <span className="course-count">{instructor.courseCount || instructor.courses?.length || 0}</span>
                  </td>
                  <td>
                    <span className="student-count">{instructor.totalStudents || 0}</span>
                  </td>
                  <td>
                    <span className="revenue-cell">${(instructor.totalRevenue || 0).toLocaleString()}</span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={instructor.status || "pending"}
                      onChange={(e) => handleStatusChange(instructor, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td>
                    <span className="date-cell">{instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString() : "-"}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        title="View courses"
                        onClick={() => window.open(`/instructor?instructor=${instructor.id}`, "_blank")}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit instructor"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Remove instructor"
                        onClick={() => handleDelete(instructor)}
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

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Invite Instructor</h3>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleInvite} className="modal-form">
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="instructor@university.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
