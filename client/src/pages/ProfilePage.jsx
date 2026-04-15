import { useState, useEffect } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { getUserWorkspaces, getWorkspaceProjects, getUserById, updateUserPreferences } from "../lib/api";

export default function ProfilePage() {
  const { user } = useKindeAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [dbUser, setDbUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dbUserId = localStorage.getItem("db_user_id");
  const userName = user ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim() : "User";
  const userInitials = user ? `${user.given_name?.charAt(0) ?? ""}${user.family_name?.charAt(0) ?? ""}`.toUpperCase() : "U";

  useEffect(() => {
    async function fetchData() {
      if (!dbUserId) return;
      try {
        const [wsData, userData] = await Promise.all([
          getUserWorkspaces(dbUserId),
          getUserById(dbUserId)
        ]);
        setWorkspaces(wsData);
        setDbUser(userData);

        // Aggregate stats across all projects in all workspaces
        let total = 0;
        let completed = 0;

        for (const ws of wsData) {
          const projects = await getWorkspaceProjects(ws.id);
          projects.forEach(p => {
            (p.tasks || []).forEach(t => {
              if (t.assignee === userName) {
                total++;
                if (["DONE", "COMPLETED"].includes(t.status)) completed++;
              }
            });
          });
        }
        setTaskStats({ total, completed });
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dbUserId, userName]);

  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8">
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {userInitials}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{userName}</h1>
              <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
                 <p className="text-sm text-slate-500">{user?.email}</p>
                 <span className="hidden sm:block text-slate-200">•</span>
                 <p className="text-sm text-slate-400 font-medium">
                    {dbUser?.preferences?.role || "Member"} at {dbUser?.preferences?.industry || "DailyTM"}
                 </p>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ring-indigo-500/10">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                   <span>Active Member</span>
                </div>
                <button 
                  onClick={() => setShowEdit(true)}
                  className="bg-white border border-slate-200 rounded-lg h-9 px-4 text-xs font-bold text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-all cursor-pointer shadow-sm"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatBox label="Workspaces" value={workspaces.length} icon="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          <StatBox label="Assigned Tasks" value={taskStats.total} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <StatBox label="Completed" value={taskStats.completed} icon="M9 12l2 2 4-4" />
        </div>

        {dbUser?.preferences?.bio && (
          <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--panel-border)", padding: "24px", marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Bio</h2>
            <p style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.6, margin: 0 }}>{dbUser.preferences.bio}</p>
          </div>
        )}

        {/* Workspaces Section */}
        <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--panel-border)", padding: "24px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>Your Workspaces</h2>
          {loading ? (
            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Loading workspace info...</p>
          ) : workspaces.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-dim)" }}>No workspaces found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {workspaces.map(ws => (
                <div key={ws.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, background: "var(--surface-alt)", border: "1px solid var(--panel-border)" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                     <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                       {ws.name.charAt(0).toUpperCase()}
                     </div>
                     <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>{ws.name}</span>
                   </div>
                   <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                     Plan: <span style={{ color: "var(--primary)", fontWeight: 700 }}>{ws.plan || "FREE"}</span>
                   </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {showEdit && (
        <EditProfileModal 
          user={dbUser} 
          onClose={() => setShowEdit(false)} 
          onSave={async (prefs) => {
            setIsSaving(true);
            try {
              const updated = await updateUserPreferences(dbUserId, prefs);
              setDbUser(updated);
              setShowEdit(false);
            } catch {
              alert("Failed to update profile.");
            } finally {
              setIsSaving(false);
            }
          }}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

function EditProfileModal({ user, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    role: user?.preferences?.role || "",
    industry: user?.preferences?.industry || "",
    country: user?.preferences?.country || "",
    bio: user?.preferences?.bio || "",
  });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--overlay-bg)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440, background: "var(--surface)", borderRadius: 16, padding: "28px 32px", boxShadow: "0 12px 48px rgba(0,0,0,0.2)", border: "1px solid var(--panel-border)", animation: "fadeIn 0.2s ease" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)", margin: "0 0 20px" }}>Edit Profile</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={lbl}>Role</label>
            <input name="role" value={form.role} onChange={handle} style={inp} placeholder="e.g. Designer"/>
          </div>
          <div>
            <label style={lbl}>Industry</label>
            <input name="industry" value={form.industry} onChange={handle} style={inp} placeholder="e.g. Tech"/>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Country</label>
          <input name="country" value={form.country} onChange={handle} style={inp} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>Short Bio</label>
          <textarea name="bio" value={form.bio} onChange={handle} rows={3} style={{ ...inp, resize: "vertical" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", background: "none", border: "1px solid var(--panel-border)", borderRadius: 8, fontSize: 13, color: "var(--text-main)", cursor: "pointer" }}>Cancel</button>
          <button 
            onClick={() => onSave(form)} 
            disabled={isSaving}
            style={{ padding: "10px 24px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const lbl = { fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };
const inp = { width: "100%", background: "var(--surface-alt)", border: "1.5px solid var(--panel-border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--text-main)", outline: "none" };

function StatBox({ label, value, icon }) {
  return (
    <div style={{ background: "var(--surface)", padding: "20px", borderRadius: 16, border: "1px solid var(--panel-border)", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--nav-active-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nav-active-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon}/>
        </svg>
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: "0 0 4px" }}>{value}</p>
      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}
