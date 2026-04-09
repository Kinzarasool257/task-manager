import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardMain from "../components/DashboardMain";
 
const getWS       = () => { try { return JSON.parse(localStorage.getItem("workspaces") || "[]"); } catch { return []; } };
const saveWS      = (l) => localStorage.setItem("workspaces", JSON.stringify(l));
const getProjects = () => { try { return JSON.parse(localStorage.getItem("projects") || "[]"); } catch { return []; } };
 
function WorkspaceModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const submit = () => { if (!name.trim()) return alert("Please enter a workspace name."); onCreate(name.trim(), desc.trim()); };
  return (
    <div onClick={e => e.target===e.currentTarget&&onClose()} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
      <div style={{ width:"100%",maxWidth:460,background:"#fff",borderRadius:16,padding:40,boxShadow:"0 8px 40px rgba(0,0,0,0.15)",animation:"fadeIn 0.2s ease" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
          <h2 style={{ fontSize:20,fontWeight:800,color:"#111",margin:0 }}>Create New Workspace</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#9ca3af" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p style={{ fontSize:13,color:"#9ca3af",margin:"0 0 28px" }}>Set up a new workspace for yourself and your team</p>
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:13,color:"#374151",display:"block",marginBottom:6,fontWeight:500 }}>Workspace Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} autoFocus placeholder="My Workspace"
            style={{ width:"100%",border:"2px solid #111",borderRadius:8,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box",color:"#111" }}/>
        </div>
        <div style={{ marginBottom:28 }}>
          <label style={{ fontSize:13,color:"#374151",display:"block",marginBottom:6,fontWeight:500 }}>Description</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="Enter workspace description"
            style={{ width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"10px 14px",fontSize:14,outline:"none",boxSizing:"border-box",resize:"vertical",color:"#111" }}/>
        </div>
        <div style={{ display:"flex",gap:12 }}>
          <button onClick={onClose} style={{ padding:"10px 20px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",color:"#374151" }}>Cancel</button>
          <button onClick={submit} style={{ flex:1,background:"#111827",color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:600,cursor:"pointer" }}>Create Workspace</button>
        </div>
      </div>
    </div>
  );
}
 
function Toast({ onClose }) {
  return (
    <div style={{ position:"fixed",bottom:24,right:24,zIndex:999,display:"flex",alignItems:"center",gap:10,background:"#fff",border:"1px solid #f0f0f0",borderRadius:10,padding:"12px 16px",boxShadow:"0 4px 20px rgba(0,0,0,0.12)",animation:"slideUp 0.3s ease" }}>
      <div style={{ width:20,height:20,borderRadius:"50%",background:"#10B981",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <span style={{ fontSize:13,fontWeight:500,color:"#111" }}>Your workspace has been created.</span>
      <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#9ca3af",marginLeft:4,padding:0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}
 
export default function Dashboard({ children }) {
  const [collapsed,       setCollapsed]       = useState(false);
  const [activeNav,       setActiveNav]       = useState("Home");
  const [showModal,       setShowModal]       = useState(false);
  const [showToast,       setShowToast]       = useState(() => new URLSearchParams(window.location.search).get("created")==="true");
  const [projects,        setProjects]        = useState(() => getProjects());
  const [activeProjectId, setActiveProjectId] = useState(null);
 
  const [workspaces, setWorkspaces] = useState(() => {
    const list = getWS();
    if (!list.length) { const name = localStorage.getItem("workspaceName"); if (name) { const s=[{id:Date.now(),name,desc:""}]; saveWS(s); return s; } }
    return list;
  });
 
  const [activeWsId, setActiveWsId] = useState(() => {
    const stored = Number(localStorage.getItem("activeWsId"));
    const list = getWS();
    return (stored && list.find(w=>w.id===stored)) ? stored : list[0]?.id ?? null;
  });
 
  const handleCreate = (name, desc) => {
    const nw = { id:Date.now(), name, desc };
    const updated = [...workspaces, nw];
    setWorkspaces(updated); saveWS(updated);
    setActiveWsId(nw.id);
    localStorage.setItem("activeWsId", String(nw.id));
    localStorage.setItem("workspaceName", name);
    setShowModal(false); setShowToast(true);
  };
 
  useEffect(() => {
    if (showToast) {
      window.history.replaceState({}, "", "/dashboard");
      const t = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showToast]);
 
  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Inter',sans-serif", background:"#f9fafb", overflow:"hidden" }}>
      <Sidebar
        collapsed={collapsed}             setCollapsed={setCollapsed}
        activeNav={activeNav}             setActiveNav={setActiveNav}
        workspaces={workspaces}           setWorkspaces={setWorkspaces}
        activeWsId={activeWsId}           setActiveWsId={setActiveWsId}
        setShowModal={setShowModal}
        projects={projects}               setProjects={setProjects}
        activeProjectId={activeProjectId} setActiveProjectId={setActiveProjectId}
      />
 
      {children || <DashboardMain/>}
 
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