/**
 * ConfirmDialog — a styled replacement for window.confirm().
 * Renders a modal overlay with a title, message, and confirm/cancel actions.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content-card"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>

          <div className="modal-actions" style={{ marginTop: "20px" }}>
            <button className="modal-cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="modal-submit-btn"
              onClick={onConfirm}
              style={{ backgroundColor: "#dc2626" }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
