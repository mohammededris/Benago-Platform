import { useState } from "react";

export default function VideoPlayer({ video }) {
  const [isLoading, setIsLoading] = useState(true);

  if (!video || !video.url) {
    return (
      <div className="video-player-container">
        <div className="video-ratio-wrapper">
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
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="m10 15 5-3-5-3v6Z" />
            </svg>
            <p>
              No video selected. Select a video from the list to start learning.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Parse YouTube ID and construct standard Embed URL
  function getYouTubeEmbedUrl(url) {
    if (!url) return "";

    const patterns = [
      /[?&]v=([^&#]+)/,
      /youtu\.be\/([^?&#/]+)/,
      /embed\/([^?&#/]+)/,
      /\/v\/([^?&#/]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      const videoId = match?.[1];

      if (videoId && videoId.length === 11) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
      }
    }

    return url;
  }

  const embedUrl = getYouTubeEmbedUrl(video.url);

  return (
    <div className="video-player-container">
      <div className="video-ratio-wrapper">
        {isLoading && (
          <div className="no-video-placeholder">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: "12px" }}>Loading video player...</p>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
