import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Folder, Users, Settings, LogOut, PanelLeftClose, PanelLeft, Home, Bell, CheckSquare } from "lucide-react";
import { getUserWorkspaces, getWorkspaceProjects, createProject } from "../lib/api";
import ProfileDropdown from "./profile";

// ── Logo ──────────────────────────────────────────────────────────────────────
const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--primary)" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Home", route: "/dashboard", d: ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"] },
  { label: "My Tasks", route: "/dashboard/my-tasks", d: ["M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", "M9 12l2 2 4-4"] },
  { label: "Members", route: "/dashboard/members", d: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"], cx: 9, cy: 7, r: 4 },
  { label: "Settings", route: "/dashboard/settings", d: ["M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"], cx2: 12, cy2: 12, r2: 3 },
];

// ── Create Project Modal ──────────────────────────────────────────────────────
function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const submit = () => {
    if (!name.trim()) return alert("Please enter a project name.");
    onCreate({ name: name.trim(), desc: desc.trim() });
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div style={{ width: "100%", maxWidth: 480, background: "var(--surface)", borderRadius: 14, padding: "32px 36px", boxShadow: "0 12px 48px rgba(0,0,0,0.22)", animation: "fadeIn 0.2s ease", border: "1px solid var(--panel-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>Create New Project</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, color: "var(--text-dim)", display: "block", marginBottom: 7 }}>Project Name</label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            autoFocus placeholder="e.g. Website Redesign"
            style={{ width: "100%", background: "var(--surface-alt)", border: "1.5px solid var(--panel-border)", borderRadius: 8, padding: "11px 14px", fontSize: 14, color: "var(--text-main)", boxSizing: "border-box", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--primary)"}
            onBlur={e => e.target.style.borderColor = "var(--panel-border)"}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 13, color: "var(--text-dim)", display: "block", marginBottom: 7 }}>Description</label>
          <textarea
            value={desc} onChange={e => setDesc(e.target.value)}
            rows={3} placeholder="What is this project about?"
            style={{ width: "100%", background: "var(--surface-alt)", border: "1.5px solid var(--panel-border)", borderRadius: 8, padding: "11px 14px", fontSize: 14, color: "var(--text-main)", boxSizing: "border-box", resize: "none", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--primary)"}
            onBlur={e => e.target.style.borderColor = "var(--panel-border)"}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", border: "1px solid var(--panel-border)", borderRadius: 8, background: "transparent", fontSize: 13, color: "var(--text-dim)", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={submit} style={{ flex: 1, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
export default function Sidebar({
  collapsed, setCollapsed,
  activeNav, setActiveNav,
  workspaces, setWorkspaces,
  activeWsId, setActiveWsId,
  setShowModal,
  projects, setProjects,
  activeProjectId, setActiveProjectId,
  dbUserId,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef = useRef(null);

  const [showWsDrop, setShowWsDrop] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // ── Fetch workspaces on load ──────────────────────────────────────────────
  useEffect(() => {
    const fetchWorkspaces = async () => {
      const idToUse = dbUserId || localStorage.getItem("db_user_id");
      if (!idToUse) return;
      try {
        const data = await getUserWorkspaces(idToUse);
        setWorkspaces(data);
        if (data.length > 0 && !activeWsId) setActiveWsId(data[0].id);
      } catch (err) {
        console.error("Sidebar fetchWorkspaces error:", err);
      }
    };
    fetchWorkspaces();
  }, [dbUserId, setWorkspaces, setActiveWsId, activeWsId]);

  // ── Fetch projects whenever workspace changes ──────────────────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      if (!activeWsId) return;
      try {
        const data = await getWorkspaceProjects(activeWsId);
        setProjects(data);
      } catch (err) {
        console.error("Sidebar fetchProjects error:", err);
      }
    };
    fetchProjects();
  }, [activeWsId, setProjects]);

  // ── Close workspace dropdown on outside click ─────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowWsDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const activeWs = workspaces.find(w => w.id === activeWsId) || workspaces[0];
  const wsName = activeWs?.name || "My Workspace";
  const wsInitial = wsName.charAt(0).toUpperCase();

  const SW = collapsed ? 60 : 200;

  // ── Active nav detection ──────────────────────────────────────────────────
  const isNavActive = (item) => {
    if (item.label === "Settings") return location.pathname === "/dashboard/settings";
    if (item.label === "Members") return location.pathname === "/dashboard/members";
    if (item.label === "My Tasks") return location.pathname === "/dashboard/my-tasks";
    return (
      activeNav === item.label &&
      !activeProjectId &&
      location.pathname !== "/dashboard/settings" &&
      location.pathname !== "/dashboard/members" &&
      location.pathname !== "/dashboard/my-tasks"
    );
  };

  const handleNavClick = (item) => {
    setActiveNav(item.label);
    setActiveProjectId(null);
    navigate(item.route);
  };

  const switchWs = (ws) => {
    setActiveWsId(ws.id);
    localStorage.setItem("activeWsId", ws.id);
    setShowWsDrop(false);
    navigate("/dashboard");
  };

  const handleCreateProject = async (pdata) => {
    try {
      if (!activeWsId) return alert("Select a workspace first.");
      const newProj = await createProject({
        name: pdata.name,
        description: pdata.desc,
        workspaceId: activeWsId
      });
      setProjects(prev => [...prev, newProj]);
      setShowProjectModal(false);
      setActiveProjectId(newProj.id);
      navigate(`/dashboard/project/${newProj.id}`);
    } catch (err) {
      console.error("Project creation failed:", err);
      alert("Project creation failed.");
    }
  };

  const uniqueProjects = Array.from(new Set(projects.map(p => p.id)))
    .map(id => projects.find(p => p.id === id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      {/* Backdrop for Mobile */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[55] md:hidden transition-opacity cursor-pointer"
          style={{ animation: "fadeIn 0.2s ease" }}
        />
      )}

      <aside 
        className={`
          flex flex-col flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-[60] overflow-hidden
          fixed inset-y-0 left-0 md:relative
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ width: SW }}
      >
        {/* Mobile Close Button */}
        <div className="md:hidden absolute top-3 right-3">
           <button 
             onClick={() => setIsMobileMenuOpen(false)}
             className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400"
           >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
           </button>
        </div>

        {/* ── Brand + collapse toggle ── */}
        <div style={{ padding: "14px 12px 12px", borderBottom: "1px solid var(--panel-border)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", minHeight: 52 }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Logo />
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-main)" }}>
                Daily<span style={{ color: "var(--primary)" }}>TM</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{ width: 28, height: 28, borderRadius: 7, background: "var(--surface-alt)", border: "1px solid var(--panel-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            {collapsed
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" /><line x1="9" y1="3" x2="9" y2="21" /><path d="M15 9l-3 3 3 3" /></svg>
            }
          </button>
        </div>

        {/* ── Workspace dropdown ── */}
        <div style={{ padding: collapsed ? "10px 0 8px" : "12px 12px 8px" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 8px 4px" }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Workspace</p>
              <button
                onClick={() => { setShowModal(true); setShowWsDrop(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-muted)" }}
                title="New Workspace"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>
          )}
          <div ref={dropRef} style={{ position: "relative", width: "100%" }}>
            {/* Trigger */}
            <div
              onClick={() => setShowWsDrop(v => !v)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", borderRadius: 8, background: "var(--surface-alt)", border: `1px solid ${showWsDrop ? "var(--primary)" : "var(--panel-border)"}`, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {wsInitial}
                </div>
                {!collapsed && <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 90 }}>{wsName}</span>}
              </div>
              {!collapsed && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ transform: showWsDrop ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </div>

            {/* Dropdown list */}
            {showWsDrop && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200, overflow: "hidden" }}>
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => switchWs(ws)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", border: "none", cursor: "pointer", background: ws.id === activeWsId ? "var(--nav-active-bg)" : "var(--surface)", textAlign: "left" }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: ws.id === activeWsId ? "var(--primary)" : "var(--panel-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ws.id === activeWsId ? "#fff" : "var(--text-muted)", flexShrink: 0 }}>
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: ws.id === activeWsId ? 600 : 500, color: ws.id === activeWsId ? "var(--nav-active-text)" : "var(--text-main)" }}>{ws.name}</span>
                    {ws.id === activeWsId && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" style={{ marginLeft: "auto" }}><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </button>
                ))}
                <div style={{ borderTop: "1px solid var(--panel-border)" }}>
                  <button
                    onClick={() => { setShowModal(true); setShowWsDrop(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 12px", border: "none", cursor: "pointer", background: "var(--surface)", color: "var(--primary)", fontSize: 12, fontWeight: 600 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    New Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Nav items ── */}
        <div style={{ padding: collapsed ? "8px 0 4px" : "8px 10px 4px" }}>
          {!collapsed && <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 6px 4px" }}>Menu</p>}
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item);
            const clr = active ? "var(--nav-active-text)" : "var(--text-dim)";
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                title={collapsed ? item.label : ""}
                style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, width: "100%", padding: collapsed ? "10px 0" : "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: active ? "var(--nav-active-bg)" : "transparent", color: clr, fontSize: 13, fontWeight: active ? 600 : 500, justifyContent: collapsed ? "center" : "flex-start", transition: "all 0.15s" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={clr} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {[].concat(item.d).map((p, i) => <path key={i} d={p} />)}
                  {item.cx && <circle cx={item.cx} cy={item.cy} r={item.r} />}
                  {item.cx2 && <circle cx={item.cx2} cy={item.cy2} r={item.r2} />}
                </svg>
                {!collapsed && <span style={{ whiteSpace:"nowrap" }}>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Projects list ── */}
        <div style={{ padding: collapsed ? "12px 0 4px" : "12px 10px 4px", flex: 1, overflowY: "auto" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Projects</p>
              <button
                onClick={() => setShowProjectModal(true)}
                title="New Project"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>
          )}

          {uniqueProjects.length === 0
            ? !collapsed && <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "4px", margin: 0 }}>No projects yet</p>
            : uniqueProjects.map(p => {
              const isActive = activeProjectId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { setActiveProjectId(p.id); navigate(`/dashboard/project/${p.id}`); }}
                  title={collapsed ? p.name : ""}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: isActive ? "var(--nav-active-bg)" : "transparent", marginBottom: 2, textAlign: "left", justifyContent: collapsed ? "center" : "flex-start" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--surface-alt)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: isActive ? "var(--primary)" : "var(--text-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {p.name?.charAt(0).toUpperCase()}
                  </div>
                  {!collapsed && (
                    <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: isActive ? "var(--nav-active-text)" : "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </span>
                  )}
                </button>
              );
            })
          }
        </div>

        {/* ── User footer ── */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--panel-border)" }}>
          <ProfileDropdown
            onNavigate={(page) => {
              if (page === "profile") navigate("/profile");
              if (page === "billing") navigate("/billing");
              if (page === "notifications") navigate("/dashboard/notifications");
              if (page === "upgrade") navigate("/upgrade");
            }}
          />
        </div>
      </aside>

      {/* Project Modal */}
      {showProjectModal && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        aside button { transition: all 0.2s; }
      `}</style>
    </>
  );
}