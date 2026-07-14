import { useState, useEffect, useMemo, useCallback } from "react";
import { buildApiUrl } from "../../../lib/api";

/**
 * useInstructorCourse
 * Manages all course data: fetching, local edits, dirty-check, save, discard,
 * and curriculum ordering/deletion. Requires an `openConfirm` helper from
 * useConfirmDialog for destructive actions.
 */
export function useInstructorCourse({ courseId, getToken, openConfirm }) {
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local editable copies of course fields
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [localInstructor, setLocalInstructor] = useState("");
  const [localVideos, setLocalVideos] = useState([]);

  // Save feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Fetch course on mount / courseId change
  useEffect(() => {
    async function loadCourse() {
      if (!courseId) {
        setError("No course assigned to your instructor account. Please contact an administrator.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const token = await getToken();

        const res = await fetch(
          buildApiUrl(`/api/courses/${courseId}`),
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
            mode: "cors",
          }
        );

        if (!res.ok) {
          if (res.status === 403)
            throw new Error("Access Denied: You are not authorized to manage this course.");
          throw new Error("Failed to fetch course details.");
        }

        const data = await res.json();
        setCourse(data);
        setLocalTitle(data.title || "");
        setLocalDescription(data.description || "");
        setLocalInstructor(data.instructor || "");
        setLocalVideos([...(data.videos || [])].sort((a, b) => a.order - b.order));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId, getToken]);

  // Whether the local state differs from the persisted course
  const isDirty = useMemo(() => {
    if (!course) return false;
    const initialVideos = [...(course.videos || [])].sort((a, b) => a.order - b.order);

    if (
      localTitle !== course.title ||
      localDescription !== course.description ||
      localInstructor !== course.instructor
    )
      return true;

    if (localVideos.length !== initialVideos.length) return true;
    for (let i = 0; i < localVideos.length; i++) {
      const lv = localVideos[i];
      const iv = initialVideos[i];
      if (
        lv.title !== iv.title ||
        lv.url !== iv.url ||
        lv.description !== iv.description ||
        lv.duration !== iv.duration ||
        lv.order !== iv.order
      )
        return true;
    }
    return false;
  }, [course, localTitle, localDescription, localInstructor, localVideos]);

  // Sum of all video durations (minutes)
  const totalCourseDuration = useMemo(
    () => localVideos.reduce((sum, v) => sum + Number(v.duration || 0), 0),
    [localVideos]
  );

  // Persist local state to the API
  const handleSaveChanges = useCallback(async () => {
    if (!courseId) return;
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setSaveError(null);
      const token = await getToken();

      const res = await fetch(
        buildApiUrl(`/api/courses/${courseId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: localTitle,
            description: localDescription,
            instructor: localInstructor,
            duration: totalCourseDuration,
            videos: localVideos,
          }),
          credentials: "include",
          mode: "cors",
        }
      );

      if (!res.ok) {
        // Try to read the server's error message for a specific explanation
        let message = "Failed to save changes.";
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // response wasn't JSON — keep the fallback
        }
        throw new Error(message);
      }
      const updatedCourse = await res.json();
      setCourse(updatedCourse);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message);
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  }, [courseId, getToken, localTitle, localDescription, localInstructor, totalCourseDuration, localVideos]);

  // Discard local edits after confirmation
  const handleDiscardChanges = useCallback(() => {
    if (!course) return;
    openConfirm({
      title: "Discard Changes",
      message: "Are you sure you want to discard all unsaved changes? This action cannot be undone.",
      onConfirm: () => {
        setLocalTitle(course.title || "");
        setLocalDescription(course.description || "");
        setLocalInstructor(course.instructor || "");
        setLocalVideos([...(course.videos || [])].sort((a, b) => a.order - b.order));
      },
    });
  }, [course, openConfirm]);

  // Move a video up or down in the ordered list
  const moveVideo = useCallback((index, direction) => {
    setLocalVideos((prev) => {
      const updated = [...prev];
      if (direction === "up" && index > 0)
        [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      else if (direction === "down" && index < updated.length - 1)
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated.map((v, i) => ({ ...v, order: i + 1 }));
    });
  }, []);

  // Remove a video after confirmation
  const deleteVideo = useCallback((index) => {
    openConfirm({
      title: "Remove Lecture",
      message: "Are you sure you want to remove this lecture from the curriculum? This cannot be undone.",
      onConfirm: () => {
        setLocalVideos((prev) => {
          const updated = prev.filter((_, i) => i !== index);
          return updated.map((v, i) => ({ ...v, order: i + 1 }));
        });
      },
    });
  }, [openConfirm]);

  return {
    // Server state
    course,
    error,
    loading,
    // Local editable fields
    localTitle, setLocalTitle,
    localDescription, setLocalDescription,
    localInstructor, setLocalInstructor,
    localVideos, setLocalVideos,
    // Computed
    isDirty,
    totalCourseDuration,
    // Actions
    handleSaveChanges,
    handleDiscardChanges,
    moveVideo,
    deleteVideo,
    // Save feedback
    isSaving,
    saveSuccess,
    saveError,
    setSaveError,
  };
}
