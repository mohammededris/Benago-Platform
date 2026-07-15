export default function TextReader({ item }) {
  if (!item || !item.content) {
    return (
      <div className="video-player-container" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-secondary)" }}>
        <div className="no-video-placeholder">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p>This text section has no content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-reader-container" style={{ padding: "32px", backgroundColor: "var(--card-bg, #ffffff)", borderRadius: "12px", border: "1px solid var(--border-light, #eaeaea)", minHeight: "400px", display: "flex", flexDirection: "column" }}>
      <div className="text-content" style={{ fontSize: "1.1rem", lineHeight: "1.8", color: "var(--text-secondary, #4b5563)", whiteSpace: "pre-wrap" }}>
        {item.content}
      </div>
    </div>
  );
}
