import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import CreateWorkspacePage from "./pages/CreateWorkspacePage";
import Dashboard from "./pages/dashboard";
import ProjectPage from "./pages/ProjectPage/ProjectPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/create-workspace" element={<CreateWorkspacePage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/project/:id" element={<ProtectedRoute><Dashboard><ProjectPage /></Dashboard></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}