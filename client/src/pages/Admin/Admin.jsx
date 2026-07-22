import { useState } from "react";
import { useUser, useAuth } from "@clerk/react";
import { useAdminDashboard, useAdminUsers, useAdminCourses, useAdminInstructors, useAdminAnalytics } from "./hooks/useAdminData";
import AdminHeader from "./components/AdminHeader";
import AdminStats from "./components/AdminStats";
import AdminTabs from "./components/AdminTabs";
import AdminDashboardTab from "./components/AdminDashboardTab";
import AdminUsersTab from "./components/AdminUsersTab";
import AdminCoursesTab from "./components/AdminCoursesTab";
import AdminInstructorsTab from "./components/AdminInstructorsTab";
import AdminAnalyticsTab from "./components/AdminAnalyticsTab";
import "./Admin.css";

export default function AdminDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch data for each tab
  const dashboard = useAdminDashboard(getToken);
  const users = useAdminUsers(getToken, activeTab === "users");
  const courses = useAdminCourses(getToken, activeTab === "courses");
  const instructors = useAdminInstructors(getToken, activeTab === "instructors");
  const analytics = useAdminAnalytics(getToken, activeTab === "analytics");

  // Tab components mapping
  const tabs = {
    dashboard: (
      <AdminDashboardTab
        stats={dashboard.stats}
        recentActivity={dashboard.recentActivity}
        loading={dashboard.loading}
      />
    ),
    users: (
      <AdminUsersTab
        users={users.users}
        loading={users.loading}
        pagination={users.pagination}
        setPagination={users.setPagination}
        filters={users.filters}
        setFilters={users.setFilters}
        updateUser={users.updateUser}
        deleteUser={users.deleteUser}
      />
    ),
    courses: (
      <AdminCoursesTab
        courses={courses.courses}
        loading={courses.loading}
        pagination={courses.pagination}
        setPagination={courses.setPagination}
        filters={courses.filters}
        setFilters={courses.setFilters}
        updateCourse={courses.updateCourse}
        deleteCourse={courses.deleteCourse}
      />
    ),
    instructors: (
      <AdminInstructorsTab
        instructors={instructors.instructors}
        loading={instructors.loading}
        pagination={instructors.pagination}
        setPagination={instructors.setPagination}
        filters={instructors.filters}
        setFilters={instructors.setFilters}
        updateInstructor={instructors.updateInstructor}
        deleteInstructor={instructors.deleteInstructor}
      />
    ),
    analytics: (
      <AdminAnalyticsTab
        analytics={analytics.analytics}
        loading={analytics.loading}
        timeRange={analytics.timeRange}
        setTimeRange={analytics.setTimeRange}
      />
    ),
  };

  return (
    <div className="admin-layout">
      <AdminHeader user={user} />

      <AdminStats stats={dashboard.stats} />

      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="workspace-container">
        <div className="workspace-tab-content">
          {tabs[activeTab]}
        </div>
      </main>
    </div>
  );
}
