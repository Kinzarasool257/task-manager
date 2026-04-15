import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
const PLANS = {
    pro: { name: "PRO", price: "$5.99", billing: "$5.99 billed every month", label: "PRO Plan" },
    enterprise: { name: "ENTERPRISE", price: "$20.00", billing: "$20.00 billed every month", label: "Enterprise Plan" },
};

const COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "India", "Pakistan", "UAE", "Singapore",
];

const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming",
];

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const plan = PLANS[params.get("plan")] || PLANS.pro;

    const [tab, setTab] = useState("card"); // "card" | "paypal"
    const [email, setEmail] = useState("");
    const [cardName, setCardName] = useState("");
    const [country, setCountry] = useState("United States");
    const [address, setAddress] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");
    const [taxId, setTaxId] = useState("");
    const [cardNum, setCardNum] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const h = () => setWidth(window.innerWidth);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    const isMobile = width < 768;

    const inp = (extra = {}) => ({
        width: "100%", border: "1px solid var(--panel-border)", borderRadius: 8,
        padding: "10px 13px", fontSize: 13, outline: "none",
        color: "var(--text-main)", background: "var(--surface)", boxSizing: "border-box",
        fontFamily: "inherit", transition: "all 0.15s", ...extra,
    });

    const validate = () => {
        const e = {};
        if (!email.includes("@")) e.email = "Valid email required";
        if (!cardName.trim()) e.cardName = "Name required";
        if (!address.trim()) e.address = "Address required";
        if (!city.trim()) e.city = "City required";
        if (tab === "card") {
            if (cardNum.replace(/\s/g, "").length < 16) e.cardNum = "Valid card number required";
            if (!expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "Format: MM/YY";
            if (cvv.length < 3) e.cvv = "CVV required";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePay = () => {
        if (!validate()) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate("/billing/success");
        }, 2200);
    };

    const fmtCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    const fmtExp = (v) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; };

    const renderError = (k) => errors[k]
        ? <p style={{ fontSize: 11, color: "var(--destructive)", margin: "3px 0 0" }}>{errors[k]}</p>
        : null;

    return (
        <div style={{ minHeight: "100vh", background: "var(--surface-alt)", display: "flex", flexDirection: isMobile ? "column" : "row" }}>

            {/* ── LEFT: Plan summary ── */}
            <div style={{
                background: "linear-gradient(145deg, var(--primary), #7C3AED)",
                color: "#fff",
                padding: isMobile ? "32px 24px" : "48px 40px",
                display: "flex", flexDirection: "column",
                width: isMobile ? "100%" : 340, flexShrink: 0,
                minHeight: isMobile ? "auto" : "100vh",
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>D</div>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>DailyTM</span>
                </div>

                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>{plan.name}</h2>
                    <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{plan.price}</p>
                    <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 32px" }}>{plan.billing}</p>
                    <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "14px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>{plan.label}</p>
                    </div>
                </div>

                <p style={{ fontSize: 11, opacity: 0.6, marginTop: 40 }}>Secured by Stripe</p>
            </div>

            {/* ── RIGHT: Payment form ── */}
            <div style={{ flex: 1, padding: isMobile ? "24px 16px" : "48px 40px", overflowY: "auto", background: "var(--background)" }}>
                <div style={{ maxWidth: 460, margin: "0 auto" }}>

                    {/* Tab: Card / PayPal */}
                    <div style={{ display: "flex", gap: 0, border: "1px solid var(--panel-border)", borderRadius: 9, overflow: "hidden", marginBottom: 24 }}>
                        {["card", "paypal"].map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{
                                flex: 1, padding: "10px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                                background: tab === t ? "var(--surface)" : "var(--surface-alt)",
                                color: tab === t ? "var(--text-main)" : "var(--text-muted)",
                                borderRight: t === "card" ? "1px solid var(--panel-border)" : "none",
                            }}>
                                {t === "card" ? "Pay by Card" : "Pay with PayPal"}
                            </button>
                        ))}
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dim)", display: "block", marginBottom: 5 }}>Email address</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. john@example.com" type="email" style={{ ...inp(), borderColor: errors.email ? "var(--destructive)" : "var(--panel-border)" }}
                            onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = errors.email ? "var(--destructive)" : "var(--panel-border)"} />
                        {renderError("email")}
                    </div>

                    {/* Card fields (only for card tab) */}
                    {tab === "card" && (
                        <>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dim)", display: "block", marginBottom: 5 }}>Cardholder name</label>
                                <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="John More Doe" style={{ ...inp(), borderColor: errors.cardName ? "var(--destructive)" : "var(--panel-border)" }}
                                    onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = errors.cardName ? "var(--destructive)" : "var(--panel-border)"} />
                                {renderError("cardName")}
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dim)", display: "block", marginBottom: 5 }}>Card number</label>
                                <input value={cardNum} onChange={e => setCardNum(fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19}
                                    style={{ ...inp(), borderColor: errors.cardNum ? "var(--destructive)" : "var(--panel-border)" }}
                                    onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = errors.cardNum ? "var(--destructive)" : "var(--panel-border)"} />
                                {renderError("cardNum")}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dim)", display: "block", marginBottom: 5 }}>Expiry</label>
                                    <input value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5}
                                        style={{ ...inp(), borderColor: errors.expiry ? "var(--destructive)" : "var(--panel-border)" }}
                                        onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = errors.expiry ? "var(--destructive)" : "var(--panel-border)"} />
                                    {renderError("expiry")}
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dim)", display: "block", marginBottom: 5 }}>CVV</label>
                                    <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" type="password" maxLength={4}
                                        style={{ ...inp(), borderColor: errors.cvv ? "var(--destructive)" : "var(--panel-border)" }}
                                        onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = errors.cvv ? "var(--destructive)" : "var(--panel-border)"} />
                                    {renderError("cvv")}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Billing address */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dim)", display: "block", marginBottom: 5 }}>Billing address</label>
                        <select value={country} onChange={e => setCountry(e.target.value)}
                            style={{ ...inp(), marginBottom: 8, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", cursor: "pointer" }}>
                            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                        </select>

                        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address line 1"
                            style={{ ...inp(), marginBottom: 8, borderColor: errors.address ? "var(--destructive)" : "var(--panel-border)" }}
                            onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = errors.address ? "var(--destructive)" : "var(--panel-border)"} />
                        {renderError("address")}

                        {country === "United States" && (
                            <select value={state} onChange={e => setState(e.target.value)}
                                style={{ ...inp(), marginBottom: 8, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", cursor: "pointer" }}>
                                <option value="">Select a state...</option>
                                {US_STATES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div>
                                <input value={city} onChange={e => setCity(e.target.value)} placeholder="City"
                                    style={{ ...inp(), borderColor: errors.city ? "var(--destructive)" : "var(--panel-border)" }}
                                    onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = errors.city ? "var(--destructive)" : "var(--panel-border)"} />
                                {renderError("city")}
                            </div>
                            <input value={zip} onChange={e => setZip(e.target.value)} placeholder="ZIP" style={inp()}
                                onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = "var(--panel-border)"} />
                        </div>
                    </div>

                    {/* Tax ID */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-dim)", display: "block", marginBottom: 5 }}>Tax ID number <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span></label>
                        <input value={taxId} onChange={e => setTaxId(e.target.value)} style={inp()}
                            onFocus={e => e.target.style.borderColor = "var(--primary)"} onBlur={e => e.target.style.borderColor = "var(--panel-border)"} />
                    </div>

                    {/* Totals */}
                    <div style={{ borderTop: "1px solid var(--panel-border)", paddingTop: 16, marginBottom: 20 }}>
                        {[
                            { label: "Subtotal", value: plan.price },
                            { label: "Total", value: plan.price, bold: true },
                        ].map(row => (
                            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: row.bold ? 600 : 400 }}>{row.label}</span>
                                <span style={{ fontSize: 13, color: "var(--text-main)", fontWeight: row.bold ? 700 : 400 }}>{row.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Pay button */}
                    <button onClick={handlePay} disabled={loading}
                        style={{ width: "100%", padding: "13px", background: loading ? "var(--muted)" : "var(--primary)", color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}>
                        {loading
                            ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Processing...</>
                            : `Pay ${plan.price}`
                        }
                    </button>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-muted)", fontSize: 11 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                            Secured Payment
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", cursor: "pointer" }}>Terms</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", cursor: "pointer" }}>Privacy</span>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}