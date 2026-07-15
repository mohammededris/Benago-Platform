export default function CurriculumTab({
  videos,
  onMoveVideo,
  onDeleteVideo,
  onOpenVideoModal,
}) {
  return (
    <div className="tab-pane">
      <div className="pane-header">
        <div>
          <h3 className="pane-title">Course Curriculum</h3>
          <p className="pane-description">
            Organize, edit, delete, and add sections (videos and text) for this course.
          </p>
        </div>
        <button
          className="add-video-btn"
          onClick={() => onOpenVideoModal("add")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Section
        </button>
      </div>

      {videos.length === 0 ? (
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
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h4 className="empty-state-title">No Curriculum Added</h4>
          <p className="empty-state-description">
            Get started by uploading or linking your first video lecture, or adding a text section to this
            course curriculum.
          </p>
          <button
            className="add-video-btn"
            onClick={() => onOpenVideoModal("add")}
          >
            Add First Section
          </button>
        </div>
      ) : (
        <div className="curriculum-list">
          {videos.map((video, index) => (
            <div
              key={video._id ?? video.url ?? index}
              className="curriculum-item-card"
            >
              <div className="item-drag-order">
                <span className="lecture-pill">Sec {video.order}</span>
              </div>
              <div className="item-details">
                <h4 className="item-title">{video.title}</h4>
                <p className="item-desc">
                  {video.description || "No description provided."}
                </p>
                <div className="item-meta">
                  {video.type === "text" ? (
                    <span className="meta-badge text-badge">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Text Section
                    </span>
                  ) : (
                    <>
                      <span className="meta-badge duration-badge">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {video.duration} mins
                      </span>
                      <span className="meta-badge url-badge">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Video Link
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="item-controls">
                <div className="reorder-controls">
                  <button
                    className="control-btn up-btn"
                    disabled={index === 0}
                    onClick={() => onMoveVideo(index, "up")}
                    title="Move Up"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    className="control-btn down-btn"
                    disabled={index === videos.length - 1}
                    onClick={() => onMoveVideo(index, "down")}
                    title="Move Down"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                <div className="action-controls">
                  <button
                    className="control-btn edit-btn"
                    onClick={() => onOpenVideoModal("edit", index)}
                    title="Edit Section"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    className="control-btn delete-btn"
                    onClick={() => onDeleteVideo(index)}
                    title="Delete Section"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
