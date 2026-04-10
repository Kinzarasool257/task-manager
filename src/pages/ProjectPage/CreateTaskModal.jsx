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
 
  const labelStyle  = { fontSize:13, color:"#374151", display:"block", marginBottom:6, fontWeight:500 };
  const inputStyle  = { width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box", color:"#111", background:"#fff" };
  const selectStyle = { ...inputStyle, cursor:"pointer", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:30 };
 
  const submit = () => {
    if (!taskName.trim()) return alert("Please enter a task name.");
    onCreate({ name: taskName.trim(), assignee, priority, startDate, dueDate, status, desc, createdAt: new Date().toISOString() });
  };
 
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
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
          <input value={taskName} onChange={e => setTaskName(e.target.value)} autoFocus placeholder="Enter task name"
            style={{ ...inputStyle, border:"1.5px solid #111" }}
            onFocus={e => e.target.style.borderColor = "#4F46E5"}
            onBlur={e  => e.target.style.borderColor = "#111"}
          />
        </div>
 
        {/* Assignee + Priority */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
          <div>
            <label style={labelStyle}>Assignee</label>
            <select value={assignee} onChange={e => setAssignee(e.target.value)} style={selectStyle}>
              <option value="">Select assignee</option>
              {members.map((m, i) => <option key={i} value={m.name}>{m.name}</option>)}
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
            {startDate && <p style={{ fontSize:11, color:"#9ca3af", margin:"4px 0 0" }}>{fmtDate(startDate)}</p>}
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle}/>
            {dueDate && <p style={{ fontSize:11, color:"#9ca3af", margin:"4px 0 0" }}>{fmtDate(dueDate)}</p>}
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