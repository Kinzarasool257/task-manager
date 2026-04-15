import { useState } from "react";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "./projectUtils";
import { UploadButton } from "../../lib/uploadthing";

const inp = {
    width: "100%", border: "1px solid var(--panel-border)", borderRadius: 8,
    padding: "9px 12px", fontSize: 13, outline: "none",
    boxSizing: "border-box", color: "var(--text-main)", background: "var(--surface)",
};
const sel = {
    ...inp, cursor: "pointer", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 30,
};
const lbl = { fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6, fontWeight: 500 };

const fmtDateInput = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const sanitizeDate = (val) => {
    if (!val) return "";
    try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split("T")[0];
    } catch {
        return "";
    }
};

export default function EditTaskModal({ task, members, onClose, onUpdate }) {
    const [name, setName] = useState(task.name || "");
    const [assignee, setAssignee] = useState(task.assignee || "");
    const [priority, setPriority] = useState(task.priority || "MEDIUM");
    const [startDate, setStartDate] = useState(sanitizeDate(task.startDate) || "");
    const [dueDate, setDueDate] = useState(sanitizeDate(task.dueDate) || "");
    const [status, setStatus] = useState(task.status || "TO DO");
    const [desc, setDesc] = useState(task.desc || "");
    const [attachments, setAttachments] = useState(Array.isArray(task.attachments) ? task.attachments : []);

    const submit = () => {
        if (!name.trim()) return alert("Task name is required.");
        onUpdate({
            ...task,
            name: name.trim(),
            assignee,
            priority,
            startDate,
            dueDate,
            status,
            desc,
            attachments,
        });
    };

    return (
        <div
            onClick={e => e.target === e.currentTarget && onClose()}
            style={{
                position: "fixed", inset: 0, background: "var(--overlay-bg)", zIndex: 800,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24
            }}
        >
            <div style={{
                width: "100%", maxWidth: 520, background: "var(--surface)", borderRadius: 16,
                padding: "28px 32px", boxShadow: "0 16px 56px rgba(0,0,0,0.22)",
                maxHeight: "90vh", overflowY: "auto", animation: "fadeIn 0.2s ease",
                border: "1px solid var(--panel-border)"
            }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>Edit Task</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* Task Name */}
                <div style={{ marginBottom: 16 }}>
                    <label style={lbl}>Task Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} style={{ ...inp, border: "1.5px solid var(--text-main)" }}
                        onFocus={e => e.target.style.borderColor = "var(--primary)"}
                        onBlur={e => e.target.style.borderColor = "var(--text-main)"} />
                </div>

                {/* Assignee + Priority */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    <div>
                        <label style={lbl}>Assignee</label>
                        <select value={assignee} onChange={e => setAssignee(e.target.value)} style={sel}>
                            <option value="">Select assignee</option>
                            {(members || []).map((m, i) => {
                                const name = m.user?.name || m.name || "Unknown Member";
                                return <option key={i} value={name}>{name}</option>;
                            })}
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>Priority</label>
                        <select value={priority} onChange={e => setPriority(e.target.value)} style={sel}>
                            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
                        </select>
                    </div>
                </div>

                {/* Start + Due Date */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    <div>
                        <label style={lbl}>Start Date</label>
                        <div style={{ position: "relative" }}>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                style={{ ...inp, paddingRight: 36, color: startDate ? "var(--text-main)" : "var(--text-dim)" }} />
                            {startDate && (
                                <p style={{ fontSize: 11, color: "var(--text-dim)", margin: "3px 0 0" }}>{fmtDateInput(startDate)}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label style={lbl}>Due Date</label>
                        <div style={{ position: "relative" }}>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                                style={{ ...inp, paddingRight: 36, color: dueDate ? "var(--text-main)" : "var(--text-dim)" }} />
                            {dueDate && (
                                <p style={{ fontSize: 11, color: "var(--text-dim)", margin: "3px 0 0" }}>{fmtDateInput(dueDate)}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div style={{ marginBottom: 16 }}>
                    <label style={lbl}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} style={sel}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                    <label style={lbl}>Description</label>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
                        placeholder="Add a description..."
                        style={{ ...inp, resize: "vertical" }} />
                </div>

                {/* Attachments */}
                <div style={{ marginBottom: 30 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <label style={lbl}>Attachments</label>
                        <div style={{ transform: "scale(0.8)", transformOrigin: "right center" }}>
                            <UploadButton
                                endpoint="taskAttachment"
                                onClientUploadComplete={(res) => {
                                    if (!res || !res.length) return;
                                    const newAttachments = res.map((f) => ({
                                        name: f.name,
                                        url: f.ufsUrl || f.url,
                                        size: f.size,
                                        type: f.type || (f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "image" : "document"),
                                        key: f.key
                                    }));
                                    setAttachments(prev => [...prev, ...newAttachments]);
                                }}
                                onUploadError={(error) => {
                                    console.error("UploadThing Error (EditModal):", error);
                                    alert(`Upload Error: status ${error.status || error.code || 'Check Console'}`);
                                }}
                                appearance={{
                                    button: { background: "var(--primary)", fontSize: "14px", padding: "0 16px", height: "32px", width: "auto" },
                                    allowedContent: { display: "none" }
                                }}
                            />
                        </div>
                    </div>
                    
                    {attachments.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--surface-alt)", padding: 12, borderRadius: 8, border: "1px solid var(--panel-border)" }}>
                            {attachments.map((att, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--panel-border)" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    <span style={{ fontSize: 12, color: "var(--text-main)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
                                    <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--destructive)", padding: 2 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onClose}
                        style={{ padding: "9px 20px", border: "1px solid var(--panel-border)", borderRadius: 8, background: "var(--surface)", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--text-main)" }}>
                        Cancel
                    </button>
                    <button onClick={submit}
                        style={{ padding: "9px 24px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        Update Task
                    </button>
                </div>
            </div>
        </div>

    );
}