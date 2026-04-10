// ── Storage helpers ───────────────────────────────────────────────────────────
export const getProjects  = () => { try { return JSON.parse(localStorage.getItem("projects")  || "[]"); } catch { return []; } };
export const saveProjects = (l) => localStorage.setItem("projects", JSON.stringify(l));
 
// ── Status / Priority config ──────────────────────────────────────────────────
export const STATUS_OPTIONS  = ["TO DO", "IN PROGRESS", "COMPLETED", "BACKLOG", "BLOCKED", "IN REVIEW"];
export const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];
 
export const STATUS_COLORS = {
  "TO DO":       "#4F46E5",
  "IN PROGRESS": "#F59E0B",
  "COMPLETED":   "#10B981",
  "BACKLOG":     "#6B7280",
  "BLOCKED":     "#EF4444",
  "IN REVIEW":   "#3B82F6",
};
 
// ── Date helpers ──────────────────────────────────────────────────────────────
export const today = () => new Date().toISOString().split("T")[0];
 
export const fmtDate = (iso) => {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
};
 
export const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return "less than a minute ago";
  if (diff < 3600)  return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};