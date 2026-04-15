import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Plan config ────────────────────────────────────────────────────────────────
const PRO_FEATURES = [
    "Up to 10 Workspaces",
    "Unlimited Projects",
    "Unlimited Tasks",
    "Team Collaboration (Up to 20 Members)",
    "Calendar View",
    "Project Timeline (Gantt Chart)",
    "File Storage (10 Files Per Task)",
];

const ENTERPRISE_FEATURES = [
    "Everything in Pro Plan",
    "Unlimited Workspaces",
    "Unlimited Team Collaboration",
    "Unlimited File Storage (Fair-use Policy Applies)",
];

// Lemon Squeezy checkout URL — replace with your actual URL
const PRO_CHECKOUT_URL = "https://codewave94.lemonsqueezy.com/checkout?custom=1";
const ENTERPRISE_CHECKOUT_URL = "https://codewave94.lemonsqueezy.com/checkout?custom=2";

export default function BillingPage({ workspace }) {
    const currentPlan = workspace?.plan || "FREE";
    const navigate = useNavigate();
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const h = () => setWidth(window.innerWidth);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    const isMobile = width < 640;

    const renewalDate = "18/03/2025";
    const isActive = true;

    const card = {
        background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0",
        padding: isMobile ? "20px 16px" : "24px 28px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)", marginBottom: 20,
    };

    const handleUpgrade = (plan) => {
        const url = plan === "pro" ? PRO_CHECKOUT_URL : ENTERPRISE_CHECKOUT_URL;
        navigate(`/billing/checkout?plan=${plan}&url=${encodeURIComponent(url)}`);
    };

    return (
        <div style={{ flex: 1, overflow: "auto", background: "#f9fafb", padding: isMobile ? "16px 0" : "28px 0" }}>
            <div style={{ maxWidth: 860, margin: "0 auto", padding: isMobile ? "0 12px" : "0 32px", boxSizing: "border-box" }}>

                {/* Page header */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>Billing & Subscription</h1>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Manage your subscription and billing information</p>
                </div>

                {/* ── Subscription Details ── */}
                <div style={card}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 2px" }}>Subscription Details</h2>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 20px" }}>Manage your subscription here</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {[
                            { label: "Current Plan", value: currentPlan.toUpperCase(), color: "#111" },
                            { label: "Status", value: isActive ? "ACTIVE" : "INACTIVE", color: isActive ? "#10B981" : "#EF4444" },
                            { label: "Renewal Date", value: renewalDate, color: "#111" },
                        ].map((row, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "14px 0",
                                borderBottom: i < 2 ? "1px solid #f5f5f5" : "none",
                                flexWrap: "wrap", gap: 8,
                            }}>
                                <span style={{ fontSize: 13, color: "#6b7280" }}>{row.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: row.color }}>{row.value}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                        <button style={{ padding: "8px 18px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Cancel Subscription
                        </button>
                    </div>
                </div>

                {/* ── Available Plans ── */}
                <div style={{ marginBottom: 8 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 16px" }}>Available Plans</h2>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                        gap: 16,
                    }}>

                        {/* PRO card */}
                        <div style={{
                            background: "#fff", borderRadius: 12,
                            border: "2px solid #111827",
                            padding: isMobile ? "20px 16px" : "24px",
                            display: "flex", flexDirection: "column",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                            position: "relative",
                        }}>
                            {/* Most Popular badge */}
                            <div style={{ position: "absolute", top: 16, left: 20 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, background: "#f3f4f6", color: "#374151", padding: "3px 10px", borderRadius: 20, border: "1px solid #e5e7eb" }}>
                                    Most Popular
                                </span>
                            </div>

                            <div style={{ marginTop: 28 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>Pro</h3>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                                    <span style={{ fontSize: 28, fontWeight: 800, color: "#111" }}>$5.99</span>
                                    <span style={{ fontSize: 13, color: "#9ca3af" }}>/month</span>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, flex: 1 }}>
                                    {PRO_FEATURES.map((f, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span style={{ fontSize: 13, color: "#374151" }}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => handleUpgrade("pro")}
                                style={{ width: "100%", padding: "11px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: "auto", transition: "opacity 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                                Upgrade
                            </button>
                        </div>

                        {/* ENTERPRISE card */}
                        <div style={{
                            background: "#fff", borderRadius: 12,
                            border: "1px solid #f0f0f0",
                            padding: isMobile ? "20px 16px" : "24px",
                            display: "flex", flexDirection: "column",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                        }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>Enterprise</h3>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                                <span style={{ fontSize: 28, fontWeight: 800, color: "#111" }}>$20</span>
                                <span style={{ fontSize: 13, color: "#9ca3af" }}>/month</span>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, flex: 1 }}>
                                {ENTERPRISE_FEATURES.map((f, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span style={{ fontSize: 13, color: "#374151" }}>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade("enterprise")}
                                style={{ width: "100%", padding: "11px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: "auto", transition: "opacity 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                                Upgrade
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}