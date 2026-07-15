import { useState } from "react";
import { useUser, useAuth } from "@clerk/react";
import { resolveCourseIds } from "../../lib/roles";

// Custom hooks — business logic lives here
import { useConfirmDialog } from "./hooks/useConfirmDialog";
import { useInstructorCourse } from "./hooks/useInstructorCourse";
import { useVideoModal } from "./hooks/useVideoModal";

// UI components
import InstructorHeader from "./components/InstructorHeader";
import InstructorStats from "./components/InstructorStats";
import WorkspaceTabs from "./components/WorkspaceTabs";
import CurriculumTab from "./components/CurriculumTab";
import CourseInfoTab from "./components/CourseInfoTab";
import StudentsTab from "./components/StudentsTab";
import VideoModal from "./components/VideoModal";
import FloatingSaveBar from "./components/FloatingSaveBar";
import ConfirmDialog from "./components/ConfirmDialog";
import CoursePicker from "./components/CoursePicker";
import "./Instructor.css";

export default function InstructorDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();

  // Read the full courseIds array from Clerk publicMetadata
  const courseIds = resolveCourseIds(user);

  // Selected course for this session (null = not yet chosen)
  const [selectedCourseId, setSelectedCourseId] = useState(
    courseIds.length === 1 ? courseIds[0] : null
  );

  const [activeTab, setActiveTab] = useState("curriculum");

  const { confirmDialog, openConfirm, closeConfirm } = useConfirmDialog();

  const {
    course, error, loading,
    localTitle, setLocalTitle,
    localDescription, setLocalDescription,
    localInstructor, setLocalInstructor,
    localVideos, setLocalVideos,
    isDirty, totalCourseDuration,
    handleSaveChanges, handleDiscardChanges,
    moveVideo, deleteVideo,
    isSaving, saveSuccess, saveError, setSaveError,
  } = useInstructorCourse({ courseId: selectedCourseId, getToken, openConfirm });

  const {
    isModalOpen, modalMode, videoForm, setVideoForm,
    editingVideoIndex, openVideoModal, handleVideoFormSubmit, closeModal,
  } = useVideoModal({ localVideos, setLocalVideos, setSaveError });

  // ── No courses assigned ───────────────────────────────────────────────────
  if (courseIds.length === 0) {
    return (
      <div className="state-container">
        <div className="error-card">
          <div className="error-icon-wrapper">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-icon-svg">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="error-title">No Courses Assigned</h2>
          <p className="error-message">
            Your account has no courses assigned yet. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  // ── Multiple courses — show picker until one is chosen ────────────────────
  if (courseIds.length > 1 && !selectedCourseId) {
    return (
      <CoursePicker
        courseIds={courseIds}
        onSelect={(id) => setSelectedCourseId(id)}
      />
    );
  }

  // ── Single course or already selected — show full dashboard ───────────────

  if (error) {
    return (
      <div className="state-container">
        <div className="error-card">
          <div className="error-icon-wrapper">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-icon-svg">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="error-title">Unable to Load Workspace</h2>
          <p className="error-message">{error}</p>
          {courseIds.length > 1 && (
            <button
              className="btn btn-outline"
              style={{ marginTop: "1rem" }}
              onClick={() => setSelectedCourseId(null)}
            >
              ← Back to Course Picker
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="state-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Instructor Workspace...</p>
      </div>
    );
  }

  return (
    <div className="instructor-layout">
      <InstructorHeader user={user} courseName={localTitle || course?.title} />

      <InstructorStats
        totalDuration={totalCourseDuration}
        lecturesCount={localVideos.length}
        enrolledCount={course?.studentsEnrolled?.length || 0}
      />

      <main className="workspace-container">
        <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="workspace-tab-content">
          {activeTab === "curriculum" && (
            <CurriculumTab
              videos={localVideos}
              onMoveVideo={moveVideo}
              onDeleteVideo={deleteVideo}
              onOpenVideoModal={openVideoModal}
            />
          )}
          {activeTab === "details" && (
            <CourseInfoTab
              title={localTitle}
              instructor={localInstructor}
              description={localDescription}
              onTitleChange={setLocalTitle}
              onInstructorChange={setLocalInstructor}
              onDescriptionChange={setLocalDescription}
            />
          )}
          {activeTab === "students" && (
            <StudentsTab students={course?.studentsEnrolled} />
          )}
        </div>
      </main>

      <FloatingSaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSaveChanges}
        onDiscard={handleDiscardChanges}
      />

      {saveSuccess && (
        <div className="success-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Changes saved successfully!
        </div>
      )}

      {saveError && (
        <div className="error-toast">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {saveError}
        </div>
      )}

      <VideoModal
        isOpen={isModalOpen}
        mode={modalMode}
        videoForm={videoForm}
        onFormChange={setVideoForm}
        onClose={closeModal}
        onSubmit={handleVideoFormSubmit}
        editingVideoOrder={editingVideoIndex !== null ? localVideos[editingVideoIndex]?.order : null}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Yes, proceed"
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />

    </div>
  );
}
