import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject, deleteProject } from "../../lib/api";

export default function ProjectSettingsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getProjectById(id)
            .then(p => {
                setName(p.name);
                setDesc(p.description || "");
            })
            .catch(() => {
                console.error("Failed to load project");
            })
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) {
        return (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--background)" }}>
                <div style={{ width: 30, height: 30, border: "3px solid var(--panel-border)", borderTop: "3px solid var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const handleSave = async () => {
        try {
            await updateProject(id, { name, description: desc });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            alert("Failed to update project.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await deleteProject(id);
            navigate("/dashboard");
        } catch {
            alert("Failed to delete project.");
        }
    };

    const inp = { width: "100%", border: "1px solid var(--panel-border)", borderRadius: 8, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", color: "var(--text-main)", background: "var(--surface)" };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--surface-alt)" }}>
            <main style={{ flex: 1, overflow: "auto", padding: 28 }}>

                {/* Page heading */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4" /></svg>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>Project Settings</h1>
                    </div>
                    <button
                        onClick={() => navigate(`/dashboard/project/${id}`)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid var(--panel-border)", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "var(--text-main)", cursor: "pointer", fontWeight: 500 }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                        Back
                    </button>
                </div>

                {/* Edit form card */}
                <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--panel-border)", padding: "28px 28px 24px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 7, fontWeight: 500 }}>Project Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={inp}
                            onFocus={e => e.target.style.borderColor = "var(--primary)"}
                            onBlur={e => e.target.style.borderColor = "var(--panel-border)"}
                        />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 7, fontWeight: 500 }}>Description</label>
                        <textarea
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            rows={4}
                            placeholder="Enter project description"
                            style={{ ...inp, resize: "vertical" }}
                            onFocus={e => e.target.style.borderColor = "var(--primary)"}
                            onBlur={e => e.target.style.borderColor = "var(--panel-border)"}
                        />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            onClick={handleSave}
                            style={{ background: saved ? "#10B981" : "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s", minWidth: 130 }}
                        >
                            {saved ? "Saved ✓" : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Danger zone card */}
                <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid rgba(239, 68, 68, 0.3)", padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#EF4444", margin: "0 0 4px" }}>Danger Zone</h2>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "0 0 20px" }}>Irreversible actions for your project</p>
                    <button
                        onClick={handleDelete}
                        style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                        Delete Project
                    </button>
                </div>
            </main>
        </div>

    );
}

