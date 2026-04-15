import { useState, useEffect } from "react";

export default function SettingsPage({ workspace, onWorkspaceUpdate, onDeleteWorkspace }) {
    const [name, setName] = useState(workspace?.name || "My Workspace");
    const [description, setDescription] = useState(workspace?.description || "");
    const [email, setEmail] = useState("");
    
    // Use the real persistent invite code from the workspace prop
    const inviteCode = workspace?.inviteCode || "code-loading";
    const appUrl = window.location.origin; // Dynamically gets the base URL (localhost, or production domain)
    const inviteLink = `${appUrl}/workspace-invite/${workspace?.id}/join/${inviteCode}`;
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");
    const [inviteMsg, setInviteMsg] = useState("");
    const [width, setWidth] = useState(window.innerWidth);

    const [_loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    const isMobile = width < 640;

    useEffect(() => {
        if (workspace?.id) {
            import("../../lib/api").then(api => {
                api.getWorkspaceMembers(workspace.id).then(setMembers).catch(console.error);
            });
        }
    }, [workspace?.id]);

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            const { updateWorkspace } = await import("../../lib/api");
            const updated = await updateWorkspace(workspace.id, { name: name.trim(), description });
            onWorkspaceUpdate?.(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            alert("Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleResetLink = async () => {
        if (!window.confirm("Are you sure you want to reset the invite link? The old link will stop working immediately.")) return;
        setLoading(true);
        try {
            const { resetWorkspaceInviteCode } = await import("../../lib/api");
            const updated = await resetWorkspaceInviteCode(workspace.id);
            // Notify the parent so the sidebar and state update
            onWorkspaceUpdate?.(updated);
        } catch {
            alert("Failed to reset invite link.");
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!email.trim() || !email.includes("@")) {
            setInviteMsg("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            const { inviteMemberToWorkspace } = await import("../../lib/api");
            const newMember = await inviteMemberToWorkspace(workspace.id, email.trim());
            setMembers(prev => [...prev, newMember]);
            setInviteMsg(`Invite sent to ${email}`);
            setEmail("");
            setTimeout(() => setInviteMsg(""), 3000);
        } catch (err) {
            setInviteMsg(err.response?.data?.error || "Failed to invite member.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (deleteInput !== name) return;
        setLoading(true);
        try {
            const { deleteWorkspace } = await import("../../lib/api");
            await deleteWorkspace(workspace.id);
            onDeleteWorkspace?.(workspace.id);
        } catch {
            alert("Failed to delete workspace.");
        } finally {
            setLoading(false);
        }
    };

    // ── Shared styles ──────────────────────────────────────────────────────────
    const inp = {
        width: "100%", border: "1.5px solid var(--panel-border)", borderRadius: 8,
        padding: "9px 13px", fontSize: 13, outline: "none",
        color: "var(--text-main)", background: "var(--surface-alt)", boxSizing: "border-box",
        fontFamily: "inherit",
    };

    const card = {
        background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)",
        padding: isMobile ? "20px 16px" : "24px 28px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        marginBottom: 16,
    };

    const sectionTitle = { fontSize: 15, fontWeight: 700, color: "var(--text-main)", margin: 0 };
    const sectionSub = { fontSize: 13, color: "var(--text-dim)", margin: "4px 0 20px" };
    const fieldLabel = { fontSize: 13, color: "var(--text-main)", fontWeight: 500, display: "block", marginBottom: 6 };

    return (
        <div style={{ flex: 1, overflow: "auto", background: "var(--background)", padding: isMobile ? "16px 0" : "24px 0" }}>
            <div style={{
                width: "100%",
                maxWidth: 780,           // wider than before — was 560
                margin: "0 auto",
                padding: isMobile ? "0 12px" : "0 32px",
                boxSizing: "border-box",
            }}>

                {/* Page title */}
                <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)", margin: "0 0 20px" }}>Settings</h1>

                {/* ════════════════════════════════════════
            WORKSPACE SETTINGS
        ════════════════════════════════════════ */}
                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                        <h2 style={sectionTitle}>Workspace Settings</h2>
                    </div>
                    <p style={sectionSub}>Manage your workspace settings and preferences</p>

                    {/* Name + Description side by side on desktop */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 14,
                        marginBottom: 16,
                    }}>
                        <div>
                            <label style={fieldLabel}>Workspace Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={inp}
                                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                                onBlur={e => e.target.style.borderColor = "var(--panel-border)"}
                            />
                        </div>
                        <div>
                            <label style={fieldLabel}>Description</label>
                            <input
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Enter workspace description"
                                style={inp}
                                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                                onBlur={e => e.target.style.borderColor = "var(--panel-border)"}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            onClick={handleSave}
                            style={{ padding: "8px 20px", background: saved ? "#10B981" : "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
                            {saved ? "✓ Saved!" : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* ════════════════════════════════════════
            INVITE MEMBERS
        ════════════════════════════════════════ */}
                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2, flexWrap: "wrap", gap: 6 }}>
                        <h2 style={sectionTitle}>Invite Members</h2>
                        <span style={{ fontSize: 12, color: "var(--text-dim)", background: "var(--surface-alt)", padding: "2px 10px", borderRadius: 20 }}>
                            {members.length === 0 ? "1 Only you" : `${members.length + 1} members`}
                        </span>
                    </div>
                    <p style={sectionSub}>Add new members to your workspace</p>

                    {/* Email + button */}
                    <div style={{ display: "flex", gap: 10, marginBottom: inviteMsg ? 8 : 14 }}>
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            type="email"
                            style={{ ...inp, flex: 1 }}
                            onFocus={e => e.target.style.borderColor = "var(--primary)"}
                            onBlur={e => e.target.style.borderColor = "var(--panel-border)"}
                            onKeyDown={e => e.key === "Enter" && handleInvite()}
                        />
                        <button
                            onClick={handleInvite}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                            Invite
                        </button>
                    </div>

                    {inviteMsg && (
                        <p style={{ fontSize: 12, color: inviteMsg.startsWith("Invite sent") ? "#10B981" : "#EF4444", margin: "0 0 12px", fontWeight: 500 }}>
                            {inviteMsg}
                        </p>
                    )}

                    {/* Invite link box */}
                    <div style={{ border: "1px solid var(--panel-border)", borderRadius: 8, padding: "10px 14px", background: "var(--surface-alt)" }}>
                        <p style={{ fontSize: 11, color: "var(--text-dim)", margin: "0 0 8px", wordBreak: "break-all", lineHeight: 1.5 }}>
                            {inviteLink}
                        </p>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <button
                                onClick={handleCopy}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", border: "1px solid var(--panel-border)", borderRadius: 6, background: "var(--surface)", fontSize: 12, cursor: "pointer", color: "var(--text-main)", fontWeight: 500 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                                {copied ? "Copied!" : "Copy"}
                            </button>
                            <button
                                onClick={handleResetLink}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 6, background: "rgba(239, 68, 68, 0.1)", fontSize: 12, cursor: "pointer", color: "#EF4444", fontWeight: 500 }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Member list */}
                    {members.length > 0 && (
                        <div style={{ marginTop: 16, borderTop: "1px solid var(--panel-border)", paddingTop: 14 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px" }}>Members</p>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                                gap: 8,
                            }}>
                                {members.map((m, i) => (
                                    <div key={m.id || i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface-alt)", borderRadius: 8, border: "1px solid var(--panel-border)" }}>
                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                            {m.user?.name?.charAt(0).toUpperCase() || m.user?.email?.charAt(0).toUpperCase() || "M"}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-main)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.user?.name || m.user?.email}</p>
                                            <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0 }}>{m.role}</p>
                                        </div>
                                        <span style={{ fontSize: 11, color: "var(--text-dim)", background: "var(--surface)", border: "1px solid var(--panel-border)", padding: "1px 8px", borderRadius: 4, flexShrink: 0 }}>Member</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ════════════════════════════════════════
            DANGER ZONE
        ════════════════════════════════════════ */}
                <div style={{ ...card, border: "1px solid rgba(239, 68, 68, 0.3)", marginBottom: 32 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#EF4444", margin: "0 0 2px" }}>Danger Zone</h2>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "0 0 16px" }}>
                        Irreversible actions for your workspace
                    </p>

                    {!showDelete ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "14px 16px", background: "rgba(239, 68, 68, 0.1)", borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: "0 0 2px" }}>Delete this workspace</p>
                                <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0 }}>Once deleted, all projects and tasks will be permanently removed.</p>
                            </div>
                            <button
                                onClick={() => setShowDelete(true)}
                                style={{ padding: "8px 18px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                                Delete Workspace
                            </button>
                        </div>
                    ) : (
                        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, padding: "16px" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: "0 0 4px" }}>
                                Are you absolutely sure?
                            </p>
                            <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 12px", lineHeight: 1.6 }}>
                                Type <strong style={{ color: "var(--text-main)" }}>{name}</strong> to confirm deletion. This action cannot be undone and will permanently delete all projects, tasks, and data.
                            </p>
                            <input
                                value={deleteInput}
                                onChange={e => setDeleteInput(e.target.value)}
                                placeholder={`Type "${name}" to confirm`}
                                style={{ ...inp, marginBottom: 12, border: "1px solid rgba(239, 68, 68, 0.3)" }}
                                onFocus={e => e.target.style.borderColor = "#EF4444"}
                                onBlur={e => e.target.style.borderColor = "rgba(239, 68, 68, 0.3)"}
                            />
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button
                                    onClick={() => { setShowDelete(false); setDeleteInput(""); }}
                                    style={{ padding: "8px 18px", border: "1px solid var(--panel-border)", borderRadius: 7, background: "var(--surface)", fontSize: 13, cursor: "pointer", color: "var(--text-main)" }}>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteInput !== name}
                                    style={{ padding: "8px 18px", background: deleteInput === name ? "#EF4444" : "var(--surface-alt)", color: deleteInput === name ? "#fff" : "var(--text-dim)", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: deleteInput === name ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                                    Delete Workspace
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}