import { useState } from "react";
import { fmtDate } from "./projectUtils";

const STATUS_COLORS = {
  "TO DO": "var(--primary)",
  "IN PROGRESS": "#F59E0B",
  "COMPLETED": "#10B981",
  "BACKLOG": "var(--text-dim)",
  "BLOCKED": "#EF4444",
  "IN REVIEW": "#8B5CF6",
};

const STATUS_BG = {
  "TO DO": "var(--nav-active-bg)",
  "IN PROGRESS": "rgba(245, 158, 11, 0.12)",
  "COMPLETED": "rgba(16, 185, 129, 0.12)",
  "BACKLOG": "var(--surface-alt)",
  "BLOCKED": "rgba(239, 68, 68, 0.12)",
  "IN REVIEW": "rgba(139, 92, 246, 0.12)",
};
const PRIORITY_COLORS = { LOW: "#10B981", MEDIUM: "#F59E0B", HIGH: "#EF4444", URGENT: "#7C3AED" };

export default function TableView({ tasks, onTaskClick }) {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "desc" });

  const toggleAll = (e) => setSelected(e.target.checked ? sortedTasks.map(t => t.id) : []);
  const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortValue = (task, key) => {
    switch (key) {
      case "Task Title": return task.name?.toLowerCase() || "";
      case "Status": return task.status || "";
      case "Priority": {
        const pValues = { "URGENT": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
        return pValues[task.priority] || 0;
      }
      case "Due Date": return task.dueDate || "";
      case "Created At": return task.createdAt || "";
      case "Assigned To": return task.assignee?.toLowerCase() || "";
      case "Attachments": return Array.isArray(task.attachments) ? task.attachments.length : 0;
      default: return "";
    }
  };

  const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = getSortValue(a, sortConfig.key);
    const bVal = getSortValue(b, sortConfig.key);
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border-b border-slate-200">
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search task title..."
          className="w-full sm:w-64 h-11 border border-slate-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-600 transition-colors"
          style={{ background: "var(--surface)" }}
        />
        <button className="flex items-center justify-center gap-2 h-11 px-6 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm font-medium hover:bg-slate-100 transition-colors">
          <span>Columns</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>

      {/* Horizontal Scroll Wrapper */}
      <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-200">

        {/* Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--surface-alt)", borderBottom: "1px solid var(--panel-border)" }}>
              <th style={{ width: 36, padding: "10px 12px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={selected.length === sortedTasks.length && sortedTasks.length > 0}
                />
              </th>
              {["Task Title", "Status", "Priority", "Created At", "Due Date", "Assigned To", "Attachments", "Actions"].map(h => (
                <th
                  key={h}
                  onClick={() => h !== "Actions" && handleSort(h)}
                  style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap", cursor: h !== "Actions" ? "pointer" : "default", userSelect: "none" }}
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
            </tr>
          </thead>

          <tbody>
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
                  No tasks yet. Click "+ New Task" to create one.
                </td>
              </tr>
            ) : (
              sortedTasks.map(task => (
                <tr
                  key={task.id}
                  style={{ borderBottom: "1px solid var(--panel-border)", background: selected.includes(task.id) ? "var(--nav-active-bg)" : "var(--surface)" }}
                  onMouseEnter={e => e.currentTarget.style.background = selected.includes(task.id) ? "var(--nav-active-bg)" : "var(--surface-alt)"}
                  onMouseLeave={e => e.currentTarget.style.background = selected.includes(task.id) ? "var(--nav-active-bg)" : "var(--surface)"}
                >
                  {/* Checkbox */}
                  <td style={{ padding: "11px 12px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(task.id)}
                      onChange={() => toggleOne(task.id)}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>

                  {/* Task Title — click opens TaskDetailPage */}
                  <td style={{ padding: "11px 12px" }}>
                    <div
                      onClick={() => onTaskClick && onTaskClick(task)}
                      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {task.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        style={{ fontWeight: 500, color: "var(--text-main)", transition: "color 0.15s" }}
                        onMouseEnter={e => e.target.style.color = "var(--primary)"}
                        onMouseLeave={e => e.target.style.color = "var(--text-main)"}
                      >
                        {task.name}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "11px 12px" }}>
                    <span style={{ background: STATUS_BG[task.status] || "var(--surface-alt)", color: STATUS_COLORS[task.status] || "var(--text-muted)", padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {task.status}
                    </span>
                  </td>

                  {/* Priority */}
                  <td style={{ padding: "11px 12px" }}>
                    <span style={{ color: PRIORITY_COLORS[task.priority] || "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>
                      {task.priority}
                    </span>
                  </td>

                  {/* Created At */}
                  <td style={{ padding: "11px 12px", color: "var(--text-dim)", fontSize: 12 }}>
                    {fmtDate(task.createdAt?.split("T")[0])}
                  </td>

                  {/* Due Date */}
                  <td style={{ padding: "11px 12px", color: "var(--text-dim)", fontSize: 12 }}>
                    {fmtDate(task.dueDate)}
                  </td>

                  {/* Assigned To */}
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>
                        {(task.assignee || "?").charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-main)" }}>{task.assignee || "—"}</span>
                    </div>
                  </td>

                  {/* Attachments count */}
                  <td style={{ padding: "11px 12px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 12, cursor: Array.isArray(task.attachments) && task.attachments.length > 0 ? "pointer" : "default" }}
                      onClick={() => Array.isArray(task.attachments) && task.attachments.length > 0 && onTaskClick && onTaskClick(task)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                      </svg>
                      <span style={{ color: Array.isArray(task.attachments) && task.attachments.length > 0 ? "var(--text-main)" : "var(--text-muted)", fontWeight: Array.isArray(task.attachments) && task.attachments.length > 0 ? 500 : 400 }}>
                        {Array.isArray(task.attachments) ? task.attachments.length : (task.attachments || 0)}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "11px 12px" }}>
                    <button
                      onClick={() => onTaskClick && onTaskClick(task)}
                      title="View task details"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid var(--panel-border)" }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{selected.length} of {sortedTasks.length} row(s) selected</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ fontSize: 12, color: "var(--text-main)", border: "1px solid var(--panel-border)", borderRadius: 6, padding: "5px 12px", background: "var(--surface)", cursor: "pointer" }}>Previous</button>
          <button style={{ fontSize: 12, color: "var(--text-main)", border: "1px solid var(--panel-border)", borderRadius: 6, padding: "5px 12px", background: "var(--surface)", cursor: "pointer" }}>Next</button>
        </div>
      </div>
    </div>

  );
}