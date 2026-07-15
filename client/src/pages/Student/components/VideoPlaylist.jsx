import { useState } from "react";

export default function VideoPlaylist({ videos = [], activeVideo, onVideoSelect }) {
  const sortedVideos = [...videos].sort((a, b) => a.order - b.order);
  const [mobileOpen, setMobileOpen] = useState(true);

  return (
    <div className="playlist-card">
      {/* Desktop header (hidden on mobile via CSS) */}
      <div className="playlist-header">
        <h3 className="playlist-title">Course Content</h3>
        <p className="playlist-subtitle">{videos.length} sections</p>
      </div>

      {/* Mobile collapsible toggle (shown only on mobile via CSS) */}
      <button
        className="playlist-toggle-btn"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((o) => !o)}
      >
        <span>Course Content · {videos.length} sections</span>
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
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Wrapper that collapses on mobile */}
      <div className={`playlist-items-wrapper${mobileOpen ? " open" : ""}`}>
        <div className="playlist-items">
          {sortedVideos.length === 0 ? (
            <p style={{ padding: "16px", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
              No content available in this course.
            </p>
          ) : (
            sortedVideos.map((video, idx) => {
              const isActive = activeVideo && (activeVideo._id === video._id || activeVideo.url === video.url);

              return (
                <button
                  key={video._id || idx}
                  className={`playlist-item-btn ${isActive ? "active" : ""}`}
                  onClick={() => onVideoSelect(video)}
                  aria-current={isActive ? "true" : "false"}
                >
                  <div className="video-order-circle">
                    {isActive ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    ) : (
                      video.order || idx + 1
                    )}
                  </div>
                  <div className="video-item-info">
                    <span className="video-item-title">{video.title}</span>
                    <div className="video-item-meta">
                      <span className="video-badge">
                        {video.type === "text" ? "Section" : "Lecture"} {video.order || idx + 1}
                      </span>
                      {video.type === "text" ? (
                        <span className="video-duration" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                          Text
                        </span>
                      ) : (
                        video.duration && (
                          <span className="video-duration">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {video.duration}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
