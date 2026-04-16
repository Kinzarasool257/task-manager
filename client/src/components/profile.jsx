import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileDropdown({ onNavigate }) {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const dropdownRef = useRef(null);

    const userName = user ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim() : "User";
    const userEmail = user?.email || "";
    const userInitials = user
        ? `${user.given_name?.charAt(0) ?? ""}${user.family_name?.charAt(0) ?? ""}`.toUpperCase()
        : "U";

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const menuItem = (icon, label, onClick, danger = false) => (
        <button
            key={label}
            onClick={() => { setOpen(false); onClick?.(); }}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 14px", border: "none",
                background: "none", cursor: "pointer", textAlign: "left",
                fontSize: 13, color: danger ? "#EF4444" : "var(--text-main)",
                borderRadius: 7, transition: "background 0.12s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = danger ? "#FEF2F2" : "var(--surface-alt)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div ref={dropdownRef} style={{ position: "relative" }}>

            {/* ── Trigger: avatar + name ── */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "10px 12px",
                    border: "none", background: open ? "var(--surface-alt)" : "none",
                    cursor: "pointer", borderRadius: 8, transition: "background 0.12s",
                }}
                onMouseEnter={e => { if (!open) e.currentTarget.style.background = "var(--surface-alt)"; }}
                onMouseLeave={e => { if (!open) e.currentTarget.style.background = "none"; }}
            >
                {/* Avatar */}
                <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: "var(--primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                    {userInitials}
                </div>

                {/* Name + email */}
                <div style={{ flex: 1, textAlign: "left", overflow: "hidden" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
                    <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</p>
                </div>

                {/* Chevron */}
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--text-muted)" strokeWidth="2"
                    style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {/* ── Dropdown panel ── */}
            {open && (
                <div style={{
                    position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
                    background: "var(--surface)", borderRadius: 12,
                    border: "1px solid var(--panel-border)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 500, overflow: "hidden",
                    animation: "dropUp 0.15s ease",
                }}>
                    {/* User info header */}
                    <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--panel-border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                {userInitials}
                            </div>
                            <div style={{ overflow: "hidden" }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
                                <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: "6px" }}>

                        {/* Upgrade to Pro */}
                        <button
                            onClick={() => { setOpen(false); onNavigate?.("upgrade"); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                width: "100%", padding: "9px 14px", border: "none",
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                cursor: "pointer", textAlign: "left", fontSize: 13,
                                color: "#fff", borderRadius: 7, marginBottom: 4, fontWeight: 600,
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            Upgrade to Pro
                        </button>

                        <div style={{ height: 1, background: "var(--panel-border)", margin: "4px 0" }} />

                        {menuItem(
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
                            "Profile",
                            () => onNavigate?.("profile")
                        )}

                        {menuItem(
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
                            "Billing",
                            () => onNavigate?.("billing")
                        )}

                        {menuItem(
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>,
                            "Notifications",
                            () => onNavigate?.("notifications")
                        )}

                        <div style={{ height: 1, background: "var(--panel-border)", margin: "4px 0" }} />

                        {menuItem(
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
                            "Log out",
                            () => logout(),
                            true
                        )}
                    </div>
                </div>
            )}

            <style>{`
        @keyframes dropUp {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
        </div>
    );
}
