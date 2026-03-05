import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSubjects from "./pages/student/StudentSubjects";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentMaterials from "./pages/student/StudentMaterials";
import StudentSettings from "./pages/student/StudentSettings";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TakeAttendance from "./pages/teacher/TakeAttendance";
import CreateAssignment from "./pages/teacher/CreateAssignment";
import Submissions from "./pages/teacher/Submissions";
import UploadMaterial from "./pages/teacher/UploadMaterial";
import TeacherSettings from "./pages/teacher/TeacherSettings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/subjects"
        element={
          <ProtectedRoute role="student">
            <StudentSubjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute role="student">
            <StudentAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/materials"
        element={
          <ProtectedRoute role="student">
            <StudentMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute role="student">
            <StudentSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute role={["teacher", "admin"]}>
            <TakeAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assignments/create"
        element={
          <ProtectedRoute role={["teacher", "admin"]}>
            <CreateAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/submissions"
        element={
          <ProtectedRoute role={["teacher", "admin"]}>
            <Submissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/materials/upload"
        element={
          <ProtectedRoute role={["teacher", "admin"]}>
            <UploadMaterial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/settings"
        element={
          <ProtectedRoute role={["teacher", "admin"]}>
            <TeacherSettings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
