import { fmtDate } from "./projectUtils";

const STATUS_STYLE = {
  "COMPLETED":   { bg:"rgba(16, 185, 129, 0.12)", color:"#10B981" },
  "IN PROGRESS": { bg:"rgba(245, 158, 11, 0.12)", color:"#F59E0B" },
  "BLOCKED":     { bg:"rgba(239, 68, 68, 0.12)", color:"#EF4444" },
  "TO DO":       { bg:"var(--nav-active-bg)", color:"var(--primary)" },
  "BACKLOG":     { bg:"var(--surface-alt)", color:"var(--text-dim)" },
  "IN REVIEW":   { bg:"rgba(139, 92, 246, 0.12)", color:"#8B5CF6" },
};

const PRIORITY_STYLE = {
  "LOW":    { bg:"rgba(16, 185, 129, 0.12)", color:"#10B981" },
  "MEDIUM": { bg:"rgba(245, 158, 11, 0.12)", color:"#F59E0B" },
  "HIGH":   { bg:"rgba(239, 68, 68, 0.12)", color:"#EF4444" },
  "URGENT": { bg:"rgba(124, 58, 237, 0.12)", color:"#7C3AED" },
};

export default function ProjectTimeline({ project }) {
  const tasks = project?.tasks || [];
  
  // Sort tasks by start date or fallback to creation
  const sortedTasks = [...tasks].sort((a, b) => {
      const d1 = new Date(a.startDate || a.createdAt || 0).getTime();
      const d2 = new Date(b.startDate || b.createdAt || 0).getTime();
      return d1 - d2;
  });

  return (
    <div style={{ background:"var(--surface)", borderRadius:12, border:"1px solid var(--panel-border)", padding:24, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      {/* Project pill */}
      <div style={{ display:"flex", alignItems:32, gap:8, marginBottom:24, padding:"6px 12px 6px 8px", background:"var(--surface-alt)", border:"1px solid var(--panel-border)", borderRadius:6, width:"fit-content" }}>
        <div style={{ width:22, height:22, borderRadius:5, background:"var(--primary)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>
          {project.name.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:"var(--text-main)" }}>{project.name} Overview</span>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: 10 }}>
          <div style={{ display: "flex", gap: 16, minWidth: "max-content", alignItems: "center" }}>
              {/* Project Start Node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 140 }}>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>{fmtDate(project.createdAt?.split("T")[0])}</span>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--primary)", border: "3px solid var(--surface)", boxShadow: "0 0 0 2px var(--primary)", zIndex: 2 }} />
                  <div style={{ background: "var(--nav-active-bg)", padding: "8px 12px", borderRadius: 8, marginTop: 12, border: "1px solid var(--panel-border)", textAlign: "center", width: "100%" }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>Project Started</p>
                  </div>
              </div>

              {/* Connecting Line Tracker */}
              <div style={{ height: 2, background: "var(--panel-border)", width: 40, marginTop: -32 }} />

              {/* Horizontal Task Nodes */}
              {sortedTasks.map((task, i) => {
                  const ss = STATUS_STYLE[task.status] || STATUS_STYLE["TO DO"];
                  return (
                      <div key={i} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 220 }}>
                              <span style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>{fmtDate(task.startDate || task.dueDate || task.createdAt?.split("T")[0])}</span>
                              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10B981", border: "2px solid var(--surface)", boxShadow: "0 0 0 2px #10B981", zIndex: 2 }} />
                              <div style={{ background: "var(--surface-alt)", padding: "12px", borderRadius: 8, marginTop: 12, border: "1px solid var(--panel-border)", borderTop: `3px solid ${ss.color}`, width: "100%" }}>
                                  <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.name}</p>
                                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: ss.bg, color: ss.color, fontWeight: 600 }}>{task.status}</span>
                                      {task.assignee && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--nav-active-bg)", color: "var(--text-muted)" }}>{task.assignee}</span>}
                                  </div>
                              </div>
                          </div>
                          {i < sortedTasks.length - 1 && <div style={{ height: 2, background: "var(--panel-border)", width: 40, marginTop: -32 }} />}
                      </div>
                  );
              })}

              {sortedTasks.length === 0 && (
                  <div style={{ color: "var(--text-dim)", fontSize: 13, marginLeft: 20 }}>No tasks in timeline.</div>
              )}
          </div>
      </div>
    </div>

  );
}