import { useState } from "react";
import { STATUS_OPTIONS, PRIORITY_OPTIONS, today, fmtDate } from "./projectUtils";
 
export default function CreateTaskModal({ onClose, onCreate, members }) {
  const [taskName,  setTaskName]  = useState("");
  const [assignee,  setAssignee]  = useState("");
  const [priority,  setPriority]  = useState("MEDIUM");
  const [startDate, setStartDate] = useState(today());
  const [dueDate,   setDueDate]   = useState(today());
  const [status,    setStatus]    = useState("TO DO");
  const [desc,      setDesc]      = useState("");
 
  const labelStyle  = { fontSize:13, color:"var(--text-muted)", display:"block", marginBottom:6, fontWeight:500 };
  const inputStyle  = { width:"100%", border:"1px solid var(--panel-border)", borderRadius:8, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box", color:"var(--text-main)", background:"var(--surface)" };
  const selectStyle = { ...inputStyle, cursor:"pointer", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:30 };
 
  const submit = () => {
    if (!taskName.trim()) return alert("Please enter a task name.");
    onCreate({ 
      id: "task-" + Date.now(),
      name: taskName.trim(), 
      assignee, 
      priority, 
      startDate, 
      dueDate, 
      status, 
      desc, 
      createdAt: new Date().toISOString() 
    });
  };
 
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"var(--overlay-bg)", zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:500, background:"var(--surface)", borderRadius:16, padding:"28px 32px", boxShadow:"0 12px 48px rgba(0,0,0,0.18)", animation:"fadeIn 0.2s ease", maxHeight:"90vh", overflowY:"auto", border:"1px solid var(--panel-border)" }}>
 
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text-main)", margin:0 }}>Create New Task</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
 
        {/* Task Name */}
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Task Name</label>
          <input value={taskName} onChange={e => setTaskName(e.target.value)} autoFocus placeholder="Enter task name"
            style={{ ...inputStyle, border:"1.5px solid var(--text-main)" }}
            onFocus={e => e.target.style.borderColor = "var(--primary)"}
            onBlur={e  => e.target.style.borderColor = "var(--text-main)"}
          />
        </div>
 
        {/* Assignee + Priority */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
          <div>
            <label style={labelStyle}>Assignee</label>
            <select value={assignee} onChange={e => setAssignee(e.target.value)} style={selectStyle}>
              <option value="">Select assignee</option>
              {members.map((m, i) => {
                const name = m.user?.name || m.name || "Unknown Member";
                return <option key={i} value={name}>{name}</option>;
              })}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
 
        {/* Start Date + Due Date */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
          <div>
            <label style={labelStyle}>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle}/>
            {startDate && <p style={{ fontSize:11, color:"var(--text-dim)", margin:"4px 0 0" }}>{fmtDate(startDate)}</p>}
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle}/>
            {dueDate && <p style={{ fontSize:11, color:"var(--text-dim)", margin:"4px 0 0" }}>{fmtDate(dueDate)}</p>}
          </div>
        </div>
 
        {/* Status */}
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
 
        {/* Description */}
        <div style={{ marginBottom:24 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Add your description..."
            style={{ ...inputStyle, resize:"vertical" }}/>
        </div>
 
        {/* Buttons */}
        <div style={{ display:"flex", justifyContent:"flex-end", gap:12 }}>
          <button onClick={onClose} style={{ padding:"10px 20px", border:"1px solid var(--panel-border)", borderRadius:8, background:"var(--surface)", fontSize:13, fontWeight:500, cursor:"pointer", color:"var(--text-main)" }}>
            Cancel
          </button>
          <button onClick={submit} style={{ padding:"10px 24px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            Create Task
          </button>
        </div>
      </div>
    </div>

  );
}