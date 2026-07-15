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
            {mode === "add" ? "Add Curriculum Section" : "Edit Curriculum Section"}
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
          <div className="form-group" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="sectionType"
                value="video"
                checked={videoForm.type === "video"}
                onChange={() => onFormChange({ ...videoForm, type: "video" })}
              />
              Video Lecture
            </label>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="sectionType"
                value="text"
                checked={videoForm.type === "text"}
                onChange={() => onFormChange({ ...videoForm, type: "text" })}
              />
              Text Section
            </label>
          </div>

          <div className="form-group">
            <label className="form-label required-field">Section Title</label>
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

          {videoForm.type === "video" ? (
            <>
              <div className="form-group">
                <label className="form-label required-field">Video Embed URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={videoForm.url || ""}
                  onChange={(e) =>
                    onFormChange({ ...videoForm, url: e.target.value })
                  }
                  placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                  required={videoForm.type === "video"}
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
                    value={videoForm.duration || ""}
                    onChange={(e) =>
                      onFormChange({ ...videoForm, duration: e.target.value })
                    }
                    placeholder="e.g. 15"
                    min="1"
                    required={videoForm.type === "video"}
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
            </>
          ) : (
            <div className="form-group">
              <label className="form-label required-field">Text Content</label>
              <textarea
                className="form-textarea"
                value={videoForm.content || ""}
                onChange={(e) =>
                  onFormChange({ ...videoForm, content: e.target.value })
                }
                placeholder="Enter the text content for this section"
                rows="8"
                required={videoForm.type === "text"}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label required-field">
              Short Description
            </label>
            <textarea
              className="form-textarea"
              value={videoForm.description}
              onChange={(e) =>
                onFormChange({ ...videoForm, description: e.target.value })
              }
              placeholder="Enter a brief summary of what this section covers"
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
              {mode === "add" ? "Add to Curriculum" : "Update Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
