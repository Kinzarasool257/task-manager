import { useNavigate } from "react-router-dom";

const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#EC4899", "#14B8A6"];
const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    dur: 2.5 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
    borderRadius: Math.random() > 0.5 ? "50%" : 2,
    translateX: Math.random() > 0.5 ? 60 : -60
}));

// ── Confetti particle ──────────────────────────────────────────────────────────
function Confetti() {

    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
            {pieces.map(p => (
                <div key={p.id} style={{
                    position: "absolute",
                    left: `${p.left}%`,
                    top: "-20px",
                    width: p.size, height: p.size,
                    background: p.color,
                    borderRadius: p.borderRadius,
                    animation: `fall ${p.dur}s ${p.delay}s ease-in forwards`,
                    transform: `rotate(${p.rotate}deg)`,
                }} />
            ))}
            <style>{`
        @keyframes fall {
          0%   { top: -20px; opacity: 1; transform: rotate(0deg) translateX(0); }
          100% { top: 110vh; opacity: 0; transform: rotate(720deg) translateX(${p => p.translateX}px); }
        }
      `}</style>
        </div>
    );
}

export default function BillingSuccessPage() {
    const navigate = useNavigate();

    // Auto-redirect countdown
    return (
        <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
            <Confetti />

            {/* Content card */}
            <div style={{
                maxWidth: 500, width: "100%", background: "var(--surface)", borderRadius: 24,
                padding: "48px 32px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
                border: "1px solid var(--panel-border)", zIndex: 10, animation: "popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}>
                <div style={{
                    width: 80, height: 80, borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
                    animation: "scaleIn 0.5s 0.2s both"
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)", margin: "0 0 12px" }}>Payment Successful!</h1>
                <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.6, margin: "0 0 32px" }}>
                    Welcome to the Pro family. Your account has been upgraded and all features are now unlocked.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button onClick={() => navigate("/dashboard")}
                        style={{ padding: "14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                        Go to Dashboard
                    </button>
                    <button onClick={() => navigate("/settings")}
                        style={{ padding: "14px", background: "none", color: "var(--text-muted)", border: "none", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                        View Billing Settings
                    </button>
                </div>
            </div>

            {/* Info section */}
            <div style={{ marginTop: 40, maxWidth: 400, textAlign: "center", zIndex: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", marginBottom: 16 }}>WHAT'S NEXT?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[
                        { t: "Exclusive Features", d: "You now have access to advanced charts, unlimited tasks and more." },
                        { t: "Priority Support", d: "Need help? Our team is now available to you with priority response." },
                    ].map((idx, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, textAlign: "left" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", marginTop: 6 }} />
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", margin: "0 0 2px" }}>{idx.t}</p>
                                <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0 }}>{idx.d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes popIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
}
