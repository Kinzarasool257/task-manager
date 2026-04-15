import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const FEATURES = [
  { text: "Unlimited Projects & Workspaces", pro: true },
  { text: "Advanced Gantt Charts & Timelines", pro: true },
  { text: "Custom Branding & White-labeling", pro: true },
  { text: "AI-Powered Task Descriptions", pro: true },
  { text: "Priority 24/7 Support", pro: true },
  { text: "unlimited Team Members", pro: true },
  { text: "Detailed Analytics & Reporting", pro: true },
  { text: "Data Export (CSV/JSON/PDF)", pro: true },
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div style={{ flex: 1, overflow: "auto", background: "var(--surface-alt)", display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px" }}>
      
      {/* Header section */}
      <div style={{ textAlign: "center", maxWidth: 700, marginBottom: 50 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: "var(--nav-active-bg)", color: "var(--nav-active-text)", fontSize: 13, fontWeight: 700, marginBottom: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
           DailyTM Pro
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text-main)", marginBottom: 16 }}>Elevate Your Teams Productivity</h1>
        <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.6 }}>
          Unlock the full potential of your workspace with Pro features designed for high-performing teams and enterprise-level management.
        </p>
      </div>

      {/* Pricing Card */}
      <div style={{ 
        width: "100%", maxWidth: 440, background: "var(--surface)", 
        borderRadius: 24, padding: 40, border: "1px solid var(--panel-border)", 
        boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.3)" : "0 20px 40px rgba(0,0,0,0.06)",
        position: "relative", overflow: "hidden"
      }}>
        {/* Decorative background element */}
        <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, var(--nav-active-bg) 0%, transparent 70%)", opacity: 0.5, zIndex: 0 }}></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 30 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Pro Plan</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: "var(--text-main)" }}>$19</span>
              <span style={{ fontSize: 16, color: "var(--text-dim)" }}>/month</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 12 }}>Billed monthly. Cancel anytime.</p>
          </div>

          <button 
            onClick={() => navigate("/billing/checkout")}
            style={{ 
              width: "100%", background: "var(--primary)", color: "#fff", border: "none", 
              borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700, 
              cursor: "pointer", transition: "transform 0.2s", marginBottom: 32 
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            Upgrade Now
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>Whats included:</p>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: "var(--nav-active-bg)", borderRadius: "50%", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--nav-active-text)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: 14, color: "var(--text-main)", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
           Go back to Dashboard
        </button>
      </div>

    </div>
  );
}
