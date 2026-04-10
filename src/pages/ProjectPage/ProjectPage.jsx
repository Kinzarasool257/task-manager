import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
 
import { getProjects, saveProjects, STATUS_OPTIONS, STATUS_COLORS } from "./projectUtils";
import { CircleStat, MemberStat, TabBar } from "./ProjectUIComponents";
import CreateTaskModal from "./CreateTaskModal";
import ProjectTimeline from "./ProjectTimeline";
import ProjectActivity from "./ProjectActivity";
import TableView       from "./TableView";
import KanbanView      from "./KanbanBoard";
 
// ── Donut label ───────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return value > 0
    ? <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>{value}</text>
    : null;
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
 
  const project      = projects.find(p => String(p.id) === String(id));
  const userName     = user ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim() : "User";
  const userInitials = user
    ? `${user.given_name?.charAt(0) ?? ""}${user.family_name?.charAt(0) ?? ""}`.toUpperCase()
    : "U";
 
  // ── Derived stats ──
  const tasks      = project?.tasks || [];
  const total      = tasks.length;
  const completed  = tasks.filter(t => t.status === "COMPLETED").length;
  const inProgress = tasks.filter(t => t.status === "IN PROGRESS").length;
  const overdue    = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED").length;
  const completePct = total ? Math.round((completed  / total) * 100) : 0;
  const inProgPct   = total ? Math.round((inProgress / total) * 100) : 0;
  const overduePct  = total ? Math.round((overdue    / total) * 100) : 0;
 
  // ── Fixed statusCounts ──
const statusCounts = STATUS_OPTIONS.map((s) => {
  const count = tasks.filter((t) => t.status === s).length;
  return { 
    name: s, 
    value: count, 
    // Use the color from your utils, fallback to gray if missing
    color: STATUS_COLORS[s] || "#6B7280" 
  };
}).filter(item => item.value > 0);
 
  const allActivity = [
    ...(project?.activity || []),
    { type:"project", text:`${project?.createdBy} created project "${project?.name}"`, at: project?.createdAt },
  ].sort((a, b) => new Date(b.at) - new Date(a.at));
 
  // ── Create task ──
  const handleCreateTask = (task) => {
    const updated = projects.map(p => {
      if (String(p.id) !== String(id)) return p;
      const entry = { type:"task", text:`${userName} created task "${task.name}"`, at: task.createdAt };
      return { ...p, tasks: [...(p.tasks || []), task], activity: [...(p.activity || []), entry] };
    });
    saveProjects(updated);
    setProjectsState(updated);
    setShowTaskModal(false);
  };
 
  // ── Kanban: receives a plain updated tasks array (not a functional updater) ──
  const setTasksForKanban = (updatedTasks) => {
    const next = projects.map(p =>
      String(p.id) === String(id) ? { ...p, tasks: updatedTasks } : p
    );
    saveProjects(next);
    setProjectsState(next);
  };
 
  if (!project) {
    return (
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, color:"#9ca3af" }}>
        <p>Project not found.</p>
        <button onClick={() => navigate("/dashboard")} style={{ padding:"8px 20px", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:13 }}>Back</button>
      </div>
    );
  }
 
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f9fafb" }}>
 
      {/* ── Header ── */}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09"/></svg>
          </button>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>
            {userInitials}
          </div>
        </div>
      </header>
 
      <main style={{ flex:1, overflow:"auto", padding:24 }}>
 
        {/* ── Top view tabs ── */}
        <div style={{ display:"flex", gap:4, marginBottom:18 }}>
          {["Dashboard","Table","Kanban","Calendar","Timeline"].map(t => (
            <button key={t} onClick={() => setTopTab(t)}
              style={{ padding:"6px 16px", border:"none", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:topTab === t ? 600 : 400, background:topTab === t ? "#111" : "transparent", color:topTab === t ? "#fff" : "#6b7280", transition:"all 0.15s" }}>
              {t}
            </button>
          ))}
        </div>
 
        {/* ── Project title + actions (always visible) ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>
              {project.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize:17, fontWeight:700, color:"#111", margin:0 }}>{project.name}</h2>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => setShowTaskModal(true)}
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
 
        {/* ════════════════════════════════════════
            TABLE TAB
        ════════════════════════════════════════ */}
        {topTab === "Table" && (
          <TableView tasks={tasks} />
        )}
 
       {/* ════════════════════════════════════════
    KANBAN TAB
════════════════════════════════════════ */}
{topTab === "Kanban" && (
  <KanbanView
    tasks={tasks}
    setTasks={setTasksForKanban}
    projectName={project.name}
    // Pass the global status options so the board matches the chart
    statuses={STATUS_OPTIONS} 
    members={project.members || []}
  />
)}
 
        {/* ════════════════════════════════════════
            DASHBOARD TAB
        ════════════════════════════════════════ */}
        {topTab === "Dashboard" && (
          <>
            {/* Team members */}
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:"12px 20px", marginBottom:14, display:"flex", alignItems:"center", gap:12, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize:13, color:"#6b7280", fontWeight:500 }}>Team Members</span>
              <div style={{ display:"flex" }}>
                {(project.members || []).map((m, i) => (
                  <div key={i} title={m.name} style={{ width:28, height:28, borderRadius:"50%", background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", border:"2px solid #fff", marginLeft:i > 0 ? -8 : 0 }}>
                    {m.initials}
                  </div>
                ))}
              </div>
            </div>
 
            {/* Stat cards */}
            <div style={{ display:"flex", gap:12, marginBottom:18 }}>
              <CircleStat percent={completePct} label="Tasks Completed" sublabel={`${completed}/${total} tasks`}  color="#10B981"/>
              <CircleStat percent={inProgPct}   label="In Progress"     sublabel={`${inProgress} tasks ongoing`} color="#10B981"/>
              <CircleStat percent={overduePct}  label="Overdue"         sublabel={`${overdue} tasks overdue`}    color="#EF4444"/>
              <MemberStat count={(project.members || []).length}/>
            </div>
 
            {/* Bottom tabs */}
            <TabBar tabs={["Overview", "Timeline", "Activity"]} active={bottomTab} setActive={setBottomTab}/>
 
            {/* Overview */}
            {bottomTab === "Overview" && (
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
                          <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize:11, color:"#374151" }}>{v}</span>}/>
                        </PieChart>
                      </ResponsiveContainer>
                  }
                </div>
 
                {/* Recent Activity preview */}
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:20, minHeight:240, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"#111", margin:"0 0 14px" }}>Recent Activity</h3>
                  <ProjectActivity activity={allActivity.slice(0, 4)}/>
                </div>
 
                {/* Recent Comments */}
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:20, minHeight:240, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                  <h3 style={{ fontSize:13, fontWeight:700, color:"#111", margin:"0 0 14px" }}>Recent Comments</h3>
                  <p style={{ fontSize:12, color:"#c4c4c4", margin:0 }}>No comments yet</p>
                </div>
 
              </div>
            )}
 
            {/* Timeline tab */}
            {bottomTab === "Timeline" && <ProjectTimeline project={project}/>}
 
            {/* Activity tab */}
            {bottomTab === "Activity" && <ProjectActivity activity={allActivity}/>}
          </>
        )}
 
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
 