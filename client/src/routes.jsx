/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { NotRegistered } from "./pages/NotRegistered";
import { Unauthorized } from "./pages/Unauthorized";
import RoleGate from "./components/RoleGate";

const Landing = lazy(() =>
  import("./pages/Landing/Landing").then((module) => ({ default: module.Landing })),
);
const AdminDashboard = lazy(() => import("./pages/Admin/Admin"));
const InstructorDashboard = lazy(() => import("./pages/Instructor/Instructor"));
const StudentDashboard = lazy(() => import("./pages/Student/Student"));

function PageFallback() {
  return <div className="state-container">Loading…</div>;
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LazyPage><Landing /></LazyPage> },
      {
        path: "admin",
        element: (
          <RoleGate allowedRoles={["admin"]}>
            <LazyPage><AdminDashboard /></LazyPage>
          </RoleGate>
        ),
      },
      {
        path: "instructor",
        element: (
          <RoleGate allowedRoles={["instructor"]}>
            <LazyPage><InstructorDashboard /></LazyPage>
          </RoleGate>
        ),
      },
      {
        path: "student",
        element: (
          <RoleGate allowedRoles={["student"]}>
            <LazyPage><StudentDashboard /></LazyPage>
          </RoleGate>
        ),
      },
      { path: "not-registered", element: <NotRegistered /> },
      { path: "unauthorized", element: <Unauthorized /> },
      { path: "*", element: <Unauthorized /> },
    ],
  },
]);
