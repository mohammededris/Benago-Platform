import { useUser, useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { resolveCourseId } from "../../lib/roles";
import { buildApiUrl } from "../../lib/api";
import CourseViewer from "./components/CourseViewer";
import "./Student.css";

export default function StudentDashboard() {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const courseId = resolveCourseId(user);

  useEffect(() => {
    async function loadCourse() {
      if (!isLoaded) return;

      if (!courseId) {
        setError("No course assigned to your account. Please contact an administrator.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = await getToken();

        const res = await fetch(buildApiUrl(`/api/courses/${courseId}`), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          mode: "cors",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to fetch course details (${res.status})`);
        }

        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setError(err.message || "Network error loading workspace.");
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [isLoaded, courseId, getToken]);

  if (!isLoaded || loading) {
    return (
      <div className="state-container">
        <div className="loading-spinner"></div>
        <p
          style={{
            marginTop: "16px",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          Loading your learning workspace...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <div className="error-card">
          <h2 className="error-title">Course Load Error</h2>
          <p className="error-message">{error}</p>
          <button
            className="btn btn-outline"
            style={{ marginTop: "1rem" }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <CourseViewer course={course} user={user} />;
}
