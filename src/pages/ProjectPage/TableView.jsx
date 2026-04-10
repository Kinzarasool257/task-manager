import { useState } from "react";
import { fmtDate } from "./projectUtils";
 
const STATUS_COLORS = {
  "TO DO":"#4F46E5","IN PROGRESS":"#F59E0B","COMPLETED":"#10B981",
  "BACKLOG":"#6B7280","BLOCKED":"#EF4444","IN REVIEW":"#8B5CF6",
};
const STATUS_BG = {
  "TO DO":"#EEF2FF","IN PROGRESS":"#FFFBEB","COMPLETED":"#ECFDF5",
  "BACKLOG":"#F9FAFB","BLOCKED":"#FEF2F2","IN REVIEW":"#F5F3FF",
};
const PRIORITY_COLORS = { LOW:"#10B981", MEDIUM:"#F59E0B", HIGH:"#EF4444", URGENT:"#7C3AED" };
 
export default function TableView({ tasks }) {
  const [filter,   setFilter]   = useState("");
  const [selected, setSelected] = useState([]);
 
  const filtered  = tasks.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));
  const toggleAll = (e) => setSelected(e.target.checked ? filtered.map(t => t.id) : []);
  const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
 
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
 
      {/* Toolbar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid #f5f5f5" }}>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter task title..."
          style={{ border:"1px solid #e5e7eb", borderRadius:7, padding:"7px 12px", fontSize:13, outline:"none", width:240, color:"#111" }}/>
        <button style={{ display:"flex", alignItems:"center", gap:6, border:"1px solid #e5e7eb", borderRadius:7, padding:"7px 14px", background:"#fff", fontSize:13, cursor:"pointer", color:"#374151", fontWeight:500 }}>
          Columns
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </div>
 
      {/* Table */}
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:"#f9fafb", borderBottom:"1px solid #f0f0f0" }}>
            <th style={{ width:36, padding:"10px 12px", textAlign:"center" }}>
              <input type="checkbox" onChange={toggleAll} checked={selected.length === filtered.length && filtered.length > 0}/>
            </th>
            {["Task Title","Status","Priority","Created At","Due Date","Assigned To","Attachments","Actions"].map(h => (
              <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:12, fontWeight:600, color:"#6b7280", whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0
            ? <tr><td colSpan={9} style={{ padding:32, textAlign:"center", color:"#c4c4c4", fontSize:13 }}>No tasks yet. Click "+ New Task" to create one.</td></tr>
            : filtered.map(task => (
              <tr key={task.id}
                style={{ borderBottom:"1px solid #f9fafb", background: selected.includes(task.id) ? "#f5f3ff" : "#fff" }}
                onMouseEnter={e => e.currentTarget.style.background = selected.includes(task.id) ? "#f5f3ff" : "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = selected.includes(task.id) ? "#f5f3ff" : "#fff"}>
 
                <td style={{ padding:"11px 12px", textAlign:"center" }}>
                  <input type="checkbox" checked={selected.includes(task.id)} onChange={() => toggleOne(task.id)}/>
                </td>
                <td style={{ padding:"11px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:20, height:20, borderRadius:5, background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff", flexShrink:0 }}>
                      {task.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight:500, color:"#111" }}>{task.name}</span>
                  </div>
                </td>
                <td style={{ padding:"11px 12px" }}>
                  <span style={{ background:STATUS_BG[task.status]||"#f3f4f6", color:STATUS_COLORS[task.status]||"#6b7280", padding:"3px 10px", borderRadius:5, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>
                    {task.status}
                  </span>
                </td>
                <td style={{ padding:"11px 12px" }}>
                  <span style={{ color:PRIORITY_COLORS[task.priority]||"#6b7280", fontWeight:500, fontSize:12 }}>{task.priority}</span>
                </td>
                <td style={{ padding:"11px 12px", color:"#6b7280", fontSize:12 }}>{fmtDate(task.createdAt?.split("T")[0])}</td>
                <td style={{ padding:"11px 12px", color:"#6b7280", fontSize:12 }}>{fmtDate(task.dueDate)}</td>
                <td style={{ padding:"11px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:"#fff" }}>
                      {(task.assignee||"?").charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize:12, color:"#374151" }}>{task.assignee||"—"}</span>
                  </div>
                </td>
                <td style={{ padding:"11px 12px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4, color:"#9ca3af", fontSize:12 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                    {task.attachments || 0}
                  </div>
                </td>
                <td style={{ padding:"11px 12px" }}>
                  <button style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", padding:4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                  </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
 
      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderTop:"1px solid #f5f5f5" }}>
        <span style={{ fontSize:12, color:"#9ca3af" }}>{selected.length} of {filtered.length} row(s) selected</span>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ fontSize:12, color:"#374151", border:"1px solid #e5e7eb", borderRadius:6, padding:"5px 12px", background:"#fff", cursor:"pointer" }}>Previous</button>
          <button style={{ fontSize:12, color:"#374151", border:"1px solid #e5e7eb", borderRadius:6, padding:"5px 12px", background:"#fff", cursor:"pointer" }}>Next</button>
        </div>
      </div>
    </div>
  );
}