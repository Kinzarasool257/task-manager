import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfileSetupPage from "./pages/ProfileSetupPage";
import CreateWorkspacePage from "./pages/CreateWorkspacePage";
import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/ProjectPage/ProjectPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import BillingPage from "./pages/Billing/BillingPage";
import UpgradePage from "./pages/Billing/UpgradePage";
import CheckoutPage from "./pages/Billing/CheckoutPage";
import BillingSuccessPage from "./pages/Billing/BillingSuccessPage";
import MembersPage from "./pages/Members/MembersPage";
import WorkspaceInvitePage from "./pages/Members/WorkspaceInvitePage";
import ProjectSettingsPage from "./pages/ProjectPage/ProjectSettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import DocumentationPage from "./pages/ProjectPage/Documentationpage";
import MyTasks from "./pages/MyTasks";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/profile-setup"
          element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>}
        />

        <Route path="/create-workspace"
          element={<ProtectedRoute><CreateWorkspacePage /></ProtectedRoute>}
        />

        <Route path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />

        {/* My Tasks page */}
        <Route path="/dashboard/my-tasks"
          element={<ProtectedRoute><Dashboard><MyTasks /></Dashboard></ProtectedRoute>}
        />

        {/* Project page */}
        <Route path="/dashboard/project/:id"
          element={<ProtectedRoute><Dashboard><ProjectPage /></Dashboard></ProtectedRoute>}
        />
        {/* NEW: Add this specific route for the settings page */}
        <Route path="/dashboard/project/:id/settings" element={<ProtectedRoute><Dashboard><ProjectSettingsPage /></Dashboard></ProtectedRoute>} />

        {/* Project Documentation Page */}
        <Route path="/dashboard/project/:id/documentation"
          element={<ProtectedRoute><Dashboard><DocumentationPage /></Dashboard></ProtectedRoute>}
        />

        {/* Settings page */}
        <Route path="/dashboard/settings"
          element={<ProtectedRoute><Dashboard><SettingsPage /></Dashboard></ProtectedRoute>}
        />

        {/* Members page */}
        <Route path="/dashboard/members"
          element={<ProtectedRoute><Dashboard><MembersPage /></Dashboard></ProtectedRoute>}
        />

        {/* Notifications page */}
        <Route path="/dashboard/notifications"
          element={<ProtectedRoute><Dashboard><NotificationsPage /></Dashboard></ProtectedRoute>}
        />

        {/* Profile */}
        <Route path="/profile"
          element={<ProtectedRoute><Dashboard><ProfilePage /></Dashboard></ProtectedRoute>}
        />

        {/* Billing pages */}
        <Route path="/billing"
          element={<ProtectedRoute><Dashboard><BillingPage /></Dashboard></ProtectedRoute>}
        />
        <Route path="/upgrade"
          element={<ProtectedRoute><Dashboard><UpgradePage /></Dashboard></ProtectedRoute>}
        />
        <Route path="/billing/checkout"
          element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
        />
        <Route path="/billing/success"
          element={<ProtectedRoute><BillingSuccessPage /></ProtectedRoute>}
        />


        {/* ── Workspace invite — PUBLIC (no ProtectedRoute wrapping so non-users can see it) ── */}
        {/* After they click Join, it redirects to login if not authenticated */}
        <Route
          path="/workspace-invite/:workspaceId/join/:inviteCode"
          element={<WorkspaceInvitePage />}
        />

      </Routes>
    </Router >
  );
}