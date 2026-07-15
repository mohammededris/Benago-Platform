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
    type: "video",
    title: "",
    url: "",
    description: "",
    duration: "",
    content: "",
  });

  const openVideoModal = useCallback(
    (mode, index = null) => {
      setModalMode(mode);
      if (mode === "edit" && index !== null) {
        setEditingVideoIndex(index);
        const video = localVideos[index];
        setVideoForm({
          type: video.type || "video",
          title: video.title,
          url: video.url || "",
          description: video.description || "",
          duration: video.duration || "",
          content: video.content || "",
        });
      } else {
        setEditingVideoIndex(null);
        setVideoForm({ type: "video", title: "", url: "", description: "", duration: "", content: "" });
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
      if (!videoForm.title.trim()) missing.push("Section Title");
      
      if (videoForm.type === "video") {
        if (!videoForm.url.trim()) missing.push("Video Embed URL");
        if (!videoForm.duration) missing.push("Duration");
      } else {
        if (!videoForm.content.trim()) missing.push("Text Content");
      }
      
      if (!videoForm.description.trim()) missing.push("Description");

      if (missing.length > 0) {
        const list = missing.map((f) => `"${f}"`).join(", ");
        setSaveError(`Please fill in the following required fields: ${list}.`);
        setTimeout(() => setSaveError(null), 5000);
        return;
      }

      const videoData = {
        type: videoForm.type,
        title: videoForm.title,
        description: videoForm.description,
        ...(videoForm.type === "video" 
            ? { url: videoForm.url, duration: Number(videoForm.duration) }
            : { content: videoForm.content })
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
