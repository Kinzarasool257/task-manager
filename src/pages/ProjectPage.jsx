import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
 
// ── Storage helpers ───────────────────────────────────────────────────────────
const getProjects  = () => { try { return JSON.parse(localStorage.getItem("projects")  || "[]"); } catch { return []; } };
const saveProjects = (l) => localStorage.setItem("projects", JSON.stringify(l));
 
// ── Task status config ────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["TO DO", "IN PROGRESS", "COMPLETED", "BACKLOG", "BLOCKED", "IN REVIEW"];
const STATUS_COLORS  = {
  "TO DO":       "#4F46E5",
  "IN PROGRESS": "#F59E0B",
  "COMPLETED":   "#10B981",
  "BACKLOG":     "#6B7280",
  "BLOCKED":     "#EF4444",
  "IN REVIEW":   "#3B82F6",
};
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];
 
// ── Helpers ───────────────────────────────────────────────────────────────────
const today = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};
const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};
const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return "less than a minute ago";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};
 
// ── Circular stat card ────────────────────────────────────────────────────────
function CircleStat({ percent, label, sublabel, color }) {
  const data = [{ value: percent }, { value: 100 - percent }];
  return (
    <div style={{ flex:1, background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:"20px 16px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize:11, color:"#9ca3af", margin:"0 0 10px", fontWeight:500 }}>{label}</p>
      <div style={{ position:"relative", width:76, height:76, margin:"0 auto 8px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={26} outerRadius={36} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
              <Cell fill={color}/>
              <Cell fill="#f3f4f6"/>
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color }}>{percent}%</span>
        </div>
      </div>
      <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>{sublabel}</p>
    </div>
  );
}
 
function MemberStat({ count }) {
  return (
    <div style={{ flex:1, background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:"20px 16px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize:11, color:"#9ca3af", margin:"0 0 10px", fontWeight:500 }}>Team Members</p>
      <div style={{ width:76, height:76, borderRadius:"50%", background:"#111827", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
        <span style={{ fontSize:16, fontWeight:700, color:"#fff" }}>100%</span>
      </div>
      <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>{count} member{count!==1?"s":""}</p>
    </div>
  );
}
 
// ── Create Task Modal ─────────────────────────────────────────────────────────
function CreateTaskModal({ onClose, onCreate, members }) {
  const [taskName,  setTaskName]  = useState("");
  const [assignee,  setAssignee]  = useState("");
  const [priority,  setPriority]  = useState("MEDIUM");
  const [startDate, setStartDate] = useState(today());
  const [dueDate,   setDueDate]   = useState(today());
  const [status,    setStatus]    = useState("TO DO");
  const [desc,      setDesc]      = useState("");
 
  const labelStyle = { fontSize:13, color:"#374151", display:"block", marginBottom:6, fontWeight:500 };
  const inputStyle = { width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box", color:"#111", background:"#fff" };
  const selectStyle = { ...inputStyle, cursor:"pointer", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:30 };
 
  const submit = () => {
    if (!taskName.trim()) return alert("Please enter a task name.");
    onCreate({ name: taskName.trim(), assignee, priority, startDate, dueDate, status, desc, createdAt: new Date().toISOString() });
  };
 
  return (
    <div onClick={e => e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:500, background:"#fff", borderRadius:16, padding:"28px 32px", boxShadow:"0 12px 48px rgba(0,0,0,0.18)", animation:"fadeIn 0.2s ease", maxHeight:"90vh", overflowY:"auto" }}>
 
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:"#111", margin:0 }}>Create New Task</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
 
        {/* Task Name */}
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Task Name</label>
          <input value={taskName} onChange={e=>setTaskName(e.target.value)} autoFocus placeholder="Enter task name"
            style={{ ...inputStyle, border:"1.5px solid #111" }}
            onFocus={e=>e.target.style.borderColor="#4F46E5"}
            onBlur={e=>e.target.style.borderColor="#111"}
          />
        </div>
 
        {/* Assignee + Priority */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
          <div>
            <label style={labelStyle}>Assignee</label>
            <select value={assignee} onChange={e=>setAssignee(e.target.value)} style={selectStyle}>
              <option value="">Select assignee</option>
              {members.map((m,i) => <option key={i} value={m.name}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={priority} onChange={e=>setPriority(e.target.value)} style={selectStyle}>
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
 
        {/* Start Date + Due Date */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
          <div>
            <label style={labelStyle}>Start Date</label>
            <div style={{ position:"relative" }}>
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
                style={{ ...inputStyle, paddingRight:36 }}/>
            </div>
            {startDate && <p style={{ fontSize:11, color:"#9ca3af", margin:"4px 0 0" }}>{fmtDate(startDate)}</p>}
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <div style={{ position:"relative" }}>
              <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}
                style={{ ...inputStyle, paddingRight:36 }}/>
            </div>
            {dueDate && <p style={{ fontSize:11, color:"#9ca3af", margin:"4px 0 0" }}>{fmtDate(dueDate)}</p>}
          </div>
        </div>
 
        {/* Status */}
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} style={selectStyle}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
 
        {/* Description */}
        <div style={{ marginBottom:24 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="Add your description..."
            style={{ ...inputStyle, resize:"vertical" }}/>
        </div>
 
        {/* Buttons */}
        <div style={{ display:"flex", justifyContent:"flex-end", gap:12 }}>
          <button onClick={onClose} style={{ padding:"10px 20px", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", color:"#374151" }}>
            Cancel
          </button>
          <button onClick={submit} style={{ padding:"10px 24px", background:"#111827", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── Tab bar ───────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, setActive }) {
  return (
    <div style={{ display:"flex", gap:0, borderBottom:"1px solid #f0f0f0", marginBottom:16 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => setActive(t)}
          style={{ padding:"8px 18px", border:"none", background:"none", cursor:"pointer", fontSize:13, fontWeight:active===t?600:400, color:active===t?"#111":"#9ca3af", borderBottom:active===t?"2px solid #111":"2px solid transparent", marginBottom:-1, transition:"all 0.15s" }}>
          {t}
        </button>
      ))}
    </div>
  );
}
 
// ── Custom donut label ────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return value > 0 ? <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>{value}</text> : null;
};
 
// ── PROJECT PAGE ──────────────────────────────────────────────────────────────
export default function ProjectPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useKindeAuth();
 
  const [projects,      setProjectsState] = useState(() => getProjects());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [topTab,        setTopTab]        = useState("Dashboard");
  const [bottomTab,     setBottomTab]     = useState("Overview");
 
  const project = projects.find(p => String(p.id) === String(id));
 
  const userInitials = user ? `${user.given_name?.charAt(0)??""}${user.family_name?.charAt(0)??""}`.toUpperCase() : "U";
  const userName     = user ? `${user.given_name??""} ${user.family_name??""}`.trim() : "User";
 
  // ── Derived stats ──
  const tasks      = project?.tasks || [];
  const total      = tasks.length;
  const completed  = tasks.filter(t => t.status === "COMPLETED").length;
  const inProgress = tasks.filter(t => t.status === "IN PROGRESS").length;
  const overdue    = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED").length;
  const completePct  = total ? Math.round((completed / total) * 100) : 0;
  const inProgPct    = total ? Math.round((inProgress / total) * 100) : 0;
  const overduePct   = total ? Math.round((overdue / total) * 100) : 0;
 
  // ── Donut chart data — group tasks by status ──
  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    const count = tasks.filter(t => t.status === s).length;
    if (count > 0) acc.push({ name: s, value: count, color: STATUS_COLORS[s] });
    return acc;
  }, []);
 
  // ── Create task ──
  const handleCreateTask = (task) => {
    const updated = projects.map(p => {
      if (String(p.id) !== String(id)) return p;
      const activity = { type:"task", text:`${userName} created task "${task.name}"`, at: task.createdAt };
      return { ...p, tasks: [...(p.tasks||[]), task], activity: [...(p.activity||[]), activity] };
    });
    saveProjects(updated);
    setProjectsState(updated);
    setShowTaskModal(false);
  };
 
  if (!project) {
    return (
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, color:"#9ca3af" }}>
        <p>Project not found.</p>
        <button onClick={() => navigate("/dashboard")} style={{ padding:"8px 20px", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:13 }}>Back</button>
      </div>
    );
  }
 
  const projectInitial = project.name.charAt(0).toUpperCase();
  const allActivity = [
    ...(project.activity || []),
    { type:"project", text:`${project.createdBy} created project "${project.name}"`, at: project.createdAt },
  ].sort((a, b) => new Date(b.at) - new Date(a.at));
 
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f9fafb" }}>
 
      {/* Header */}
      <header style={{ height:56, background:"#fff", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", flexShrink:0 }}>
        <div>
          <p style={{ fontSize:15, fontWeight:700, color:"#111", margin:0 }}>Projects</p>
          <p style={{ fontSize:12, color:"#9ca3af", margin:0 }}>Manage project tasks and activities</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          </button>
          <button style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4"/></svg>
          </button>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>{userInitials}</div>
        </div>
      </header>
 
      <main style={{ flex:1, overflow:"auto", padding:24 }}>
 
        {/* View tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:18 }}>
          {["Dashboard","Table","Kanban","Calendar","Timeline"].map(t => (
            <button key={t} onClick={() => setTopTab(t)}
              style={{ padding:"6px 16px", border:"none", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:topTab===t?600:400, background:topTab===t?"#111":"transparent", color:topTab===t?"#fff":"#6b7280", transition:"all 0.15s" }}>
              {t}
            </button>
          ))}
        </div>
 
        {/* Project title + actions */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>{projectInitial}</div>
            <h2 style={{ fontSize:17, fontWeight:700, color:"#111", margin:0 }}>{project.name}</h2>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button
              onClick={() => setShowTaskModal(true)}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#4F46E5", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Task
            </button>
            <button style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"#fff", color:"#374151", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, cursor:"pointer" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09"/></svg>
              Settings
            </button>
          </div>
        </div>
 
        {/* Team members */}
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:"12px 20px", marginBottom:14, display:"flex", alignItems:"center", gap:12, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <span style={{ fontSize:13, color:"#6b7280", fontWeight:500 }}>Team Members</span>
          <div style={{ display:"flex" }}>
            {(project.members||[]).map((m,i) => (
              <div key={i} title={m.name} style={{ width:28, height:28, borderRadius:"50%", background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", border:"2px solid #fff", marginLeft:i>0?-8:0 }}>
                {m.initials}
              </div>
            ))}
          </div>
        </div>
 
        {/* Stat cards */}
        <div style={{ display:"flex", gap:12, marginBottom:18 }}>
          <CircleStat percent={completePct} label="Tasks Completed" sublabel={`${completed}/${total} tasks`}       color="#10B981"/>
          <CircleStat percent={inProgPct}   label="In Progress"     sublabel={`${inProgress} tasks ongoing`}      color="#10B981"/>
          <CircleStat percent={overduePct}  label="Overdue"         sublabel={`${overdue} tasks overdue`}         color="#EF4444"/>
          <MemberStat count={(project.members||[]).length}/>
        </div>
 
        {/* Bottom tabs */}
        <TabBar tabs={["Overview","Timeline","Activity"]} active={bottomTab} setActive={setBottomTab}/>
 
        {/* Bottom 3-col grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
 
          {/* Task Distribution donut */}
          <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:20, minHeight:240, display:"flex", flexDirection:"column", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#111", margin:"0 0 12px" }}>Task Distribution</h3>
            {statusCounts.length === 0
              ? <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <p style={{ fontSize:12, color:"#c4c4c4", textAlign:"center" }}>Showing total task count for the project</p>
                </div>
              : <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusCounts} cx="50%" cy="45%" innerRadius={50} outerRadius={80} dataKey="value" labelLine={false} label={renderCustomLabel}>
                      {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]}/>
                    <Legend
                      iconType="circle" iconSize={8}
                      formatter={(value) => <span style={{ fontSize:11, color:"#374151" }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
            }
          </div>
 
          {/* Recent Activity */}
          <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:20, minHeight:240, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#111", margin:"0 0 14px" }}>Recent Activity</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {allActivity.map((a, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff", flexShrink:0 }}>
                    {(project.createdBy||"U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize:12, color:"#374151", margin:"0 0 2px", lineHeight:1.5 }}>{a.text}</p>
                    <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>{timeAgo(a.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          {/* Recent Comments */}
          <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:20, minHeight:240, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#111", margin:"0 0 14px" }}>Recent Comments</h3>
            <p style={{ fontSize:12, color:"#c4c4c4", margin:0 }}>No comments yet</p>
          </div>
 
        </div>
      </main>
 
      {/* Create Task Modal */}
      {showTaskModal && (
        <CreateTaskModal
          onClose={() => setShowTaskModal(false)}
          onCreate={handleCreateTask}
          members={project.members || []}
        />
      )}
 
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor:pointer; opacity:0.6; }
      `}</style>
    </div>
  );
}