import { useMemo, useState } from "react";

const STATUS_COLORS = {
    "TO DO": "var(--primary)",
    "IN PROGRESS": "#F59E0B",
    "COMPLETED": "#10B981",
    "BACKLOG": "var(--text-dim)",
    "BLOCKED": "#EF4444",
    "IN REVIEW": "#8B5CF6",
};

const DAY_MS = 86400000;

const fmtLabel = (date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function TimelineView({ tasks, members, onTaskClick }) {

    const [tooltip, setTooltip] = useState(null); // { task, x, y }

    // ── Date range ──────────────────────────────────────────────────────────────
    const { minDate, totalDays, dateHeaders } = useMemo(() => {
        function buildRange(min, max) {
            const total = Math.round((max - min) / DAY_MS) + 1;
            const headers = [];
            for (let i = 0; i < total; i++)
                headers.push(new Date(min.getTime() + i * DAY_MS));
            return { minDate: min, totalDays: total, dateHeaders: headers };
        }

        const dated = tasks.filter(t => t.startDate && t.dueDate);
        if (dated.length === 0) {
            const s = new Date(); s.setHours(0, 0, 0, 0);
            const e = new Date(s.getTime() + 13 * DAY_MS);
            return buildRange(s, e);
        }
        const starts = dated.map(t => new Date(t.startDate + "T00:00:00").getTime());
        const ends = dated.map(t => new Date(t.dueDate + "T00:00:00").getTime());
        const min = new Date(Math.min(...starts));
        const max = new Date(Math.max(...ends));
        min.setDate(min.getDate() - 1);
        max.setDate(max.getDate() + 2);
        return buildRange(min, max);
    }, [tasks]);

    // ── Group by assignee ───────────────────────────────────────────────────────
    const grouped = useMemo(() => {
        const map = {};
        tasks.forEach(task => {
            const key = task.assignee || "Unassigned";
            if (!map[key]) map[key] = [];
            map[key].push(task);
        });
        return Object.entries(map);
    }, [tasks]);

    const getMemberInitials = (name) => {
        const m = (members || []).find(x => x.name === name);
        return m?.initials || name.charAt(0).toUpperCase();
    };

    // ── Bar geometry ────────────────────────────────────────────────────────────
    const getBar = (task) => {
        if (!task.startDate || !task.dueDate) return null;
        const s = new Date(task.startDate + "T00:00:00").getTime();
        const e = new Date(task.dueDate + "T00:00:00").getTime();
        const left = Math.max(0, (s - minDate.getTime()) / DAY_MS);
        const dur = Math.max(1, (e - s) / DAY_MS + 1);
        return { left, width: dur };
    };

    const COL_W = 80;
    const ROW_H = 52;
    const LABEL_W = 200;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayLeft = (today.getTime() - minDate.getTime()) / DAY_MS;

    const fmtShort = (iso) => {
        if (!iso) return "—";
        return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    if (tasks.length === 0) {
        return (
            <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", padding: 40, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
                No tasks yet. Create tasks with start and due dates to see the timeline.
            </div>
        );
    }

    return (
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", position: "relative" }}>
            <div style={{ overflowX: "auto" }}>
                <div style={{ minWidth: LABEL_W + totalDays * COL_W }}>

                    {/* ── Date header ── */}
                    <div style={{ display: "flex", borderBottom: "1px solid var(--panel-border)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 10 }}>
                        <div style={{ width: LABEL_W, flexShrink: 0, borderRight: "1px solid var(--panel-border)" }} />
                        <div style={{ display: "flex", flex: 1 }}>
                            {dateHeaders.map((d, i) => {
                                const isTdy = d.toDateString() === today.toDateString();
                                const isSun = d.getDay() === 0;
                                return (
                                    <div key={i} style={{
                                        width: COL_W, flexShrink: 0, padding: "10px 0",
                                        textAlign: "center", fontSize: 11,
                                        fontWeight: isTdy ? 700 : 400,
                                        color: isTdy ? "var(--primary)" : "var(--text-muted)",
                                        borderRight: "1px solid var(--panel-border)",
                                        background: isSun ? "var(--surface-alt)" : "var(--surface)",
                                    }}>
                                        {fmtLabel(d)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Assignee rows ── */}
                    {grouped.map(([assignee, assigneeTasks], gi) => (
                        <div key={gi} style={{ display: "flex", borderBottom: "1px solid var(--panel-border)" }}>

                            {/* Assignee label */}
                            <div style={{
                                width: LABEL_W, flexShrink: 0, display: "flex", alignItems: "center",
                                gap: 8, padding: "0 16px", borderRight: "1px solid var(--panel-border)",
                                minHeight: ROW_H * Math.max(assigneeTasks.length, 1),
                                alignSelf: "stretch",
                            }}>
                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                    {getMemberInitials(assignee)}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {assignee}
                                </span>
                            </div>

                            {/* Gantt bars area */}
                            <div style={{ flex: 1, position: "relative", minHeight: ROW_H * Math.max(assigneeTasks.length, 1) }}>

                                {/* Grid lines */}
                                {dateHeaders.map((d, i) => (
                                    <div key={i} style={{
                                        position: "absolute", top: 0, bottom: 0,
                                        left: i * COL_W, width: 1,
                                        background: d.getDay() === 0 ? "var(--panel-border)" : "var(--surface-alt)",
                                    }} />
                                ))}

                                {/* Today line */}
                                {todayLeft >= 0 && todayLeft <= totalDays && (
                                    <div style={{
                                        position: "absolute", top: 0, bottom: 0,
                                        left: todayLeft * COL_W + COL_W / 2,
                                        width: 2, background: "var(--primary)", opacity: 0.4, zIndex: 2,
                                        pointerEvents: "none",
                                    }} />
                                )}

                                {/* Task bars */}
                                {assigneeTasks.map((task, ti) => {
                                    const bar = getBar(task);
                                    if (!bar) return null;
                                    const color = STATUS_COLORS[task.status] || "var(--primary)";
                                    const canClick = !!onTaskClick;

                                    return (
                                        <div
                                            key={ti}
                                            onClick={() => onTaskClick && onTaskClick(task)}
                                            onMouseEnter={(e) => {
                                                if (canClick) e.currentTarget.style.filter = "brightness(0.88)";
                                                setTooltip({ task, x: e.clientX, y: e.clientY });
                                            }}
                                            onMouseMove={(e) => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
                                            onMouseLeave={(e) => {
                                                if (canClick) e.currentTarget.style.filter = "none";
                                                setTooltip(null);
                                            }}
                                            style={{
                                                position: "absolute",
                                                top: ti * ROW_H + 12,
                                                left: bar.left * COL_W,
                                                width: Math.max(bar.width * COL_W - 4, 40),
                                                height: ROW_H - 24,
                                                background: color,
                                                borderRadius: 6,
                                                display: "flex", alignItems: "center",
                                                paddingLeft: 10, paddingRight: 8,
                                                overflow: "hidden",
                                                boxShadow: `0 2px 8px ${color}55`,
                                                cursor: canClick ? "pointer" : "default",
                                                zIndex: 3,
                                                transition: "filter 0.15s",
                                                userSelect: "none",
                                            }}
                                        >
                                            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {task.name}
                                            </span>
                                            {/* Small arrow icon hint */}
                                            {canClick && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" style={{ marginLeft: "auto", flexShrink: 0 }}>
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* ── Tooltip on hover ── */}
            {tooltip && (
                <div style={{
                    position: "fixed",
                    left: tooltip.x + 14,
                    top: tooltip.y - 10,
                    background: "var(--background)",
                    color: "var(--text-main)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12,
                    zIndex: 9999,
                    pointerEvents: "none",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    border: "1px solid var(--panel-border)",
                    maxWidth: 220,
                    lineHeight: 1.6,
                }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 13 }}>{tooltip.task.name}</p>
                    <p style={{ margin: "0 0 2px", color: "var(--text-dim)" }}>
                        {fmtShort(tooltip.task.startDate)} → {fmtShort(tooltip.task.dueDate)}
                    </p>
                    <p style={{ margin: "0 0 2px", color: "var(--text-dim)" }}>Status: {tooltip.task.status}</p>
                    {tooltip.task.assignee && (
                        <p style={{ margin: 0, color: "var(--text-dim)" }}>Assignee: {tooltip.task.assignee}</p>
                    )}
                    {onTaskClick && (
                        <p style={{ margin: "6px 0 0", color: "var(--primary)", fontSize: 11 }}>Click to open task →</p>
                    )}
                </div>
            )}
        </div>

    );
}