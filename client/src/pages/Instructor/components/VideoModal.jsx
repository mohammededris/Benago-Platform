export default function VideoModal({
  isOpen,
  mode,
  videoForm,
  onFormChange,
  onClose,
  onSubmit,
  editingVideoOrder,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content-card">
        <div className="modal-header">
          <h3 className="modal-title">
            {mode === "add" ? "Add Lecture Video" : "Edit Lecture Video"}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
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

        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label required-field">Lecture Title</label>
            <input
              type="text"
              className="form-input"
              value={videoForm.title}
              onChange={(e) =>
                onFormChange({ ...videoForm, title: e.target.value })
              }
              placeholder="e.g. Getting Started with React"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label required-field">Video Embed URL</label>
            <input
              type="url"
              className="form-input"
              value={videoForm.url}
              onChange={(e) =>
                onFormChange({ ...videoForm, url: e.target.value })
              }
              placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
              required
            />
            <span className="field-hint">
              Provide a standard embeddable video URL (e.g. YouTube /embed/
              formats).
            </span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required-field">
                Duration (Minutes)
              </label>
              <input
                type="number"
                className="form-input"
                value={videoForm.duration}
                onChange={(e) =>
                  onFormChange({ ...videoForm, duration: e.target.value })
                }
                placeholder="e.g. 15"
                min="1"
                required
              />
            </div>
            {mode === "edit" && (
              <div className="form-group">
                <label className="form-label">Position / Order</label>
                <input
                  type="text"
                  className="form-input"
                  value={`Lec ${editingVideoOrder}`}
                  disabled
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label required-field">
              Lecture Description
            </label>
            <textarea
              className="form-textarea"
              value={videoForm.description}
              onChange={(e) =>
                onFormChange({ ...videoForm, description: e.target.value })
              }
              placeholder="Enter a brief summary of what this video lecture covers"
              rows="4"
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="modal-submit-btn">
              {mode === "add" ? "Add to Curriculum" : "Update Lecture"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
