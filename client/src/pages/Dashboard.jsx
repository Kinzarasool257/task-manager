import { useState, useEffect, cloneElement, isValidElement, Children } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardMain from "../components/DashboardMain";
import { useAuth } from "@/hooks/useAuth";
import { getUserWorkspaces, syncUserWithDb, createWorkspace, createProject, createTask } from "../lib/api";
import { getProjects, saveProjects } from "../pages/ProjectPage/projectUtils";
 
 
function WorkspaceModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const submit = () => { if (!name.trim()) return alert("Please enter a workspace name."); onCreate(name.trim(), desc.trim()); };
  return (
    <div onClick={e => e.target===e.currentTarget&&onClose()} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ width:"100%",maxWidth:460,background:"var(--surface)",borderRadius:16,padding:40,boxShadow:"0 8px 40px rgba(0,0,0,0.22)",animation:"fadeIn 0.2s ease", border:"1px solid var(--panel-border)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
          <h2 style={{ fontSize:20,fontWeight:800,color:"var(--text-main)",margin:0 }}>Create New Workspace</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p style={{ fontSize:13,color:"var(--text-dim)",margin:"0 0 28px" }}>Set up a new workspace for yourself and your team</p>
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:13,color:"var(--text-muted)",display:"block",marginBottom:6,fontWeight:500 }}>Workspace Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} autoFocus placeholder="My Workspace"
            style={{ width:"100%",border:"1.5px solid var(--text-main)",borderRadius:8,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box",color:"var(--text-main)", background:"var(--surface)" }}/>
        </div>
        <div style={{ marginBottom:28 }}>
          <label style={{ fontSize:13,color:"var(--text-muted)",display:"block",marginBottom:6,fontWeight:500 }}>Description</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="Enter workspace description"
            style={{ width:"100%",border:"1px solid var(--panel-border)",borderRadius:8,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box",resize:"vertical",color:"var(--text-main)", background:"var(--surface)" }}/>
        </div>
        <div style={{ display:"flex",gap:12 }}>
          <button onClick={onClose} style={{ padding:"10px 20px",border:"1px solid var(--panel-border)",borderRadius:8,background:"var(--surface)",fontSize:14,fontWeight:500,cursor:"pointer",color:"var(--text-main)" }}>Cancel</button>
          <button onClick={submit} style={{ flex:1,background:"var(--primary)",color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:600,cursor:"pointer" }}>Create Workspace</button>
        </div>
      </div>
    </div>
  );
}
 
function Toast({ onClose }) {
  return (
    <div style={{ position:"fixed",bottom:24,right:24,zIndex:999,display:"flex",alignItems:"center",gap:10,background:"var(--surface)",border:"1px solid var(--panel-border)",borderRadius:10,padding:"12px 16px",boxShadow:"0 4px 20px rgba(0,0,0,0.12)",animation:"slideUp 0.3s ease" }}>
      <div style={{ width:20,height:20,borderRadius:"50%",background:"#10B981",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <span style={{ fontSize:13,fontWeight:500,color:"var(--text-main)" }}>Your workspace has been created.</span>
      <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",marginLeft:4,padding:0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}
 
export default function Dashboard({ children }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
 
  const [collapsed,       setCollapsed]       = useState(false);
  const [activeNav,       setActiveNav]       = useState("Home");
  const [showModal,       setShowModal]       = useState(false);
  const [showToast,       setShowToast]       = useState(() => new URLSearchParams(window.location.search).get("created")==="true");
  const [projects,        setProjects]        = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
 
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [activeWsId, setActiveWsId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || authLoading) return;
 
      try {
        // Ensure we have the database user ID
        let dbUserId = localStorage.getItem("db_user_id");
        const lastExtId = localStorage.getItem("last_external_id");
 
        // Strict Session Check: Re-sync if ID is missing OR if the Kinde account has changed
        if (!dbUserId || lastExtId !== user.id) {
          console.log("Switching account or fresh login detected. Syncing...");
          const response = await syncUserWithDb(user);
          dbUserId = response.user.id;
          
          localStorage.setItem("db_user_id", dbUserId);
          localStorage.setItem("last_external_id", user.id);
          
          // Prevent showing 'ghost' data from a previous session
          if (lastExtId && lastExtId !== user.id) {
            localStorage.removeItem("activeWsId");
            setWorkspaces([]);
          }
        }
 
        if (dbUserId) {
          const wsList = await getUserWorkspaces(dbUserId);
          setWorkspaces(wsList);
          
          // Set active workspace
          const stored = localStorage.getItem("activeWsId");
          const currentWs = (stored && wsList.find(w => w.id === stored)) ? stored : wsList[0]?.id ?? null;
          setActiveWsId(currentWs);
          
          if (currentWs) {
            localStorage.setItem("activeWsId", currentWs);
          }
 
          // --- SELF-HEALING MIGRATION (Idempotent) ---
          const legacyProjects = getProjects();
          if (legacyProjects.length > 0 && currentWs) {
            // Fetch existing projects to avoid duplicates
            const existingProjects = await getUserWorkspaces(dbUserId).then(async () => {
                // We need to check projects in the current workspace specifically
                const { getWorkspaceProjects } = await import("../lib/api");
                return await getWorkspaceProjects(currentWs);
            });
 
            for (const proj of legacyProjects) {
              const alreadyExists = existingProjects.some(p => p.name === proj.name);
              if (alreadyExists) continue;
 
              try {
                const newProj = await createProject({
                  name: proj.name,
                  description: proj.desc || "",
                  workspaceId: currentWs
                });
                
                if (proj.tasks && proj.tasks.length > 0) {
                  for (const task of proj.tasks) {
                    await createTask({
                      title: task.name,
                      description: task.desc || "",
                      projectId: newProj.id,
                      status: task.status === "TO DO" ? "TODO" : 
                              task.status === "IN PROGRESS" ? "IN_PROGRESS" : 
                              task.status === "COMPLETED" ? "DONE" : task.status
                    });
                  }
                }
              } catch (migrateErr) {
                console.error("Failed to migrate project:", proj.name, migrateErr);
              }
            }
            // Clear legacy data
            saveProjects([]);
            window.location.reload(); 
          }
        }
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };
 
    fetchData();
  }, [isAuthenticated, authLoading, user]);
 
  // --- SYNC ACTIVE PROJECT WITH URL ---
  useEffect(() => {
    const segments = location.pathname.split("/");
    const projectIdx = segments.indexOf("project");
    if (projectIdx !== -1 && segments[projectIdx + 1]) {
      setActiveProjectId(segments[projectIdx + 1]);
      setActiveNav(null); 
    } else if (location.pathname === "/dashboard") {
      setActiveProjectId(null);
      setActiveNav("Home");
    } else {
      setActiveProjectId(null);
      setActiveNav(null); 
    }
    setIsMobileMenuOpen(false); // Close menu on navigation
  }, [location.pathname]);
 
  const handleCreate = async (name) => {
    try {
      const dbUserId = localStorage.getItem("db_user_id");
      if (!dbUserId) throw new Error("User ID not found. Please re-login.");
 
      const response = await createWorkspace(name, dbUserId);
      const newWs = response.workspace || response; // Handle different API response shapes
 
      setWorkspaces(prev => [...prev, newWs]);
      setActiveWsId(newWs.id);
      localStorage.setItem("activeWsId", newWs.id);
      
      setShowModal(false); 
      setShowToast(true);
    } catch (err) {
      console.error("Workspace creation failed:", err);
      alert("Failed to create workspace. Please try again.");
    }
  };
 
  useEffect(() => {
    if (showToast) {
      window.history.replaceState({}, "", "/dashboard");
      const t = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showToast]);
 
  if (isLoadingWorkspaces || authLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-alt)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "4px solid var(--panel-border)", borderTop: "4px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 500 }}>Loading Dashboard...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
 
  return (
    <div className="flex h-screen font-sans bg-slate-50 overflow-hidden relative">
      <Sidebar
        collapsed={collapsed}             setCollapsed={setCollapsed}
        activeNav={activeNav}             setActiveNav={setActiveNav}
        workspaces={workspaces}           setWorkspaces={setWorkspaces}
        activeWsId={activeWsId}           setActiveWsId={setActiveWsId}
        setShowModal={setShowModal}
        projects={projects}               setProjects={setProjects}
        activeProjectId={activeProjectId} setActiveProjectId={setActiveProjectId}
        dbUserId={localStorage.getItem("db_user_id")}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
 
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Top-bar */}
        <header className="flex md:hidden items-center justify-between h-14 px-4 bg-white border-b border-slate-200 shrink-0 z-40">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
              <div className="flex items-center gap-1.5 pt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--primary)" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary)" strokeWidth="2" />
                </svg>
                <span className="font-bold text-sm text-slate-900">DailyTM</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {user?.given_name?.charAt(0) || "U"}
              </div>
           </div>
        </header>
        {children ? Children.map(children, child => {
          if (isValidElement(child)) {
            const activeWorkspace = workspaces.find(w => w.id === activeWsId);
            return cloneElement(child, { 
              workspace: activeWorkspace,
              user: user,
              projects: projects,
              dbUserId: localStorage.getItem("db_user_id"),
 
              onWorkspaceUpdate: (updated) => {
                setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
              },
              onDeleteWorkspace: (id) => {
                setWorkspaces(prev => prev.filter(w => w.id !== id));
                if (activeWsId === id) {
                  const nextWs = workspaces.find(w => w.id !== id) || workspaces[0];
                  setActiveWsId(nextWs?.id || null);
                  localStorage.setItem("activeWsId", nextWs?.id || "");
                  navigate("/dashboard");
                }
              }
            });
          }
          return child;
        }) : (
          <div className="flex-1 overflow-auto">
            <DashboardMain 
              projects={projects} 
              workspace={workspaces.find(w => w.id === activeWsId)} 
              onProjectClick={(pid) => { setActiveProjectId(pid); navigate(`/dashboard/project/${pid}`); }}
            />
          </div>
        )}
      </main>
 
      {showModal && <WorkspaceModal onClose={() => setShowModal(false)} onCreate={handleCreate}/>}
      {showToast && <Toast onClose={() => setShowToast(false)}/>}
 
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:scale(0.97)}      to{opacity:1;transform:scale(1)} }
        *{box-sizing:border-box} button:hover{opacity:0.85}
      `}</style>
    </div>
  );
}