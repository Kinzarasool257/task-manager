import { useState, useRef } from "react";

const STATUS_COLORS = {
    "TO DO": "var(--primary)",
    "IN PROGRESS": "#F59E0B",
    "COMPLETED": "#10B981",
    "BACKLOG": "var(--text-dim)",
    "BLOCKED": "#EF4444",
    "IN REVIEW": "#8B5CF6",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];



export default function CalendarView({ tasks, setTasks, members, onTaskClick }) {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [dragOverIso, setDragOverIso] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    const cellRefs = useRef({});

    // ── Navigation ──────────────────────────────────────────────────────────────
    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    // ── Build calendar grid ─────────────────────────────────────────────────────
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--)
        cells.push({ day: daysInPrev - i, currentMonth: false, date: new Date(year, month - 1, daysInPrev - i) });
    for (let d = 1; d <= daysInMonth; d++)
        cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++)
        cells.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) });

    // ── Helpers ─────────────────────────────────────────────────────────────────
    const toIso = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const getTasksForDate = (date) => {
        const iso = toIso(date);
        return tasks.filter(t => t.dueDate && (t.dueDate === iso || t.startDate === iso));
    };

    const isToday = (date) => {
        const t = new Date();
        return date.getDate() === t.getDate() &&
            date.getMonth() === t.getMonth() &&
            date.getFullYear() === t.getFullYear();
    };

    const getMemberAvatar = (name) => {
        if (!name) return "?";
        const m = (members || []).find(x => x.name === name);
        return m?.initials || name.charAt(0).toUpperCase();
    };

    // ── Pointer-based drag handlers ─────────────────────────────────────────────
    const ghostRef = useRef(null);
    const offsetRef = useRef({ x: 0, y: 0 });

    const dragData = useRef({ dragTask: null, dragFromIso: null, currentOverIso: null });
    const onPointerDownWithRef = (e, task, fromIso) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        dragData.current.dragTask = task;
        dragData.current.dragFromIso = fromIso;
        setDraggingId(task.id);

        const rect = e.currentTarget.getBoundingClientRect();
        offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        if (ghostRef.current) {
            ghostRef.current.style.display = "flex";
            ghostRef.current.style.left = (e.clientX - offsetRef.current.x) + "px";
            ghostRef.current.style.top = (e.clientY - offsetRef.current.y) + "px";
            ghostRef.current.style.width = rect.width + "px";
            ghostRef.current.style.background = STATUS_COLORS[task.status] || "#4F46E5";
            ghostRef.current.querySelector(".ghost-name").textContent = task.name;
        }

        const onMove = (ev) => {
            const cx = ev.clientX, cy = ev.clientY;
            if (ghostRef.current) {
                ghostRef.current.style.left = (cx - offsetRef.current.x) + "px";
                ghostRef.current.style.top = (cy - offsetRef.current.y) + "px";
            }
            let hit = null;
            for (const [iso, el] of Object.entries(cellRefs.current)) {
                if (!el) continue;
                const r = el.getBoundingClientRect();
                if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
                    hit = iso; break;
                }
            }
            dragData.current.currentOverIso = hit;
            setDragOverIso(hit);
        };

        const onUp = () => {
            if (ghostRef.current) ghostRef.current.style.display = "none";
            setDraggingId(null);
            setDragOverIso(null);

            const task = dragData.current.dragTask;
            const fromIso = dragData.current.dragFromIso;
            const toIso = dragData.current.currentOverIso;
            dragData.current.dragTask = null;
            dragData.current.dragFromIso = null;
            dragData.current.currentOverIso = null;

            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);

            if (!task || !toIso || toIso === fromIso) return;

            const diffDays = (new Date(toIso + "T00:00:00") - new Date(fromIso + "T00:00:00")) / 86400000;

            const shiftDate = (iso) => {
                if (!iso) return iso;
                const d = new Date(iso + "T00:00:00");
                d.setDate(d.getDate() + diffDays);
                return toIsoStatic(d);
            };

            const updated = tasks.map(t =>
                t.id === task.id
                    ? { ...t, dueDate: shiftDate(t.dueDate), startDate: shiftDate(t.startDate) }
                    : t
            );
            const changed = updated.find(t => t.id === task.id);
            setTasks(updated, changed);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    return (
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--panel-border)", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", userSelect: "none", position: "relative" }}>

            {/* ── Month nav ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--panel-border)" }}>
                <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--panel-border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>{MONTHS[month]} {year}</span>
                <button onClick={nextMonth} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--panel-border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                </button>
            </div>

            {/* ── Day headers ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--panel-border)" }}>
                {DAYS.map(d => (
                    <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", letterSpacing: "0.04em" }}>{d}</div>
                ))}
            </div>

            {/* ── Grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {cells.map((cell, idx) => {
                    const iso = toIso(cell.date);
                    const cellTasks = getTasksForDate(cell.date);
                    const today = isToday(cell.date);
                    const isOver = dragOverIso === iso;
                    const isLast = idx >= 35;

                    return (
                        <div
                            key={idx}
                            ref={el => cellRefs.current[iso] = el}
                            style={{
                                minHeight: 100,
                                borderRight: (idx + 1) % 7 === 0 ? "none" : "1px solid var(--panel-border)",
                                borderBottom: isLast ? "none" : "1px solid var(--panel-border)",
                                padding: "6px 8px",
                                background: isOver ? "var(--nav-active-bg)" : !cell.currentMonth ? "var(--surface-alt)" : "var(--surface)",
                                outline: isOver ? "2px solid var(--primary)" : "none",
                                outlineOffset: "-2px",
                                transition: "background 0.1s",
                                position: "relative",
                            }}
                        >
                            {/* Date number */}
                            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                                <span style={{
                                    fontSize: 12, fontWeight: today ? 700 : 400,
                                    color: !cell.currentMonth ? "var(--text-muted)" : today ? "#fff" : "var(--text-main)",
                                    width: 22, height: 22, borderRadius: "50%",
                                    background: today ? "var(--primary)" : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    {String(cell.day).padStart(2, "0")}
                                </span>
                            </div>

                            {/* Drop hint */}
                            {isOver && (
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                                    <span style={{ fontSize: 10, color: "var(--primary)", fontWeight: 600, background: "var(--nav-active-bg)", padding: "2px 6px", borderRadius: 4 }}>Drop here</span>
                                </div>
                            )}

                            {/* Task chips */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                {cellTasks.slice(0, 3).map((task, ti) => {
                                    const color = STATUS_COLORS[task.status] || "var(--primary)";
                                    const isGhost = draggingId === task.id;
                                    return (
                                        <div
                                            key={ti}
                                            onPointerDown={e => onPointerDownWithRef(e, task, iso)}
                                            onClick={() => onTaskClick && onTaskClick(task)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 4,
                                                background: isGhost ? color + "30" : color + "18",
                                                borderLeft: `3px solid ${color}`,
                                                borderRadius: "0 4px 4px 0",
                                                padding: "3px 5px",
                                                cursor: "pointer",
                                                opacity: isGhost ? 0.4 : 1,
                                                transition: "opacity 0.15s",
                                                touchAction: "none",
                                            }}
                                        >
                                            <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff" }}>
                                                {getMemberAvatar(task.assignee)}
                                            </div>
                                            <span style={{ fontSize: 10, fontWeight: 500, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 72 }}>
                                                {task.name}
                                            </span>
                                        </div>
                                    );
                                })}
                                {cellTasks.length > 3 && (
                                    <span style={{ fontSize: 10, color: "var(--text-muted)", paddingLeft: 4 }}>+{cellTasks.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Floating ghost card ── */}
            <div
                ref={ghostRef}
                style={{
                    display: "none", position: "fixed", zIndex: 9999, pointerEvents: "none",
                    borderRadius: 5, padding: "4px 8px", alignItems: "center", gap: 5,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                    transform: "rotate(2deg) scale(1.05)",
                    transition: "transform 0.1s",
                    minWidth: 80,
                }}
            >
                <span className="ghost-name" style={{ fontSize: 11, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }} />
            </div>
        </div>

    );
}

// Static helper (outside component, no hook issues)
function toIsoStatic(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}