import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const countries = ["Pakistan", "United States", "United Kingdom", "India", "Canada", "Australia", "Germany", "France", "UAE", "Other"];
const industries = ["Technology", "Education", "Healthcare", "Finance", "Marketing", "Design", "Retail", "Other"];
const roles = ["Manager", "Developer", "Designer", "Student", "Freelancer", "CEO/Founder", "Other"];

export default function ProfileSetupPage() {
  const { user } = useKindeAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.given_name ? `${user.given_name} ${user.family_name || ""}`.trim() : "",
    country: "",
    industry: "",
    role: "",
    bio: "",
  });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleContinue = () => {
    if (!form.fullName || !form.country) return alert("Please fill in required fields.");
    navigate("/create-workspace");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "40px" }}>

        {/* Header */}
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111", margin: "0 0 6px" }}>
          Welcome to DailyTM
        </h1>
        <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 28px" }}>
          Please provide some information to get started.
        </p>

        {/* Full Name */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Full Name</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handle}
            style={inputStyle}
            placeholder="Your full name"
          />
        </div>

        {/* Country */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Country</label>
          <select name="country" value={form.country} onChange={handle} style={inputStyle}>
            <option value="">Select Country</option>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Industry + Role side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
          <div>
            <label style={labelStyle}>Industry Type</label>
            <select name="industry" value={form.industry} onChange={handle} style={inputStyle}>
              <option value="">Select Industry Type</option>
              {industries.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Role in the Organization</label>
            <select name="role" value={form.role} onChange={handle} style={inputStyle}>
              <option value="">Select Role</option>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Short Bio */}
        <div style={{ marginBottom: "28px" }}>
          <label style={labelStyle}>Short Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handle}
            rows={3}
            placeholder="Tell us about yourself..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Continue */}
        <button onClick={handleContinue} style={btnStyle}>
          Continue
        </button>

      </div>
    </div>
  );
}

const labelStyle = { fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px", fontWeight: 500 };
const inputStyle = { width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", outline: "none", boxSizing: "border-box", background: "#fff", color: "#111" };
const btnStyle = { width: "100%", background: "#111827", color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" };