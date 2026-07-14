import { useState, useCallback } from "react";

/**
 * useVideoModal
 * Manages all state and logic for the Add/Edit video lecture modal.
 * Receives setLocalVideos and setSaveError from the parent hook so it can
 * mutate the shared video list and surface validation errors via the toast.
 */
export function useVideoModal({ localVideos, setLocalVideos, setSaveError }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editingVideoIndex, setEditingVideoIndex] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: "",
    url: "",
    description: "",
    duration: "",
  });

  const openVideoModal = useCallback(
    (mode, index = null) => {
      setModalMode(mode);
      if (mode === "edit" && index !== null) {
        setEditingVideoIndex(index);
        const video = localVideos[index];
        setVideoForm({
          title: video.title,
          url: video.url,
          description: video.description || "",
          duration: video.duration,
        });
      } else {
        setEditingVideoIndex(null);
        setVideoForm({ title: "", url: "", description: "", duration: "" });
      }
      setIsModalOpen(true);
    },
    [localVideos]
  );

  const handleVideoFormSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Collect every missing required field with a friendly label
      const missing = [];
      if (!videoForm.title.trim())       missing.push("Lecture Title");
      if (!videoForm.url.trim())         missing.push("Video Embed URL");
      if (!videoForm.duration)           missing.push("Duration");
      if (!videoForm.description.trim()) missing.push("Lecture Description");

      if (missing.length > 0) {
        const list = missing.map((f) => `"${f}"`).join(", ");
        setSaveError(`Please fill in the following required fields: ${list}.`);
        setTimeout(() => setSaveError(null), 5000);
        return;
      }

      const videoData = {
        title: videoForm.title,
        url: videoForm.url,
        description: videoForm.description,
        duration: Number(videoForm.duration),
      };

      if (modalMode === "add") {
        setLocalVideos((prev) => [...prev, { ...videoData, order: prev.length + 1 }]);
      } else if (modalMode === "edit" && editingVideoIndex !== null) {
        setLocalVideos((prev) => {
          const updated = [...prev];
          updated[editingVideoIndex] = { ...updated[editingVideoIndex], ...videoData };
          return updated;
        });
      }

      setIsModalOpen(false);
    },
    [videoForm, modalMode, editingVideoIndex, setLocalVideos, setSaveError]
  );

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return {
    isModalOpen,
    modalMode,
    videoForm,
    setVideoForm,
    editingVideoIndex,
    openVideoModal,
    handleVideoFormSubmit,
    closeModal,
  };
}
