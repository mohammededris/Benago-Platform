import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Landing } from "./pages/Landing/Landing";
import AdminDashboard from "./pages/Admin/Admin";
import InstructorDashboard from "./pages/Instructor/Instructor";
import StudentDashboard from "./pages/Student/Student";
import { NotRegistered } from "./pages/NotRegistered";
import { Unauthorized } from "./pages/Unauthorized";
import RoleGate from "./components/RoleGate";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      {
        path: "admin",
        element: (
          <RoleGate allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleGate>
        ),
      },
      {
        path: "instructor",
        element: (
          <RoleGate allowedRoles={["instructor"]}>
            <InstructorDashboard />
          </RoleGate>
        ),
      },
      {
        path: "student",
        element: (
          <RoleGate allowedRoles={["student"]}>
            <StudentDashboard />
          </RoleGate>
        ),
      },
      { path: "not-registered", element: <NotRegistered /> },
      { path: "unauthorized", element: <Unauthorized /> },
      
    ],
  },
]);
