import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
 
// ── Static chart data ─────────────────────────────────────────────────────────
const STATUS_DATA = ["TODO","IN_PROGRESS","BACKLOG","COMPLETED","BLOCKED","IN_REVIEW"].map(s => ({ status: s, count: 0 }));
const TREND_DATA  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({ day: d, tasks: 0 }));
 
// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, iconPath, iconColor, bgColor }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f0f0f0", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, minWidth: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 6px", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>{value}</p>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={iconPath}/>
        </svg>
      </div>
    </div>
  );
}
 
const STATS = [
  { label: "Total Projects",  value: 0, iconPath: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",                                                                                                                                                                       iconColor: "#3B82F6", bgColor: "#EFF6FF" },
  { label: "Total Tasks",     value: 0, iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",                                                                                                       iconColor: "#F97316", bgColor: "#FFF7ED" },
  { label: "My Tasks",        value: 0, iconPath: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",                                                                                                                                                                      iconColor: "#8B5CF6", bgColor: "#F5F3FF" },
  { label: "Completed Tasks", value: 0, iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                                                                                                                            iconColor: "#10B981", bgColor: "#ECFDF5" },
  { label: "Team Members",    value: 1, iconPath: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",                                                                                                                                                 iconColor: "#EF4444", bgColor: "#FEF2F2" },
];
 
export default function DashboardMain() {
  const { user } = useKindeAuth();
 
  const userInitials = user ? `${user.given_name?.charAt(0) ?? ""}${user.family_name?.charAt(0) ?? ""}`.toUpperCase() : "U";
  const userEmail    = user?.email ?? "";
  const userName     = user ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim() : "User";
 
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
 
      {/* Header */}
      <header style={{ height: 56, background: "#fff", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0 }}>Home</p>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Monitor your workspace activities and projects</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer" }}>{userInitials}</div>
        </div>
      </header>
 
      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
 
        {/* Stat cards */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {STATS.map(s => <StatCard key={s.label} {...s}/>)}
        </div>
 
        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: "0 0 16px" }}>Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={STATUS_DATA} barSize={28}>
                <XAxis dataKey="status" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f0f0f0" }} cursor={{ fill: "#f9fafb" }}/>
                <Bar dataKey="count" fill="#4F46E5" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: "0 0 4px" }}>Task Creation Trend</h3>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 16px" }}>Task creation trend (last 7 days)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5"/>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f0f0f0" }}/>
                <Line type="monotone" dataKey="tasks" stroke="#4F46E5" strokeWidth={2} dot={{ fill: "#4F46E5", r: 3 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        {/* Bottom panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: "0 0 14px" }}>Recent Members</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#4F46E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{userInitials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#9ca3af", fontSize: 11, flexShrink: 0 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {new Date().toLocaleDateString("en-GB")}
              </div>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: "0 0 14px" }}>Recent Projects</h3>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>No recent projects</p>
          </div>
        </div>
 
      </main>
    </div>
  );
}