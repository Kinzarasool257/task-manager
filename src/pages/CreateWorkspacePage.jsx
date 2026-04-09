import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateWorkspacePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return alert("Please enter a workspace name.");
    // Save to localStorage for now
    localStorage.setItem("workspace", JSON.stringify({ name, desc }));
    localStorage.setItem("workspaceName", name); 
    navigate("/dashboard?created=true");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "520px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "48px" }}>

        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111", margin: "0 0 8px" }}>
          Create New Workspace
        </h1>
        <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 36px" }}>
          Set up a new workspace for yourself and or your team
        </p>

        {/* Workspace Name */}
        <div style={{ marginBottom: "22px" }}>
          <label style={labelStyle}>Workspace Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="My Workspace"
            style={{ ...inputStyle, border: "2px solid #111" }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: "36px" }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Enter workspace description"
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: "10px 24px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#fff", fontSize: "14px", fontWeight: 500, cursor: "pointer", color: "#374151" }}
          >
            Cancel
          </button>
          <button onClick={handleCreate} style={btnStyle}>
            Create Workspace
          </button>
        </div>

      </div>
    </div>
  );
}

const labelStyle = { fontSize: "13px", color: "#374151", display: "block", marginBottom: "6px", fontWeight: 500 };
const inputStyle = { width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "#fff", color: "#111" };
const btnStyle = { flex: 1, background: "#111827", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" };