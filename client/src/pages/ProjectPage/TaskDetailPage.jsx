import { useState } from "react";
import { fmtDate, timeAgo } from "./projectUtils";
import EditTaskModal from "./EditTaskModal";
import { UploadButton } from "../../lib/uploadthing";
const STATUS_COLORS = {
    "TO DO": "var(--primary)", "IN PROGRESS": "#F59E0B", "COMPLETED": "#10B981",
    "BACKLOG": "var(--text-dim)", "BLOCKED": "#EF4444", "IN REVIEW": "#8B5CF6",
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
const PRIORITY_BG = { 
    LOW: "rgba(16, 185, 129, 0.12)", 
    MEDIUM: "rgba(245, 158, 11, 0.12)", 
    HIGH: "rgba(239, 68, 68, 0.12)", 
    URGENT: "rgba(124, 58, 237, 0.12)" 
};

export default function TaskDetailPage({ task, project, onBack, onUpdateTask, userName }) {
    const [showEdit, setShowEdit] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState(task.comments || []);
    const [docContent, setDocContent] = useState(task.documentation || "");

    if (!task) return null;

    const handleUpdate = (updatedTask) => {
        onUpdateTask(updatedTask);
        setShowEdit(false);
    };

    const postComment = () => {
        if (!comment.trim()) return;
        const newComment = {
            id: Date.now(),
            text: comment.trim(),
            by: userName || "User",
            at: new Date().toISOString(),
        };
        const updated = [...comments, newComment];
        setComments(updated);
        setComment("");
        // Persist comment into task
        onUpdateTask({ ...task, comments: updated });
    };

    const attachments = Array.isArray(task.attachments) ? task.attachments : [];

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--background)", overflow: "hidden" }}>

            {/* ── Top bar ── */}
            <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--panel-border)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <button onClick={onBack}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: 13, padding: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    Back
                </button>
                <span style={{ color: "var(--panel-border)" }}>|</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Projects</span>
                <span style={{ color: "var(--panel-border)" }}>›</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{project?.name}</span>
                <span style={{ color: "var(--panel-border)" }}>›</span>
                <span style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 500 }}>{task.name}</span>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, maxWidth: 1100 }}>

                    {/* ── LEFT: main content ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Task title card */}
                        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                                <div>
                                    <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-main)", margin: "0 0 6px" }}>{task.name}</h1>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 20, height: 20, borderRadius: 5, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>
                                            {project?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{project?.name}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    {task.assignee && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Assigned to</span>
                                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                                                {task.assignee.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 500 }}>{task.assignee}</span>
                                        </div>
                                    )}
                                    <button onClick={() => setShowEdit(true)}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", color: "var(--text-main)" }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        Edit Task
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", margin: "0 0 10px" }}>Description</h3>
                            <p style={{ fontSize: 13, color: task.desc ? "var(--text-main)" : "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                                {task.desc || "No description added yet."}
                            </p>
                        </div>

                        {/* Additional Details */}
                        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", margin: "0 0 16px" }}>Additional Details</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                <div>
                                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</p>
                                    <span style={{
                                        display: "inline-block", padding: "3px 12px", borderRadius: 5, fontSize: 12, fontWeight: 600,
                                        background: STATUS_BG[task.status] || "var(--surface-alt)",
                                        color: STATUS_COLORS[task.status] || "var(--text-muted)",
                                    }}>
                                        {task.status?.replace(/ /g, "_")}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Due Date</p>
                                    <p style={{ fontSize: 13, color: "var(--text-main)", margin: 0, fontWeight: 500 }}>
                                        {task.dueDate ? fmtDate(task.dueDate) : "—"}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Priority</p>
                                    <span style={{
                                        display: "inline-block", padding: "3px 12px", borderRadius: 5, fontSize: 12, fontWeight: 600,
                                        background: PRIORITY_BG[task.priority] || "var(--surface-alt)",
                                        color: PRIORITY_COLORS[task.priority] || "var(--text-muted)",
                                    }}>
                                        {task.priority}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Start Date</p>
                                    <p style={{ fontSize: 13, color: "var(--text-main)", margin: 0, fontWeight: 500 }}>
                                        {task.startDate ? fmtDate(task.startDate) : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Documentation / rich text area */}
                        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", margin: "0 0 12px" }}>Documentation</h3>

                            {/* Fake toolbar */}
                            <div style={{ display: "flex", gap: 2, padding: "6px 8px", border: "1px solid var(--panel-border)", borderRadius: "8px 8px 0 0", borderBottom: "none", background: "var(--surface-alt)", flexWrap: "wrap" }}>
                                {[
                                    { label: "B", title: "Bold", style: { fontWeight: 700 } },
                                    { label: "I", title: "Italic", style: { fontStyle: "italic" } },
                                    { label: "S", title: "Strikethrough", style: { textDecoration: "line-through" } },
                                    { label: "</>", title: "Code" },
                                    { label: "H1", title: "Heading 1" },
                                    { label: "H2", title: "Heading 2" },
                                    { label: "H3", title: "Heading 3" },
                                    { label: "≡", title: "Bullet list" },
                                    { label: "1≡", title: "Numbered list" },
                                    { label: "⇤", title: "Align left" },
                                    { label: "⇥", title: "Align center" },
                                    { label: "⇔", title: "Justify" },
                                    { label: "🔗", title: "Link" },
                                    { label: "↩", title: "Undo" },
                                    { label: "↪", title: "Redo" },
                                ].map((btn, i) => (
                                    <button key={i} title={btn.title}
                                        style={{ padding: "3px 7px", border: "none", background: "none", cursor: "pointer", fontSize: 12, color: "var(--text-dim)", borderRadius: 4, ...btn.style }}
                                        onMouseEnter={e => e.currentTarget.style.background = "var(--panel-border)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                        {btn.label}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={docContent}
                                onChange={e => setDocContent(e.target.value)}
                                placeholder="Write documentation, notes, or any details here..."
                                style={{ width: "100%", minHeight: 160, border: "1px solid var(--panel-border)", borderRadius: "0 0 8px 8px", padding: "12px", fontSize: 13, color: "var(--text-main)", background: "var(--surface)", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6 }}
                            />

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                                <button
                                    onClick={() => onUpdateTask({ ...task, documentation: docContent })}
                                    style={{ padding: "8px 20px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: comments + attachments ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Comments */}
                        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", margin: "0 0 14px" }}>Comments</h3>

                            {/* Existing comments */}
                            {comments.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
                                    {comments.map((c, i) => (
                                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                                {c.by?.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", gap: 6, alignItems: "baseline", marginBottom: 3 }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>{c.by}</span>
                                                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{timeAgo(c.at)}</span>
                                                </div>
                                                <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Comment input */}
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={3}
                                style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit", color: "var(--text-main)" }}
                                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) postComment(); }}
                            />
                            <button onClick={postComment}
                                style={{ width: "100%", marginTop: 8, padding: "8px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                Post Comment
                            </button>
                        </div>

                        {/* Attachments */}
                        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", margin: 0 }}>Attachments</h3>
                                <div style={{ transform: "scale(0.85)", transformOrigin: "right center" }}>
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
                                            onUpdateTask({ ...task, attachments: [...attachments, ...newAttachments] });
                                        }}
                                        onUploadError={(error) => {
                                            console.error("UploadThing Error Object:", error);
                                            console.error("Status Code (if any):", error.status || error.code);
                                            alert(`Upload Error: Check console for status ${error.status || error.code || 'See details'}`);
                                        }}
                                        appearance={{
                                          button: { background: "var(--primary)", fontSize: "14px", padding: "0 16px", height: "32px", width: "auto" },
                                          allowedContent: { display: "none" }
                                        }}
                                    />
                                </div>
                            </div>

                            {attachments.length === 0 ? (
                                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, textAlign: "center", padding: "16px 0" }}>No attachments found</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {attachments.map((att, i) => (
                                        <a key={i} href={att.url} download={att.name} target="_blank" rel="noreferrer"
                                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface-alt)", borderRadius: 8, border: "1px solid var(--panel-border)", textDecoration: "none" }}>
                                            {att.type === "image"
                                                ? <img src={att.url} alt={att.name} style={{ width: 36, height: 36, borderRadius: 5, objectFit: "cover", flexShrink: 0 }} />
                                                : <div style={{ width: 36, height: 36, borderRadius: 5, background: "var(--destructive)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: 0.2 }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                </div>
                                            }
                                            <div style={{ flex: 1, overflow: "hidden" }}>
                                                <p style={{ fontSize: 12, color: "var(--text-main)", fontWeight: 500, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</p>
                                                <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0 }}>{(att.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>


            {/* Edit Task Modal */}
            {showEdit && (
                <EditTaskModal
                    task={task}
                    members={project?.members || []}
                    onClose={() => setShowEdit(false)}
                    onUpdate={handleUpdate}
                />
            )}

            <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}`}</style>
        </div>
    );
}