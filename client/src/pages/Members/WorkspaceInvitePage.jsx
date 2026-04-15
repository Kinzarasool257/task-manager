import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

// ── Logo ──────────────────────────────────────────────────────────────────────
const Logo = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--primary)" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default function WorkspaceInvitePage() {
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, login } = useKindeAuth();

    const [status, setStatus] = useState("idle");   // idle | joining | success | error | already
    const [wsName, setWsName] = useState("the workspace");
    const [inviterName, setInviterName] = useState("");
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const h = () => setWidth(window.innerWidth);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    // Try to fetch workspace info from the invite link
    useEffect(() => {
        if (!inviteCode) return;
        
        const fetchInfo = async () => {
            try {
                const { getInviteInfo } = await import("../../lib/api");
                const info = await getInviteInfo(inviteCode);
                setWsName(info.name);
                setInviterName(info.inviterName);
            } catch (err) {
                console.error("Invite Fetch Error:", err);
                setStatus("error");
            }
        };

        fetchInfo();
    }, [inviteCode]);

    const isMobile = width < 640;

    const handleJoin = async () => {
        if (!isAuthenticated) {
            // Redirect to login, then back here after auth
            login({ post_login_redirect_url: window.location.href });
            return;
        }

        setStatus("joining");
        try {
            const { joinWorkspaceByInvite, syncUserWithDb } = await import("../../lib/api");
            
            // Ensure first the user exists in our DB (upsert)
            const dbUser = await syncUserWithDb(user);
            
            const res = await joinWorkspaceByInvite(inviteCode, dbUser.user.id);

            if (res.workspaceId) {
                setStatus("success");
                setTimeout(() => navigate("/dashboard"), 1500);
            } else {
                setStatus("error");
            }
        } catch (err) {
            if (err.response?.status === 409 || err.message?.includes("already")) {
                setStatus("already");
            } else {
                setStatus("error");
            }
        }
    };

    const handleCancel = () => navigate("/dashboard");

    const userName = user
        ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim()
        : "there";

    return (
        <div style={{
            minHeight: "100vh", background: "var(--background)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: isMobile ? "24px 16px" : "40px 24px",
        }}>

            {/* Logo + brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
                <Logo />
                <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-main)" }}>
                    Daily<span style={{ color: "var(--primary)" }}>TM</span>
                </span>
            </div>

            {/* Card */}
            <div style={{
                background: "var(--surface)", borderRadius: 16, border: "1px solid var(--panel-border)",
                padding: isMobile ? "28px 20px" : "40px 48px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                maxWidth: 440, width: "100%", textAlign: "center",
                animation: "popIn 0.3s ease",
            }}>

                {/* ── IDLE / default state ── */}
                {(status === "idle" || status === "joining") && (
                    <>
                        {/* Workspace icon */}
                        <div style={{
                            width: 64, height: 64, borderRadius: 16, background: "var(--primary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 24, fontWeight: 800, color: "#fff",
                            margin: "0 auto 20px",
                        }}>
                            {wsName.charAt(0).toUpperCase()}
                        </div>

                        <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: "var(--text-main)", margin: "0 0 10px" }}>
                            Join Workspace
                        </h1>

                        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, margin: "0 0 6px" }}>
                            {inviterName
                                ? <><strong style={{ color: "var(--text-main)" }}>{inviterName}</strong> has invited you to join</>
                                : "You have been invited to join"
                            }
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", margin: "0 0 28px" }}>
                            {wsName}
                        </p>

                        {isAuthenticated && (
                            <div style={{
                                background: "var(--surface-alt)", borderRadius: 10, padding: "12px 16px",
                                border: "1px solid var(--panel-border)", marginBottom: 24,
                                display: "flex", alignItems: "center", gap: 10,
                            }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                    {(user?.given_name?.charAt(0) || "U").toUpperCase()}
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: 0 }}>{userName}</p>
                                    <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0 }}>{user?.email}</p>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 10 }}>
                            <button
                                onClick={handleCancel}
                                style={{ flex: 1, padding: "11px", border: "1px solid var(--panel-border)", borderRadius: 9, background: "var(--surface)", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--text-main)" }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleJoin}
                                disabled={status === "joining"}
                                style={{
                                    flex: 2, padding: "11px", border: "none", borderRadius: 9,
                                    background: status === "joining" ? "var(--nav-active-bg)" : "var(--primary)",
                                    color: "#fff", fontSize: 13, fontWeight: 600,
                                    cursor: status === "joining" ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    transition: "background 0.2s",
                                }}>
                                {status === "joining"
                                    ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Joining...</>
                                    : isAuthenticated ? "Join Workspace" : "Sign in to Join"
                                }
                            </button>
                        </div>
                    </>
                )}

                {/* ── SUCCESS state ── */}
                {status === "success" && (
                    <>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-main)", margin: "0 0 10px" }}>You're in! 🎉</h2>
                        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 6px" }}>
                            You've successfully joined <strong style={{ color: "var(--text-main)" }}>{wsName}</strong>.
                        </p>
                        <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Redirecting to dashboard...</p>
                    </>
                )}

                {/* ── ALREADY a member ── */}
                {status === "already" && (
                    <>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--nav-active-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-main)", margin: "0 0 10px" }}>Already a member</h2>
                        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 24px" }}>
                            You're already a member of <strong style={{ color: "var(--text-main)" }}>{wsName}</strong>.
                        </p>
                        <button onClick={() => navigate("/dashboard")} style={{ width: "100%", padding: "11px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Go to Dashboard
                        </button>
                    </>
                )}

                {/* ── ERROR state ── */}
                {status === "error" && (
                    <>
                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-main)", margin: "0 0 10px" }}>Invalid invite link</h2>
                        <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "0 0 24px" }}>
                            This invite link may have expired or is invalid. Please request a new one.
                        </p>
                        <button onClick={() => navigate("/")} style={{ width: "100%", padding: "11px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Back to Home
                        </button>
                    </>
                )}

            </div>

            <style>{`
        @keyframes popIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}