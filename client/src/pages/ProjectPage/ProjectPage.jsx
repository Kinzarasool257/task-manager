import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

import { STATUS_OPTIONS, STATUS_COLORS } from "./projectUtils";
import { CircleStat, MemberStat, TabBar } from "./ProjectUIComponents";
import CreateTaskModal from "./CreateTaskModal";
import ProjectTimeline from "./ProjectTimeline";
import ProjectActivity from "./ProjectActivity";
import TableView from "./TableView";
import TaskDetailPage from "./TaskDetailPage";
import KanbanView from "./KanbanBoard";
import CalendarView from "./CalendarView";
import TimelineView from "./TimelineView";
import { getProjectById, createTask, updateTask } from "../../lib/api";
import PageHeader from "../../components/PageHeader";

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

// ── Settings dropdown ─────────────────────────────────────────────────────────
// ── Settings dropdown ─────────────────────────────────────────────────────────
function SettingsDropdown({ projectId, navigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation(); // CRITICAL: Stops the click from bubbling and closing the menu instantly
    setOpen(!open);
  };

  return (
    <div ref={ref} style={{ position: "relative", zIndex: 1000 }}>
      <button
        onClick={toggleDropdown}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--surface)", color: "var(--text-main)", border: "1px solid var(--panel-border)", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09" /></svg>
        Settings
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 1001, minWidth: 180, overflow: "hidden", animation: "fadeIn 0.15s ease" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, margin: "10px 14px 6px" }}>Actions</p>

          <button
            onClick={() => { setOpen(false); navigate(`/dashboard/project/${projectId}/settings`); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "var(--text-main)", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09" /></svg>
            Edit Project
          </button>

          <button
            onClick={() => { setOpen(false); navigate(`/dashboard/project/${projectId}/documentation`); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "var(--text-main)", textAlign: "left", borderTop: "1px solid var(--panel-border)" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            Documentation
          </button>
        </div>
      )}
    </div>
  );
}


const UI_TO_DB_STATUS = { "TO DO": "TODO", "IN PROGRESS": "IN_PROGRESS", "COMPLETED": "DONE", "BACKLOG": "BACKLOG", "BLOCKED": "BLOCKED", "IN_REVIEW": "IN_REVIEW" };
const DB_TO_UI_STATUS = { "TODO": "TO DO", "IN_PROGRESS": "IN PROGRESS", "DONE": "COMPLETED", "BACKLOG": "BACKLOG", "BLOCKED": "BLOCKED", "IN_REVIEW": "IN REVIEW" };

// ── PROJECT PAGE ──────────────────────────────────────────────────────────────
export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [topTab, setTopTab] = useState("Dashboard");
  const [bottomTab, setBottomTab] = useState("Overview");
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        // Reset view states on project change
        setSelectedTask(null);
        setTopTab("Dashboard");
        
        const data = await getProjectById(id);
        if (data.tasks) {
          data.tasks = data.tasks.map(t => ({
            ...t,
            status: DB_TO_UI_STATUS[t.status] || t.status,
            name: t.title,
            desc: t.description,
            startDate: t.startDate ? new Date(t.startDate).toISOString().split("T")[0] : null,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : null
          }));
        }
        setProject(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProject();
  }, [id]);

  const userName = user ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim() : "User";

  const tasks = project?.tasks || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "COMPLETED").length;
  const inProgress = tasks.filter(t => t.status === "IN PROGRESS").length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED").length;

  const completePct = total ? Math.round((completed / total) * 100) : 0;
  const inProgPct = total ? Math.round((inProgress / total) * 100) : 0;
  const overduePct = total ? Math.round((overdue / total) * 100) : 0;

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    const count = tasks.filter(t => t.status === s).length;
    if (count > 0) acc.push({ name: s, value: count, color: STATUS_COLORS[s] });
    return acc;
  }, []);

  const taskActivity = tasks.map(t => ({ type: "task", text: `Task "${t.name}" added`, at: t.createdAt }));
  const allComments = tasks.flatMap(t => (t.comments || []).map(c => ({ ...c, taskName: t.name, taskId: t.id })));
  const commentActivity = allComments.map(c => ({ type: "comment", text: `New comment on "${c.taskName}"`, at: c.at }));
  const docActivity = tasks.filter(t => t.documentation).map(t => ({ type: "doc", text: `Doc updated for "${t.name}"`, at: t.updatedAt }));

  const allActivity = [...taskActivity, ...commentActivity, ...docActivity, { type: "project", text: `Project created`, at: project?.createdAt }, ...(project?.activity || [])]
    .filter(a => a.at).sort((a, b) => new Date(b.at) - new Date(a.at));

  const handleCreateTask = async (taskForm) => {
    try {
      const newTask = await createTask({
        title: taskForm.name,
        description: taskForm.desc,
        projectId: id,
        status: UI_TO_DB_STATUS[taskForm.status] || "TODO",
        priority: taskForm.priority || "MEDIUM",
        assignee: taskForm.assignee,
        startDate: taskForm.startDate,
        dueDate: taskForm.dueDate
      });
      const mappedTask = { ...newTask, name: newTask.title, status: DB_TO_UI_STATUS[newTask.status] || newTask.status, desc: newTask.description };
      setProject(prev => ({ ...prev, tasks: [...(prev.tasks || []), mappedTask] }));
      setShowTaskModal(false);
    } catch (error) { console.error(error); }
  };

  const updateTasks = async (updatedTasks, changedTask) => {
    setProject(prev => ({ ...prev, tasks: updatedTasks }));
    if (changedTask) {
      try {
        await updateTask(changedTask.id, {
          title: changedTask.name,
          status: UI_TO_DB_STATUS[changedTask.status],
          startDate: changedTask.startDate,
          dueDate: changedTask.dueDate
        });
      } catch {
        const data = await getProjectById(id);
        setProject(data);
      }
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const result = await updateTask(updatedTask.id, {
        title: updatedTask.name,
        description: updatedTask.desc,
        status: UI_TO_DB_STATUS[updatedTask.status],
        priority: updatedTask.priority,
        assignee: updatedTask.assignee,
        startDate: updatedTask.startDate,
        dueDate: updatedTask.dueDate,
        documentation: updatedTask.documentation,
        comments: updatedTask.comments,
        attachments: updatedTask.attachments
      });
      setProject(prev => ({ ...prev, tasks: (prev.tasks || []).map(t => t.id === updatedTask.id ? { ...updatedTask, ...result, name: result.title, desc: result.description, status: DB_TO_UI_STATUS[result.status] || result.status } : t) }));
      setSelectedTask(updatedTask);
    } catch (error) { console.error(error); }
  };

  if (loading) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)" }}>Loading...</div>;
  if (!project) return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)" }}>Project not found.</div>;

  if (selectedTask) {
    const liveTask = (project?.tasks || []).find(t => t.id === selectedTask.id) || selectedTask;
    return <TaskDetailPage task={liveTask} project={project} userName={userName} onBack={() => setSelectedTask(null)} onUpdateTask={handleUpdateTask} />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      <PageHeader 
        title="Project Dashboard" 
        subtitle={`Manage project tasks (${theme} mode)`} 
      />


      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
          <div className="flex gap-1">
            {["Dashboard", "Table", "Kanban", "Calendar", "Timeline"].map(t => (
              <button 
                key={t} 
                onClick={() => setTopTab(t)} 
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                  ${topTab === t ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}
                `}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
               {project?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{project?.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowTaskModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span>New Task</span>
            </button>
            <SettingsDropdown projectId={id} navigate={navigate} />
          </div>
        </div>

        {topTab === "Table" && <TableView tasks={tasks} onTaskClick={setSelectedTask} />}
        {topTab === "Kanban" && <KanbanView tasks={tasks} setTasks={updateTasks} onTaskClick={setSelectedTask} projectName={project.name} members={project.members || []} />}
        {topTab === "Calendar" && <CalendarView tasks={tasks} setTasks={updateTasks} onTaskClick={setSelectedTask} />}
        {topTab === "Timeline" && <TimelineView tasks={tasks} onTaskClick={setSelectedTask} />}

        {topTab === "Dashboard" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <CircleStat percent={completePct} label="Tasks Completed" sublabel={`${completed}/${total} tasks`} color="var(--primary)" />
              <CircleStat percent={inProgPct} label="In Progress" sublabel={`${inProgress} tasks ongoing`} color="var(--primary)" />
              <CircleStat percent={overduePct} label="Overdue" sublabel={`${overdue} tasks overdue`} color="var(--destructive)" />
              <MemberStat count={(project.members || []).length} />
            </div>
            <TabBar tabs={["Overview", "Timeline", "Activity"]} active={bottomTab} setActive={setBottomTab} />
            {bottomTab === "Overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-6">Task Distribution</h3>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={statusCounts} cx="50%" cy="45%" innerRadius={50} outerRadius={80} dataKey="value" labelLine={false} label={renderCustomLabel}>{statusCounts.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /><Legend iconType="circle" /></PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-6">Recent Activity</h3>
                  <ProjectActivity activity={allActivity.slice(0, 4)} />
                </div>
              </div>
            )}
            {bottomTab === "Activity" && <ProjectActivity activity={allActivity} />}
            {bottomTab === "Timeline" && <ProjectTimeline project={project} />}
          </>
        )}
      </main>


      {showTaskModal && <CreateTaskModal onClose={() => setShowTaskModal(false)} onCreate={handleCreateTask} members={project.members || []} />}
    </div>
  );
}