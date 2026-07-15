import { useState } from "react";
import { UserButton } from "@clerk/react";
import VideoPlayer from "./VideoPlayer";
import VideoPlaylist from "./VideoPlaylist";
import TextReader from "./TextReader";

export default function CourseViewer({ course, user }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState("video"); // "video" | "course" | "instructor"

  const sortedVideos = course?.videos
    ? [...course.videos].sort((a, b) => a.order - b.order)
    : [];
  const activeVideo =
    selectedVideo &&
    sortedVideos.some(
      (video) =>
        video.url === selectedVideo.url && video.order === selectedVideo.order,
    )
      ? selectedVideo
      : (sortedVideos[0] ?? null);

  if (!course) return null;

  return (
    <div className="student-dashboard-layout">
      {/* Sleek dashboard header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span>Benago Platform</span>
        </div>

        <div className="student-dashboard-header">
          <span>{course.title}</span>
        </div>

        <div className="user-profile-section">
          <div className="student-welcome">
            <span className="student-name">
              {user?.fullName || user?.firstName || "Student"}
            </span>
            <span className="student-label">Student Account</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Course Workspace */}
      <main className="course-viewer-grid">
        {/* Left Side: Video Player + Detailed Tabs */}
        <div className="course-main-content">
          {activeVideo?.type === "text" ? (
            <TextReader key={activeVideo?._id ?? "no-text"} item={activeVideo} />
          ) : (
            <VideoPlayer
              key={activeVideo?.url ?? "no-video"}
              video={activeVideo}
            />
          )}

          <div className="course-metadata-card">
            <div className="course-metadata-header">
              {activeVideo && (
                <span className="current-video-index">
                  {activeVideo.type === "text" ? "Section" : "Lecture"} {activeVideo.order}
                </span>
              )}
              <h2 className="current-video-title">
                {activeVideo ? activeVideo.title : course.title}
              </h2>
            </div>

            {/* Tabbed Info System */}
            <div className="details-tabs">
              <nav className="tab-headers" aria-label="Lecture details tabs">
                <button
                  className={`tab-button ${activeTab === "video" ? "active" : ""}`}
                  onClick={() => setActiveTab("video")}
                >
                  Section Info
                </button>
                <button
                  className={`tab-button ${activeTab === "course" ? "active" : ""}`}
                  onClick={() => setActiveTab("course")}
                >
                  About Course
                </button>
                <button
                  className={`tab-button ${activeTab === "instructor" ? "active" : ""}`}
                  onClick={() => setActiveTab("instructor")}
                >
                  Instructor
                </button>
              </nav>

              <div className="tab-body">
                {activeTab === "video" && (
                  <div>
                    {activeVideo?.description ? (
                      <p>{activeVideo.description}</p>
                    ) : (
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        No specific description provided for this section.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "course" && (
                  <div>
                    <h4
                      style={{
                        fontWeight: 600,
                        marginBottom: "8px",
                        color: "var(--text-primary)",
                      }}
                    >
                      {course.title}
                    </h4>
                    <p>{course.description}</p>
                  </div>
                )}

                {activeTab === "instructor" && (
                  <div className="instructor-info">
                    <div className="instructor-avatar">
                      {course.instructor
                        ? course.instructor.charAt(0).toUpperCase()
                        : "I"}
                    </div>
                    <div className="instructor-details">
                      <span className="instructor-name">
                        {course.instructor}
                      </span>
                      <span className="instructor-role">Course Instructor</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Playlist Sidebar */}
        <aside className="course-sidebar">
          <VideoPlaylist
            videos={course.videos}
            activeVideo={activeVideo}
            onVideoSelect={setSelectedVideo}
          />
        </aside>
      </main>
    </div>
  );
}
