import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
 
// ── Storage helpers ───────────────────────────────────────────────────────────
const getWS  = () => { try { return JSON.parse(localStorage.getItem("workspaces") || "[]"); } catch { return []; } };
const saveWS = (l) => localStorage.setItem("workspaces", JSON.stringify(l));
const getProjects  = () => { try { return JSON.parse(localStorage.getItem("projects") || "[]"); } catch { return []; } };
const saveProjects = (l) => localStorage.setItem("projects", JSON.stringify(l));
 
// ── Logo ──────────────────────────────────────────────────────────────────────
const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4F46E5"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
 
// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label:"Home",     d:["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"] },
  { label:"My Tasks", d:["M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2","M9 12l2 2 4-4"] },
  { label:"Members",  d:["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75"], cx:9, cy:7, r:4 },
  { label:"Settings", d:["M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"], cx2:12, cy2:12, r2:3 },
];
 
// ── Create Project Modal ──────────────────────────────────────────────────────
function CreateProjectModal({ onClose, onCreate, wsName, userName }) {
  const [name, setName]     = useState("");
  const [desc, setDesc]     = useState("");
  const [access, setAccess] = useState(true);
 
  const submit = () => {
    if (!name.trim()) return alert("Please enter a project name.");
    onCreate({ name: name.trim(), desc: desc.trim(), access });
  };
 
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
    >
      <div style={{ width:"100%", maxWidth:480, background:"#1e1e2e", borderRadius:14, padding:"32px 36px", boxShadow:"0 12px 48px rgba(0,0,0,0.4)", animation:"fadeIn 0.2s ease" }}>
 
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:"#fff", margin:0 }}>Create New Project</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
 
        {/* Workspace Name */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:13, color:"#d1d5db", display:"block", marginBottom:7, fontWeight:500 }}>Workspace Name</label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            autoFocus placeholder={wsName || "Project name"}
            style={{ width:"100%", background:"#111827", border:"1.5px solid #374151", borderRadius:8, padding:"11px 14px", fontSize:14, outline:"none", color:"#fff", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor="#4F46E5"}
            onBlur={e => e.target.style.borderColor="#374151"}
          />
        </div>
 
        {/* Description */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:13, color:"#d1d5db", display:"block", marginBottom:7, fontWeight:500 }}>Description</label>
          <textarea
            value={desc} onChange={e => setDesc(e.target.value)}
            rows={3} placeholder="Enter workspace description"
            style={{ width:"100%", background:"#111827", border:"1.5px solid #374151", borderRadius:8, padding:"11px 14px", fontSize:14, outline:"none", color:"#fff", boxSizing:"border-box", resize:"vertical" }}
            onFocus={e => e.target.style.borderColor="#4F46E5"}
            onBlur={e => e.target.style.borderColor="#374151"}
          />
        </div>
 
        {/* Project Access */}
        <div style={{ marginBottom:28 }}>
          <label style={{ fontSize:13, color:"#d1d5db", display:"block", marginBottom:4, fontWeight:500 }}>Project Access</label>
          <p style={{ fontSize:12, color:"#6b7280", margin:"0 0 10px" }}>Select which workspace members should have access to this project</p>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
            <input
              type="checkbox" checked={access} onChange={e => setAccess(e.target.checked)}
              style={{ width:15, height:15, accentColor:"#4F46E5" }}
            />
            <span style={{ fontSize:13, color:"#d1d5db" }}>{userName || "You"} (Owner)</span>
          </label>
        </div>
 
        {/* Buttons */}
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onClose} style={{ padding:"10px 20px", border:"1px solid #374151", borderRadius:8, background:"transparent", fontSize:13, fontWeight:500, cursor:"pointer", color:"#d1d5db" }}>
            Cancel
          </button>
          <button onClick={submit} style={{ flex:1, background:"#111827", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
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
}) {
  const { user, logout } = useKindeAuth();
  const navigate = useNavigate();
  const dropRef = useRef(null);
 
  const [showUserMenu,    setShowUserMenu]    = useState(false);
  const [showWsDrop,      setShowWsDrop]      = useState(false);
  const [showProjectModal,setShowProjectModal] = useState(false);
 
  const activeWs     = workspaces.find(w => w.id === activeWsId) || workspaces[0];
  const wsName       = activeWs?.name || "My Workspace";
  const wsInitial    = wsName.charAt(0).toUpperCase();
  const userInitials = user ? `${user.given_name?.charAt(0) ?? ""}${user.family_name?.charAt(0) ?? ""}`.toUpperCase() : "U";
  const userEmail    = user?.email ?? "";
  const userName     = user ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim() : "User";
 
  const switchWs = (ws) => {
    setActiveWsId(ws.id);
    localStorage.setItem("activeWsId", String(ws.id));
    localStorage.setItem("workspaceName", ws.name);
    setShowWsDrop(false);
  };
 
  const handleCreateProject = ({ name, desc, access }) => {
    const np = {
      id: Date.now(),
      name,
      desc,
      wsId: activeWsId,
      createdBy: userName,
      createdAt: new Date().toISOString(),
      members: [{ name: userName, initials: userInitials, role: "Owner" }],
    };
    const updated = [...projects, np];
    setProjects(updated);
    saveProjects(updated);
    setActiveProjectId(np.id);
    setShowProjectModal(false);
    navigate(`/dashboard/project/${np.id}`);
  };
 
  const wsProjects = projects.filter(p => p.wsId === activeWsId);
  const SW = collapsed ? 60 : 200;
 
  return (
    <>
      <aside style={{ width:SW, background:"#fff", borderRight:"1px solid #f0f0f0", display:"flex", flexDirection:"column", flexShrink:0, padding:"0 0 16px", transition:"width 0.22s ease", overflow:"hidden" }}>
 
        {/* Brand + toggle */}
        <div style={{ padding:"14px 12px 12px", borderBottom:"1px solid #f5f5f5", display:"flex", alignItems:"center", justifyContent:collapsed?"center":"space-between", minHeight:52 }}>
          {!collapsed && (
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Logo/>
              <span style={{ fontWeight:700, fontSize:14, color:"#111", whiteSpace:"nowrap" }}>Daily<span style={{ color:"#4F46E5" }}>TM</span></span>
            </div>
          )}
          <button onClick={() => setCollapsed(v => !v)} title={collapsed?"Expand":"Collapse"}
            style={{ width:28, height:28, borderRadius:7, background:"#f3f4f6", border:"1px solid #e5e7eb", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {collapsed
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" fill="none"/><line x1="9" y1="3" x2="9" y2="21"/><path d="M15 9l-3 3 3 3"/></svg>
            }
          </button>
        </div>
 
        {/* Workspace */}
        <div style={{ padding:collapsed?"10px 0 8px":"12px 12px 8px", display:"flex", flexDirection:"column", alignItems:collapsed?"center":"stretch" }}>
          {!collapsed && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"0 0 8px 4px" }}>
              <p style={{ fontSize:10, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:1, margin:0 }}>Workspace</p>
              <button onClick={() => { setShowModal(true); setShowWsDrop(false); }} style={{ background:"none", border:"none", cursor:"pointer", padding:2, color:"#9ca3af" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          )}
          <div ref={dropRef} style={{ position:"relative", width:"100%" }}>
            {collapsed
              ? <div onClick={() => setShowWsDrop(v=>!v)} title={wsName} style={{ width:32, height:32, borderRadius:8, background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", margin:"0 auto" }}>{wsInitial}</div>
              : (
                <div onClick={() => setShowWsDrop(v=>!v)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", borderRadius:8, background:"#f9fafb", border:`1px solid ${showWsDrop?"#4F46E5":"#f0f0f0"}`, cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:24, height:24, borderRadius:6, background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>{wsInitial}</div>
                    <span style={{ fontSize:12, fontWeight:600, color:"#111", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:80 }}>{wsName}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ transform:showWsDrop?"rotate(180deg)":"none", transition:"transform 0.2s", flexShrink:0 }}><path d="M6 9l6 6 6-6"/></svg>
                </div>
              )
            }
            {showWsDrop && (
              <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:collapsed?undefined:0, minWidth:160, background:"#fff", border:"1px solid #f0f0f0", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,0.1)", zIndex:200, overflow:"hidden" }}>
                {workspaces.map(ws => (
                  <button key={ws.id} onClick={() => switchWs(ws)} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 12px", border:"none", cursor:"pointer", background:ws.id===activeWsId?"#EEF2FF":"#fff" }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:ws.id===activeWsId?"#4F46E5":"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:ws.id===activeWsId?"#fff":"#6b7280", flexShrink:0 }}>{ws.name.charAt(0).toUpperCase()}</div>
                    <span style={{ fontSize:12, fontWeight:ws.id===activeWsId?600:500, color:ws.id===activeWsId?"#4F46E5":"#111", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textAlign:"left" }}>{ws.name}</span>
                    {ws.id===activeWsId && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                ))}
                <div style={{ borderTop:"1px solid #f5f5f5" }}>
                  <button onClick={() => { setShowModal(true); setShowWsDrop(false); }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 12px", border:"none", cursor:"pointer", background:"#fff", color:"#4F46E5", fontSize:12, fontWeight:600 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
 
        {/* Nav */}
        <div style={{ padding:collapsed?"8px 0 4px":"8px 10px 4px" }}>
          {!collapsed && <p style={{ fontSize:10, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:1, margin:"0 0 6px 4px" }}>Menu</p>}
          {NAV_ITEMS.map(({ label, d, cx, cy, r, cx2, cy2, r2 }) => {
            const active = activeNav===label;
            const clr = active?"#4F46E5":"#6b7280";
            return (
              <button key={label} onClick={() => { setActiveNav(label); navigate("/dashboard"); }} title={collapsed?label:""}
                style={{ display:"flex", alignItems:"center", gap:collapsed?0:10, width:"100%", padding:collapsed?"10px 0":"8px 12px", borderRadius:8, border:"none", cursor:"pointer", background:active?"#EEF2FF":"transparent", color:clr, fontSize:13, fontWeight:active?600:500, justifyContent:collapsed?"center":"flex-start", transition:"all 0.15s" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={clr} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {[].concat(d).map((p,i)=><path key={i} d={p}/>)}
                  {cx  && <circle cx={cx}  cy={cy}  r={r}/>}
                  {cx2 && <circle cx={cx2} cy={cy2} r={r2}/>}
                </svg>
                {!collapsed && label}
              </button>
            );
          })}
        </div>
 
        {/* ── PROJECTS section ── */}
        <div style={{ padding:collapsed?"12px 0 4px":"12px 10px 4px", display:"flex", flexDirection:"column", alignItems:collapsed?"center":"stretch", flex:1 }}>
          {collapsed
            ? <button title="Projects" onClick={() => setShowProjectModal(true)} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", padding:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </button>
            : <>
                {/* Projects header row with + button */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"0 0 6px 4px" }}>
                  <p style={{ fontSize:10, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:1, margin:0 }}>Projects</p>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    title="New Project"
                    style={{ background:"none", border:"none", cursor:"pointer", padding:2, color:"#9ca3af", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:4, transition:"color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#4F46E5"}
                    onMouseLeave={e => e.currentTarget.style.color="#9ca3af"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
 
                {/* Project list */}
                {wsProjects.length === 0
                  ? <p style={{ fontSize:12, color:"#c4c4c4", padding:"4px 4px", margin:0 }}>No projects yet</p>
                  : wsProjects.map(p => {
                      const isActive = activeProjectId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => { setActiveProjectId(p.id); navigate(`/dashboard/project/${p.id}`); }}
                          style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"7px 10px", borderRadius:7, border:"none", cursor:"pointer", background:isActive?"#EEF2FF":"transparent", marginBottom:2, textAlign:"left" }}
                          onMouseEnter={e => { if(!isActive) e.currentTarget.style.background="#f9fafb"; }}
                          onMouseLeave={e => { if(!isActive) e.currentTarget.style.background="transparent"; }}
                        >
                          <div style={{ width:18, height:18, borderRadius:4, background:isActive?"#4F46E5":"#6b7280", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff", flexShrink:0 }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize:12, fontWeight:isActive?600:500, color:isActive?"#4F46E5":"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {p.name}
                          </span>
                        </button>
                      );
                    })
                }
              </>
          }
        </div>
 
        {/* User */}
        <div style={{ padding:collapsed?"8px 0 0":"12px 12px 0", borderTop:"1px solid #f5f5f5", position:"relative", display:"flex", justifyContent:collapsed?"center":"stretch" }}>
          <button onClick={() => setShowUserMenu(v=>!v)} style={{ display:"flex", alignItems:"center", gap:collapsed?0:8, background:"none", border:"none", cursor:"pointer", padding:collapsed?"6px 0":"6px 4px", borderRadius:8, width:collapsed?"auto":"100%", justifyContent:collapsed?"center":"flex-start" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>{userInitials}</div>
            {!collapsed && <>
              <div style={{ textAlign:"left", overflow:"hidden", flex:1 }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#111", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{userName}</p>
                <p style={{ fontSize:10, color:"#9ca3af", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{userEmail}</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/></svg>
            </>}
          </button>
          {showUserMenu && (
            <div style={{ position:"absolute", bottom:"100%", left:collapsed?4:8, right:collapsed?4:8, background:"#fff", border:"1px solid #f0f0f0", borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,0.1)", padding:6, zIndex:100 }}>
              <button onClick={() => { logout(); navigate("/"); }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 10px", borderRadius:7, border:"none", background:"none", cursor:"pointer", fontSize:13, color:"#EF4444", fontWeight:500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
 
      {/* Create Project Modal */}
      {showProjectModal && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onCreate={handleCreateProject}
          wsName={wsName}
          userName={userName}
        />
      )}
    </>
  );
}