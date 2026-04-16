import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getWorkspaceMembers } from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import PageHeader from "./PageHeader";

// ── StatCard Component ────────────────────────────────────────────────────────
function StatCard({ label, value, iconPath, iconColor, bgColor }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--panel-border)", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, minWidth: 200, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 6px", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>{value}</p>
      </div>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={iconPath}/>
        </svg>
      </div>
    </div>
  );
}

export default function DashboardMain({ projects = [], workspace, onProjectClick }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (workspace?.id) {
      getWorkspaceMembers(workspace.id)
        .then(data => setMembers(data))
        .catch(err => console.error("DashboardMain members fetch error:", err));
    }
  }, [workspace?.id]);
 
  const userName     = user ? `${user.given_name ?? ""} ${user.family_name ?? ""}`.trim() : "User";

  // ── Data Aggregation ────────────────────────────────────────────────────────
  const allTasks = projects.flatMap(p => p.tasks || []);

  // 1. Status Data
  const statusCounts = allTasks.reduce((acc, t) => {
    const s = t.status === "DONE" ? "COMPLETED" : t.status;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const STATUS_DATA = ["TODO","IN_PROGRESS","BACKLOG","COMPLETED","BLOCKED","IN_REVIEW"].map(s => ({
    status: s.replace("_", " "),
    count: statusCounts[s] || 0
  }));

  // 2. Creation Trend (Last 7 Days)
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { 
      day: days[d.getDay()], 
      dateStr: d.toISOString().split("T")[0],
      tasks: 0 
    };
  });

  allTasks.forEach(t => {
    if (!t.createdAt) return;
    const date = t.createdAt.split("T")[0];
    const point = last7.find(p => p.dateStr === date);
    if (point) point.tasks++;
  });

  const TREND_DATA = last7.map(({ day, tasks }) => ({ day, tasks }));

  // 3. Stats Cards
  const completedCount = allTasks.filter(t => ["COMPLETED", "DONE"].includes(t.status)).length;
  const myTasksCount = allTasks.filter(t => t.assignee === userName).length;

  const STATS_DATA = [
    { label: "Total Projects",  value: projects.length, iconPath: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",                                                                                                                                                                       iconColor: "#3B82F6", bgColor: "var(--nav-active-bg)" },
    { label: "Total Tasks",     value: allTasks.length, iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",                                                                                                       iconColor: "#F97316", bgColor: "rgba(249, 115, 22, 0.1)" },
    { label: "My Tasks",        value: myTasksCount, iconPath: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",                                                                                                                                                                      iconColor: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.1)" },
    { label: "Completed Tasks", value: completedCount, iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",                                                                                                                                                                                            iconColor: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)" },
    { label: "Team Members",    value: members.length || 1, iconPath: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",                                                                                                                                                 iconColor: "#EF4444", bgColor: "rgba(239, 68, 68, 0.1)" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--background)" }}>
      <PageHeader 
        title="Home" 
        subtitle={`Monitor your workspace activities and projects (${theme} mode)`} 
      />

 
      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
 
        {/* Stat cards */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {STATS_DATA.map(s => <StatCard key={s.label} {...s}/>)}
        </div>
 
        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", margin: "0 0 16px" }}>Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={STATUS_DATA} barSize={28}>
                <XAxis dataKey="status" tick={{ fontSize: 9, fill: "var(--text-muted)" }} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--panel-border)", background: "var(--surface)", color: "var(--text-main)" }} cursor={{ fill: "var(--surface-alt)" }}/>
                <Bar dataKey="count" fill="var(--primary)" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", margin: "0 0 4px" }}>Task Creation Trend</h3>
            <p style={{ fontSize: 11, color: "var(--text-dim)", margin: "0 0 16px" }}>Task creation trend (last 7 days)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)"/>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false}/>
                <YAxis hide/>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--panel-border)", background: "var(--surface)", color: "var(--text-main)" }}/>
                <Line type="monotone" dataKey="tasks" stroke="var(--primary)" strokeWidth={2} dot={{ fill: "var(--primary)", r: 3 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        {/* Bottom panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", margin: "0 0 14px" }}>Recent Members</h3>
            {members.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No other members</p>
            ) : (
              members.slice(0, 5).map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--panel-border)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {m.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.user?.name || "Member"}</p>
                    <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.user?.email}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 11, flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    {m.role}
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", margin: "0 0 14px" }}>Recent Projects</h3>
            {projects.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No recent projects</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {projects.slice(0, 5).map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => onProjectClick && onProjectClick(p.id)}
                    style={{ 
                      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", 
                      borderRadius: 8, background: "var(--surface-alt)", cursor: "pointer", 
                      border: "1px solid transparent", transition: "all 0.15s" 
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: 0 }}>{p.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0 }}>{p.tasks?.length || 0} tasks</p>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>•</span>
                        <p style={{ fontSize: 11, color: "var(--text-dim)", margin: 0 }}>{p._count?.members || 0} members</p>
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
 
      </main>
    </div>
  );
}