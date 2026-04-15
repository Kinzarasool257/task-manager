import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { syncUserWithDb } from "../lib/api";

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

  const [isSyncing, setIsSyncing] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleContinue = async () => {
    if (!form.fullName || !form.country) return alert("Please fill in required fields.");
    
    setIsSyncing(true);
    try {
      // Sync user with database + initial preferences
      const response = await syncUserWithDb(user, {
        industry: form.industry,
        role: form.role,
        country: form.country,
        bio: form.bio
      });
      
      const dbUserId = response.user.id;
      
      // Store the internal DB ID in localStorage so the next pages can use it
      localStorage.setItem("db_user_id", dbUserId);
      
      navigate("/create-workspace");
    } catch {
      alert("Failed to sync profile. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "var(--surface)", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "40px", border: "1px solid var(--panel-border)" }}>

        {/* Header */}
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-main)", margin: "0 0 6px" }}>
          Welcome to DailyTM
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-dim)", margin: "0 0 28px" }}>
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
            <label style={labelStyle}>Role</label>
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
        <button 
          onClick={handleContinue} 
          disabled={isSyncing}
          style={{...btnStyle, opacity: isSyncing ? 0.7 : 1, cursor: isSyncing ? "not-allowed" : "pointer"}}
        >
          {isSyncing ? "Syncing Profile..." : "Continue"}
        </button>

      </div>
    </div>
  );
}

const labelStyle = { fontSize: "13px", color: "var(--text-main)", display: "block", marginBottom: "6px", fontWeight: 500 };
const inputStyle = { width: "100%", border: "1.5px solid var(--panel-border)", borderRadius: "8px", padding: "9px 12px", fontSize: "13px", outline: "none", boxSizing: "border-box", background: "var(--surface-alt)", color: "var(--text-main)" };
const btnStyle = { width: "100%", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" };