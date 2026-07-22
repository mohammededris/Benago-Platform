export default function StudentsTab({
  students,
  loading,
  error,
  pagination,
  onPageChange,
}) {
  return (
    <div className="tab-pane">
      <div className="pane-header">
        <div>
          <h3 className="pane-title">Enrolled Students</h3>
          <p className="pane-description">
            View students who currently have active enrollment access to this
            course.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state-card">
          <h4 className="empty-state-title">Loading Students…</h4>
        </div>
      ) : error ? (
        <div className="empty-state-card">
          <h4 className="empty-state-title">Unable to Load Students</h4>
          <p className="empty-state-description">{error}</p>
          <button
            className="btn btn-outline"
            onClick={() => onPageChange(pagination.page)}
          >
            Retry
          </button>
        </div>
      ) : !students || students.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-visual">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <h4 className="empty-state-title">No Students Enrolled</h4>
          <p className="empty-state-description">
            There are currently no students registered or synchronized with this
            course ID.
          </p>
        </div>
      ) : (
        <>
          <div className="students-list-wrapper">
            <table className="students-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.studentId}>
                  <td className="student-cell-name">
                    <div className="student-avatar-circle">
                      {student.studentName
                        ? student.studentName.charAt(0).toUpperCase()
                        : "S"}
                    </div>
                    <span>{student.studentName}</span>
                  </td>
                  <td className="student-cell-id">{student.email}</td>
                  <td>
                    <span
                      className={`status-badge-${student.status ?? "active"}`}
                    >
                      {student.status
                        ? student.status.charAt(0).toUpperCase() +
                          student.status.slice(1)
                        : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="students-pagination">
              <button
                className="btn btn-outline"
                disabled={pagination.page === 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                className="btn btn-outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
