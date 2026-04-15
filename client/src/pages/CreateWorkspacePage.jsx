import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkspace, syncUserWithDb } from "../lib/api";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export default function CreateWorkspacePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const { user } = useKindeAuth();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return alert("Please enter a workspace name.");
    
    setIsCreating(true);
    try {
      let ownerId = localStorage.getItem("db_user_id");
      
      // Fallback: If ID is missing, try to sync again
      if (!ownerId && user) {
        console.log("Owner ID missing, attempting fallback sync...");
        const response = await syncUserWithDb(user);
        ownerId = response.user.id;
        localStorage.setItem("db_user_id", ownerId);
      }

      if (!ownerId) {
        throw new Error("User session not found. Please refresh and try again.");
      }

      await createWorkspace(name.trim(), ownerId);
      
      // We still update workspaceName for legacy UI sidebars if needed, 
      // but the real source of truth is now the DB.
      localStorage.setItem("workspaceName", name.trim()); 
      
      navigate("/dashboard?created=true");
    } catch (error) {
      const serverError = error.response?.data?.details || error.response?.data?.error || error.message;
      alert(`Failed to create workspace: ${serverError}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "520px", background: "var(--surface)", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "48px", border: "1px solid var(--panel-border)" }}>

        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-main)", margin: "0 0 8px" }}>
          Create New Workspace
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-dim)", margin: "0 0 36px" }}>
          Set up a new workspace for yourself and or your team
        </p>

        {/* Workspace Name */}
        <div style={{ marginBottom: "22px" }}>
          <label style={labelStyle}>Workspace Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="My Workspace"
            style={{ ...inputStyle, border: "2px solid var(--text-main)" }}
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
            style={{ padding: "10px 24px", border: "1px solid var(--panel-border)", borderRadius: "8px", background: "var(--surface)", fontSize: "14px", fontWeight: 500, cursor: "pointer", color: "var(--text-main)" }}
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate} 
            disabled={isCreating}
            style={{...btnStyle, opacity: isCreating ? 0.7 : 1, cursor: isCreating ? "not-allowed" : "pointer"}}
          >
            {isCreating ? "Creating Workspace..." : "Create Workspace"}
          </button>
        </div>

      </div>
    </div>
  );
}

const labelStyle = { fontSize: "13px", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontWeight: 500 };
const inputStyle = { width: "100%", border: "1px solid var(--panel-border)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "var(--surface)", color: "var(--text-main)" };
const btnStyle = { flex: 1, background: "var(--primary)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" };