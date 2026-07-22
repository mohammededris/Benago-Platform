import { useEffect, useRef, useState } from "react";

const Avatar = ({ name, email }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : email[0].toUpperCase();
  return <div className="user-avatar">{initials}</div>;
};

const columns = [
  { key: "user", label: "User", width: "280px" },
  { key: "email", label: "Email", width: "220px" },
  { key: "role", label: "Role", width: "140px" },
  { key: "status", label: "Status", width: "140px" },
  { key: "courses", label: "Courses", width: "100px" },
  { key: "enrollments", label: "Enrollments", width: "130px" },
  { key: "created", label: "Joined", width: "140px" },
  { key: "actions", label: "Actions", width: "160px" },
];

export default function AdminUsersTab({ users, loading, pagination, setPagination, filters, setFilters, updateUser, deleteUser }) {
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

  const handleRoleChange = async (user, newRole) => {
    try {
      await updateUser(user.id, { role: newRole });
    } catch (err) {
      alert("Failed to update role: " + err.message);
    }
  };

  const handleStatusChange = async (user, newStatus) => {
    try {
      await updateUser(user.id, { status: newStatus });
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name || user.email}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteUser(user.id);
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="state-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-tab">
      <div className="pane-header">
        <div>
          <h2 className="pane-title">User Management</h2>
          <p className="pane-description">Manage all platform users, roles, and permissions</p>
        </div>
        <div className="pane-actions">
          <input
            type="text"
            placeholder="Search users..."
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
            {users.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-table">
                  <div className="empty-state">
                    <p>No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <Avatar name={user.name} email={user.email} />
                      <div className="user-info">
                        <span className="user-name">{user.name || "Unnamed"}</span>
                        <span className="user-id">ID: {user.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="user-email">{user.email}</span>
                  </td>
                  <td>
                    <select
                      className="role-select"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={user.status || "active"}
                      onChange={(e) => handleStatusChange(user, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td>
                    <span className="course-count">{user.courseCount || 0}</span>
                  </td>
                  <td>
                    <span className="enrollment-count">{user.enrollmentCount || 0}</span>
                  </td>
                  <td>
                    <span className="date-cell">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        title="View profile"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        className="action-btn edit-btn"
                        title="Edit user"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        title="Delete user"
                        onClick={() => handleDelete(user)}
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
