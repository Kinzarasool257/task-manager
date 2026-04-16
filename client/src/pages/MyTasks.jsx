import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fmtDate } from "./ProjectPage/projectUtils";
import { useAuth } from "@/hooks/useAuth";
import TaskDetailPage from "./ProjectPage/TaskDetailPage";
import { updateTask } from "../lib/api";
import { useTheme } from "../context/ThemeContext";

const UI_TO_DB_STATUS = { "TO DO": "TODO", "IN PROGRESS": "IN_PROGRESS", "COMPLETED": "DONE", "BACKLOG": "BACKLOG", "BLOCKED": "BLOCKED", "IN_REVIEW": "IN_REVIEW" };
const DB_TO_UI_STATUS = { "TODO": "TO DO", "IN_PROGRESS": "IN PROGRESS", "DONE": "COMPLETED", "BACKLOG": "BACKLOG", "BLOCKED": "BLOCKED", "IN_REVIEW": "IN REVIEW" };
// Wait, PageHeader was created in components/
import PageHeaderComp from "../components/PageHeader";

const STATUS_COLORS = {
  "TO DO": "var(--primary)", "IN PROGRESS": "#F59E0B", "COMPLETED": "#10B981",
  "BACKLOG": "var(--text-muted)", "BLOCKED": "#EF4444", "IN REVIEW": "var(--primary)",
};
const STATUS_BG = {
  "TO DO": "var(--nav-active-bg)", "IN PROGRESS": "rgba(245, 158, 11, 0.1)", "COMPLETED": "rgba(16, 185, 129, 0.1)",
  "BACKLOG": "var(--surface-alt)", "BLOCKED": "rgba(239, 68, 68, 0.1)", "IN REVIEW": "rgba(79, 70, 229, 0.1)",
};
const PRIORITY_COLORS = { LOW: "#10B981", MEDIUM: "#F59E0B", HIGH: "#EF4444", URGENT: "#7C3AED" };

const ALL_COLUMNS = ["Task Title", "Assignee", "Status", "Priority", "Created At", "Due Date", "Project", "Attachments"];

export default function MyTasks({ projects = [], user: propUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const { theme } = useTheme();
  const user = propUser || authUser;

  const [filter, setFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "desc" });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showColumnDrop, setShowColumnDrop] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS);

  const userName = user ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim() : "User";

  // --- Reset selected task when navigating ---
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTask(null);
  }, [location.pathname]);

  // --- Aggregation: Flatten all tasks from all projects ---
  const myTasks = projects.flatMap(p =>
    (p.tasks || []).map(t => ({
      ...t,
      projectId: p.id,
      projectName: p.name,
      // Ensure field naming and status consistency
      name: t.title || t.name,
      desc: t.description || t.desc,
      status: DB_TO_UI_STATUS[t.status] || t.status
    }))
  ); // Show all tasks in workspace


  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortValue = (task, key) => {
    switch (key) {
      case "Task Title": return (task.name || "").toLowerCase();
      case "Status": return task.status || "";
      case "Priority": {
        const pValues = { "URGENT": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
        return pValues[task.priority] || 0;
      }
      case "Assignee": return (task.assignee || "Unassigned").toLowerCase();
      case "Project": return (task.projectName || "").toLowerCase();
      case "Due Date": return task.dueDate || "";
      case "Created At": return task.createdAt || "";
      case "Attachments": return Array.isArray(task.attachments) ? task.attachments.length : 0;
      default: return "";
    }
  };

  const filteredTasks = myTasks.filter(t => (t.name || "").toLowerCase().includes(filter.toLowerCase()));

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = getSortValue(a, sortConfig.key);
    const bVal = getSortValue(b, sortConfig.key);
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleUpdateTask = async (updatedTask) => {
    try {
      // Sync with database
      await updateTask(updatedTask.id, {
        title: updatedTask.name,
        description: updatedTask.desc,
        status: UI_TO_DB_STATUS[updatedTask.status] || updatedTask.status,
        priority: updatedTask.priority,
        assignee: updatedTask.assignee,
        startDate: updatedTask.startDate,
        dueDate: updatedTask.dueDate,
        documentation: updatedTask.documentation,
        comments: updatedTask.comments,
        attachments: updatedTask.attachments
      });

      // Update local task state in the aggregated list (the parent projects state will be updated by Dashboard if we were using a central store, but here we update the selectedTask locally for the detail view's immediate feedback)
      setSelectedTask(updatedTask);

      // Note: Ideally, we'd trigger a refetch of projects or use a context, 
      // but for now, the detail view will show updated data.
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  if (selectedTask) {
    // Find the live project for context (if needed by TaskDetailPage)
    const project = projects.find(p => p.id === selectedTask.projectId);
    return (
      <TaskDetailPage
        task={selectedTask}
        project={project}
        userName={userName}
        onBack={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">

      <PageHeaderComp
        title="Workspace Overview"
        subtitle={`All tasks across all projects (${theme} mode)`}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M3 9h18" /><path d="M3 15h18" />
          </svg>
        }
      />


      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border-b border-slate-200">
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search tasks..."
              className="w-full sm:w-72 h-11 border-2 border-slate-900 rounded-lg px-3 text-sm outline-none focus:border-indigo-600 transition-colors"
              style={{ background: "var(--surface)" }}
            />
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowColumnDrop(!showColumnDrop)}
                className="flex items-center gap-2 h-11 px-4 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Columns
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showColumnDrop ? "rotate(180deg)" : "none" }}><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {showColumnDrop && (
                <div style={{ position: "absolute", top: "calc(100% + 5px)", right: 0, width: 180, background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 10, boxShadow: "0 8px 25px rgba(0,0,0,0.12)", zIndex: 50, padding: 8 }}>
                  {ALL_COLUMNS.map(col => (
                    <label key={col} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", cursor: "pointer", fontSize: 12, color: "var(--text-main)", borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <input type="checkbox" checked={visibleColumns.includes(col)} onChange={() => toggleColumn(col)} />
                      {col}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table with Horizontal Scroll */}
          <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-alt)", borderBottom: "1px solid var(--panel-border)" }}>
                  <th style={{ width: 36, padding: "10px 12px", textAlign: "center" }}>
                    <input type="checkbox" disabled />
                  </th>
                  {visibleColumns.map(h => (
                    <th
                      key={h}
                      onClick={() => handleSort(h)}
                      style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap", cursor: "pointer", userSelect: "none" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {h}
                        {sortConfig.key === h && (
                          <span style={{ fontSize: 10, color: "var(--primary)" }}>
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} style={{ padding: "64px 32px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--panel-border)" strokeWidth="1.5" style={{ margin: "0 auto 12px" }}>
                        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                      </svg>
                      <br />
                      No tasks found in this workspace.
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map(task => {
                    const statusStr = DB_TO_UI_STATUS[task.status] || task.status;
                    return (
                      <tr
                        key={task.id}
                        style={{ borderBottom: "1px solid var(--panel-border)", background: "var(--surface)", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-alt)"}
                        onMouseLeave={e => e.currentTarget.style.background = "var(--surface)"}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: "11px 12px", textAlign: "center" }}>
                          <input type="checkbox" onClick={e => e.stopPropagation()} />
                        </td>

                        {/* Dynamic Columns */}
                        {visibleColumns.includes("Task Title") && (
                          <td style={{ padding: "11px 12px" }}>
                            <div
                              onClick={() => setSelectedTask(task)}
                              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                            >
                              <div style={{ width: 22, height: 22, borderRadius: 5, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                {(task.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <span
                                style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.15s" }}
                                onMouseEnter={e => e.target.style.color = "var(--primary)"}
                                onMouseLeave={e => e.target.style.color = "var(--text-main)"}
                              >
                                {task.name}
                              </span>
                            </div>
                          </td>
                        )}

                        {visibleColumns.includes("Assignee") && (
                          <td style={{ padding: "11px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 22, height: 22, borderRadius: "50%", background: task.assignee ? "var(--nav-active-bg)" : "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: task.assignee ? "var(--primary)" : "var(--text-muted)", border: "1px solid var(--panel-border)" }}>
                                {task.assignee ? task.assignee.charAt(0).toUpperCase() : "?"}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 500, color: task.assignee ? "var(--text-main)" : "var(--text-muted)" }}>
                                {task.assignee || "Unassigned"}
                              </span>
                            </div>
                          </td>
                        )}

                        {visibleColumns.includes("Status") && (
                          <td style={{ padding: "11px 12px" }}>
                            <span style={{ background: STATUS_BG[statusStr] || "var(--surface-alt)", color: STATUS_COLORS[statusStr] || "var(--text-muted)", padding: "4px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 0.5 }}>
                              {statusStr}
                            </span>
                          </td>
                        )}

                        {visibleColumns.includes("Priority") && (
                          <td style={{ padding: "11px 12px" }}>
                            <span style={{ color: PRIORITY_COLORS[task.priority] || "var(--text-muted)", fontWeight: 700, fontSize: 11, background: "var(--surface-alt)", padding: "4px 8px", borderRadius: 6 }}>
                              {task.priority || "MEDIUM"}
                            </span>
                          </td>
                        )}

                        {visibleColumns.includes("Created At") && (
                          <td style={{ padding: "11px 12px", color: "var(--text-muted)", fontSize: 12, fontWeight: 500 }}>
                            {fmtDate(task.createdAt?.split("T")[0])}
                          </td>
                        )}

                        {visibleColumns.includes("Due Date") && (
                          <td style={{ padding: "11px 12px", color: "var(--text-muted)", fontSize: 12, fontWeight: 500 }}>
                            {fmtDate(task.dueDate)}
                          </td>
                        )}

                        {visibleColumns.includes("Project") && (
                          <td style={{ padding: "11px 12px" }}>
                            <div
                              onClick={() => navigate(`/dashboard/project/${task.projectId}`)}
                              style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", background: "var(--nav-active-bg)", color: "var(--nav-active-text)", padding: "4px 10px", borderRadius: 8, width: "max-content", transition: "opacity 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                              onMouseLeave={e => e.currentTarget.style.opacity = 1}
                            >
                              <div style={{ width: 16, height: 16, borderRadius: 4, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>
                                {task.projectName?.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600 }}>{task.projectName}</span>
                            </div>
                          </td>
                        )}

                        {visibleColumns.includes("Attachments") && (
                          <td style={{ padding: "11px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 12 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                              </svg>
                              <span style={{ color: Array.isArray(task.attachments) && task.attachments.length > 0 ? "var(--text-main)" : "var(--text-muted)", fontWeight: 600 }}>
                                {Array.isArray(task.attachments) ? task.attachments.length : (task.attachments || 0)}
                              </span>
                            </div>
                          </td>
                        )}

                        {/* Actions */}
                        <td style={{ padding: "11px 12px" }}>
                          <button
                            onClick={() => setSelectedTask(task)}
                            title="View Details"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="12" cy="5" r="1"></circle>
                              <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {sortedTasks.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--panel-border)" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{filteredTasks.length} task(s) in this view.</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ fontSize: 12, fontWeight: 500, color: "var(--text-main)", border: "1px solid var(--panel-border)", borderRadius: 6, padding: "6px 14px", background: "var(--surface)", cursor: "pointer" }}>Previous</button>
                <button style={{ fontSize: 12, fontWeight: 500, color: "var(--text-main)", border: "1px solid var(--panel-border)", borderRadius: 6, padding: "6px 14px", background: "var(--surface)", cursor: "pointer" }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


