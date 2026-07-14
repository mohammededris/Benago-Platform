import { useUser, useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { resolveCourseId } from "../../lib/roles";
import CourseViewer from "./components/CourseViewer";
import "./Student.css";

export default function StudentDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  const courseId = resolveCourseId(user);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return setError("No course assigned to your account.");

      try {
        setError(null);
        const token = await getToken();

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            mode: "cors",
          },
        );
        if (!res.ok) throw new Error("Failed to fetch course");

        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      }
    }
    loadCourse();
  }, [courseId, getToken]);

  if (error) {
    return (
      <div className="state-container">
        <div className="error-card">
          <h2 className="error-title">Course Load Error</h2>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
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

  return <CourseViewer course={course} user={user} />;
}
