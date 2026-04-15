import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserPreferences } from "../lib/api";

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function InviteIcon() {
    return (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--nav-active-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
        </div>
    );
}

function BellIcon() {
    return (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
        </div>
    );
}

function Toggle({ label, sub, checked, onChange }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--surface-alt)", borderRadius: 10, border: "1px solid var(--panel-border)" }}>
            <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: "0 0 2px" }}>{label}</p>
                <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0 }}>{sub}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                style={{
                    width: 38, height: 20, borderRadius: 20,
                    background: checked ? "var(--primary)" : "var(--panel-border)",
                    position: "relative", cursor: "pointer", border: "none",
                    transition: "background 0.2s"
                }}
            >
                <div style={{
                    width: 14, height: 14, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3, left: checked ? 21 : 3,
                    transition: "left 0.2s ease"
                }} />
            </button>
        </div>
    );
}

export default function NotificationsPage({ dbUserId }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState({});
    const [activeTab, setActiveTab] = useState("all"); // "all" or "settings"
    const [notifications, setNotifications] = useState([]);
    const [prefs, setPrefs] = useState({
        emailNotifications: true,
        taskUpdates: true,
        teamActivity: false,
    });

    useEffect(() => {
        if (dbUserId) {
            fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/users/${dbUserId}`)
                .then(r => r.json())
                .then(u => {
                    if (u.preferences) {
                        setPrefs(u.preferences);
                    }
                })
                .catch(err => console.error("Failed to fetch user preferences:", err));
                
            fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/users/${dbUserId}/notifications`)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) setNotifications(data);
                })
                .catch(err => console.error("Failed to fetch notifications:", err));
        }
    }, [dbUserId]);

    const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const handlePrefChange = async (key, val) => {
        const next = { ...prefs, [key]: val };
        setPrefs(next);
        try {
            if (dbUserId) {
                await updateUserPreferences(dbUserId, next);
            }
        } catch (err) {
            console.error("Failed to update preferences:", err);
        }
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--surface-alt)" }}>
            <main style={{ flex: 1, overflow: "auto", padding: 32, maxWidth: 780, margin: "0 auto", width: "100%" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "var(--text-main)", fontSize: 14, fontWeight: 500, padding: 0 }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    </button>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>Notifications</h1>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--panel-border)", marginBottom: 24 }}>
                    {["All", "Settings"].map(tab => {
                        const id = tab.toLowerCase();
                        const active = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    padding: "8px 4px", fontSize: 14, fontWeight: 600,
                                    color: active ? "var(--primary)" : "var(--text-dim)",
                                    borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                                    transition: "all 0.15s"
                                }}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {activeTab === "all" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {notifications.length === 0 && (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)" }}>
                                <BellIcon style={{ margin: "0 auto 12px" }} />
                                <p style={{ fontSize: 14, margin: 0 }}>You have no notifications right now.</p>
                            </div>
                        )}
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                style={{ background: n.isRead ? "var(--surface)" : "var(--nav-active-bg)", borderRadius: 12, border: "1px solid", borderColor: n.isRead ? "var(--panel-border)" : "var(--primary)", overflow: "hidden", boxShadow: n.isRead ? "0 1px 3px rgba(0,0,0,0.04)" : "0 2px 5px rgba(79, 70, 229, 0.08)" }}
                            >
                                <div
                                    style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", cursor: n.body ? "pointer" : "default" }}
                                    onClick={() => n.body && toggle(n.id)}
                                >
                                    {n.icon === "invite" ? <InviteIcon /> : <BellIcon />}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 14, color: "var(--text-main)", margin: "0 0 4px", lineHeight: 1.5 }}>
                                            {n.sender && <strong>{n.sender} </strong>}
                                            {n.title}
                                        </p>
                                        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0 }}>{timeAgo(n.createdAt)}</p>
                                    </div>
                                    {n.body && (
                                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, padding: 4 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expanded[n.id] ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {n.body && expanded[n.id] && (
                                    <div style={{ padding: "0 20px 18px 70px", borderTop: "1px solid var(--panel-border)" }}>
                                        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: "12px 0 0" }}>{n.body}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--panel-border)", padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)", margin: "0 0 6px" }}>Preference Settings</h2>
                        <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "0 0 24px" }}>Choose how you want to be notified about activity.</p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <Toggle 
                                label="Email Notifications" 
                                sub="Receive summaries of activity via email" 
                                checked={prefs.emailNotifications} 
                                onChange={(v) => handlePrefChange("emailNotifications", v)}
                            />
                            <Toggle 
                                label="Task Updates" 
                                sub="Get notified when a task is assigned or moved" 
                                checked={prefs.taskUpdates} 
                                onChange={(v) => handlePrefChange("taskUpdates", v)}
                            />
                            <Toggle 
                                label="Team Activity" 
                                sub="Notifications when members join or leave the workspace" 
                                checked={prefs.teamActivity} 
                                onChange={(v) => handlePrefChange("teamActivity", v)}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>

    );
}
