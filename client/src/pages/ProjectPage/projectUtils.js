// ── Storage helpers ───────────────────────────────────────────────────────────
export const getProjects  = () => { 
  // Disable local storage for projects now that we use the database
  return []; 
};
export const saveProjects = (l) => localStorage.setItem("projects", JSON.stringify(l));

// ── Status / Priority config ──────────────────────────────────────────────────
export const STATUS_OPTIONS  = ["TO DO", "IN PROGRESS", "COMPLETED", "BACKLOG", "BLOCKED", "IN REVIEW"];
export const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const STATUS_COLORS = {
  "TO DO":       "var(--primary)",
  "IN PROGRESS": "#F59E0B",
  "COMPLETED":   "#10B981",
  "BACKLOG":     "var(--text-dim)",
  "BLOCKED":     "#EF4444",
  "IN REVIEW":   "#8B5CF6",
};

// ── Date helpers ──────────────────────────────────────────────────────────────
export const today = () => new Date().toISOString().split("T")[0];

export const fmtDate = (val) => {
  if (!val) return "—";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
};
 
export const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return "less than a minute ago";
  if (diff < 3600)  return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};