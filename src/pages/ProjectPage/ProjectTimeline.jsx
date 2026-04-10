import { fmtDate } from "./projectUtils";
 
const STATUS_STYLE = {
  "COMPLETED":   { bg:"#ECFDF5", color:"#065F46" },
  "IN PROGRESS": { bg:"#FFFBEB", color:"#B45309" },
  "BLOCKED":     { bg:"#FEF2F2", color:"#991B1B" },
  "TO DO":       { bg:"#EEF2FF", color:"#4338CA" },
  "BACKLOG":     { bg:"#F3F4F6", color:"#374151" },
  "IN REVIEW":   { bg:"#EFF6FF", color:"#1D4ED8" },
};
 
const PRIORITY_STYLE = {
  "LOW":    { bg:"#F0FDF4", color:"#166534" },
  "MEDIUM": { bg:"#FEF3C7", color:"#92400E" },
  "HIGH":   { bg:"#FFF7ED", color:"#C2410C" },
  "URGENT": { bg:"#FEF2F2", color:"#991B1B" },
};
 
function TimelineRow({ dotColor, borderColor, date, children }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", marginBottom:10 }}>
      {/* Date column */}
      <div style={{ width:120, flexShrink:0, fontSize:11, color:"#9ca3af", paddingTop:10, textAlign:"right", paddingRight:14 }}>
        {date}
      </div>
      {/* Dot + line */}
      <div style={{ width:24, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:dotColor, marginTop:10, flexShrink:0 }}/>
        <div style={{ width:2, flex:1, minHeight:10, background:"#f0f0f0" }}/>
      </div>
      {/* Card */}
      <div style={{ flex:1, background:"#f9fafb", border:"1px solid #f0f0f0", borderLeft:`3px solid ${borderColor}`, borderRadius:8, padding:"10px 14px", marginLeft:8 }}>
        {children}
      </div>
    </div>
  );
}
 
export default function ProjectTimeline({ project }) {
  const tasks = project?.tasks || [];
 
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:20, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
 
      {/* Project pill */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, padding:"6px 12px 6px 8px", background:"#f9fafb", border:"1px solid #f0f0f0", borderRadius:6, width:"fit-content" }}>
        <div style={{ width:22, height:22, borderRadius:5, background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>
          {project.name.charAt(0).toUpperCase()}
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:"#111" }}>{project.name}</span>
        <span style={{ fontSize:11, color:"#9ca3af", marginLeft:4 }}>
          {fmtDate(project.createdAt?.split("T")[0])} → ongoing
        </span>
      </div>
 
      {/* Project created row */}
      <TimelineRow dotColor="#4F46E5" borderColor="#4F46E5" date={fmtDate(project.createdAt?.split("T")[0])}>
        <div style={{ fontSize:13, fontWeight:500, color:"#111", marginBottom:4 }}>
          Project created — {project.name}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#9ca3af" }}>by {project.createdBy}</span>
          <span style={{ fontSize:11, padding:"2px 8px", borderRadius:4, background:"#EEF2FF", color:"#4338CA", fontWeight:500 }}>Active</span>
        </div>
      </TimelineRow>
 
      {/* Task rows */}
      {tasks.map((task, i) => {
        const ss = STATUS_STYLE[task.status] || STATUS_STYLE["TO DO"];
        const ps = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE["MEDIUM"];
        return (
          <TimelineRow key={i} dotColor="#10B981" borderColor="#10B981" date={fmtDate(task.startDate)}>
            <div style={{ fontSize:13, fontWeight:500, color:"#111", marginBottom:6 }}>{task.name}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:11, padding:"2px 8px", borderRadius:4, background:ss.bg, color:ss.color, fontWeight:500 }}>{task.status}</span>
              {task.assignee && <span style={{ fontSize:11, color:"#9ca3af" }}>Assigned: {task.assignee}</span>}
              {task.dueDate  && <span style={{ fontSize:11, color:"#9ca3af" }}>Due: {fmtDate(task.dueDate)}</span>}
              {task.priority && <span style={{ fontSize:11, padding:"2px 8px", borderRadius:4, background:ps.bg, color:ps.color, fontWeight:500 }}>{task.priority}</span>}
            </div>
          </TimelineRow>
        );
      })}
 
      {tasks.length === 0 && (
        <div style={{ fontSize:13, color:"#9ca3af", paddingLeft:142, paddingTop:4 }}>
          No tasks yet. Create one to see the timeline.
        </div>
      )}
    </div>
  );
}