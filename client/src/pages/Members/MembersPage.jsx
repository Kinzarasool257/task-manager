import { useState, useEffect } from "react";
import { getWorkspaceMembers, removeMemberFromWorkspace, getWorkspaceProjects, assignMemberToProject, unassignMemberFromProject } from "../../lib/api";
import PageHeader from "../../components/PageHeader";

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
    const colors = {
        OWNER:  { bg: "rgba(239, 68, 68, 0.12)", color: "#EF4444" },
        ADMIN:  { bg: "rgba(59, 130, 246, 0.12)", color: "#3B82F6" },
        MEMBER: { bg: "rgba(16, 185, 129, 0.12)", color: "#10B981" },
        VIEWER: { bg: "var(--surface-alt)",       color: "var(--text-dim)" },
    };
    const c = colors[role?.toUpperCase()] || colors.VIEWER;
    return (
        <span style={{ background: c.bg, color: c.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {role}
        </span>
    );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36, src }) {
    const initials = name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
    if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
    return (
        <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {initials}
        </div>
    );
}

// ── Member Details Panel ──────────────────────────────────────────────────────
function MemberDetails({ member, allProjects, assignedProjectIds, onToggleProject, onRemove, onSave }) {
    const [role] = useState(member.role || "VIEWER");

    if (!member) return null;

    return (
        <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--panel-border)", padding: "28px 28px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)", margin: "0 0 4px" }}>Member Details</h2>
            <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "0 0 24px" }}>
                View and manage {member.name}'s access and projects.
            </p>

            {/* Member header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Avatar name={member.name} size={44} src={member.avatar} />
                    <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)", margin: "0 0 2px" }}>{member.name}</p>
                        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 6px" }}>{member.email}</p>
                        <RoleBadge role={member.role} />
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button style={{ background: "none", border: "1px solid var(--panel-border)", borderRadius: 8, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>
                    </button>
                    {member.role?.toUpperCase() !== "OWNER" && (
                        <button
                            onClick={() => onRemove(member.id)}
                            style={{ display: "flex", alignItems: "center", gap: 6, background: "#EF4444", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                            Remove User
                        </button>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--panel-border)", paddingTop: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", margin: "0 0 12px" }}>Assigned Projects</h3>
                <div style={{ border: "1px solid var(--panel-border)", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--surface-alt)", padding: "10px 16px", borderBottom: "1px solid var(--panel-border)" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Project</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Access</span>
                    </div>
                    {allProjects.length === 0
                        ? <div style={{ padding: "20px 16px", textAlign: "center" }}><p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No projects found in this workspace</p></div>
                        : allProjects.map((p, i) => {
                            const isAssigned = assignedProjectIds.includes(p.id);
                            return (
                                <div key={p.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < allProjects.length - 1 ? "1px solid var(--panel-border)" : "none", background: isAssigned ? "var(--nav-active-bg-light)" : "transparent" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <input 
                                            type="checkbox" 
                                            checked={isAssigned} 
                                            onChange={() => onToggleProject(p.id, isAssigned)}
                                            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--primary)" }}
                                        />
                                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-main)" }}>{p.name}</span>
                                    </div>
                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{isAssigned ? "Assigned" : "Not assigned"}</span>
                                </div>
                            );
                        })
                    }
                </div>
            </div>

            {/* Save */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                    onClick={() => onSave(member.id, role)}
                    style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

// ── MEMBERS PAGE ──────────────────────────────────────────────────────────────
export default function MembersPage({ workspace }) {
    const [members, setMembers] = useState([]);
    const [wsProjects, setWsProjects] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (workspace?.id) {
            getWorkspaceMembers(workspace.id)
                .then(data => {
                    const mapped = data.map(m => ({
                        id: m.id,
                        name: m.user?.name || "Member",
                        email: m.user?.email || "",
                        role: m.role,
                        avatar: m.user?.image,
                        projects: m._count?.projects || 0,
                        projectIds: m.projects?.map(p => p.id) || []
                    }));
                    setMembers(mapped);
                    if (mapped.length > 0) setSelectedId(mapped[0].id);
                })
                .catch(() => console.error("Failed to fetch members:"));

            getWorkspaceProjects(workspace.id)
                .then(data => setWsProjects(data))
                .catch(err => console.error("Failed to fetch workspace projects:", err));
        }
    }, [workspace?.id]);

    const selectedMember = members.find(m => m.id === selectedId);
    const currentAssignedIds = selectedMember?.projectIds || [];

    const handleToggleProject = async (projectId, isAssigned) => {
        if (!selectedId) return;
        try {
            if (isAssigned) {
                await unassignMemberFromProject(projectId, selectedId);
            } else {
                await assignMemberToProject(projectId, selectedId);
            }
            
            setMembers(prev => prev.map(m => {
                if (m.id === selectedId) {
                    const nextIds = isAssigned 
                        ? m.projectIds.filter(id => id !== projectId)
                        : [...m.projectIds, projectId];
                    return { ...m, projectIds: nextIds, projects: nextIds.length };
                }
                return m;
            }));
        } catch (err) {
            console.error("Failed to toggle project assignment:", err);
            alert("Failed to update project assignment.");
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm("Remove this member from the workspace?")) return;
        try {
            await removeMemberFromWorkspace(id);
            setMembers(prev => prev.filter(m => m.id !== id));
            if (selectedId === id) {
                const next = members.find(m => m.id !== id);
                setSelectedId(next?.id || null);
            }
        } catch {
            alert("Failed to remove member.");
        }
    };

    const handleSave = (id, role) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
        alert("Role updated (Local view)!");
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            <PageHeader title="Members" subtitle="Manage your workspace members and their access levels" />

            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 max-w-6xl mx-auto">

                    {/* Left: Members list */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm self-start">
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-main)", margin: "0 0 4px" }}>Workspace Members</h2>
                        <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "0 0 20px" }}>Manage your workspace members.</p>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {members.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => setSelectedId(m.id)}
                                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, cursor: "pointer", background: selectedId === m.id ? "var(--nav-active-bg)" : "var(--surface-alt)", border: selectedId === m.id ? "1px solid var(--primary)" : "1px solid transparent", transition: "all 0.15s" }}
                                >
                                    <Avatar name={m.name} size={36} src={m.avatar} />
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: "0 0 4px" }}>{m.name}</p>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <RoleBadge role={m.role} />
                                            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>| {m.projects} project(s)</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Member details */}
                    {selectedMember && (
                        <MemberDetails
                            member={selectedMember}
                            allProjects={wsProjects}
                            assignedProjectIds={currentAssignedIds}
                            onToggleProject={handleToggleProject}
                            onRemove={handleRemove}
                            onSave={handleSave}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}