import { useState, useRef, useCallback } from "react";
import { updateTask } from "../../lib/api";



const KANBAN_COLS = ["TO DO", "IN PROGRESS", "COMPLETED", "BLOCKED", "BACKLOG", "IN REVIEW"];

const COL_COLORS = {
  "TO DO": "var(--primary)", "IN PROGRESS": "#F59E0B", "COMPLETED": "#10B981",
  "BLOCKED": "#EF4444", "BACKLOG": "var(--text-dim)", "IN REVIEW": "#8B5CF6",
};

const UI_TO_DB_STATUS = {
  "TO DO": "TODO",
  "IN PROGRESS": "IN_PROGRESS",
  "COMPLETED": "DONE",
  "BLOCKED": "BLOCKED",
  "BACKLOG": "BACKLOG",
  "IN_REVIEW": "IN_REVIEW"
};

const PRI_COLOR = { LOW: "#10B981", MEDIUM: "#F59E0B", HIGH: "#EF4444", URGENT: "#7C3AED" };

const PRI_BG = { 
  LOW: "rgba(16, 185, 129, 0.12)", 
  MEDIUM: "rgba(245, 158, 11, 0.12)", 
  HIGH: "rgba(239, 68, 68, 0.12)", 
  URGENT: "rgba(124, 58, 237, 0.12)" 
};



export default function KanbanView({ tasks, setTasks, onTaskClick, projectName }) {

  const [dragging, setDragging] = useState(null); // { task, fromCol, x, y, w, h }

  const [overCol, setOverCol] = useState(null);

  const colRefs = useRef({});

  const ghostRef = useRef(null);

  const pointerStart = useRef(null);



  // ── find which column the pointer is over ──

  const getColAtPoint = useCallback((x, y) => {

    for (const col of KANBAN_COLS) {

      const el = colRefs.current[col];

      if (!el) continue;

      const r = el.getBoundingClientRect();

      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return col;

    }

    return null;

  }, []);



  // ── pointer down on a card ──

  const onPointerDown = (e, task, col) => {

    if (e.button !== 0) return;

    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();

    pointerStart.current = { x: e.clientX, y: e.clientY };



    const info = {

      task, fromCol: col,

      x: rect.left, y: rect.top, w: rect.width, h: rect.height,

      offX: e.clientX - rect.left, offY: e.clientY - rect.top,

    };

    setDragging(info);

    setOverCol(col);



    const onMove = (ev) => {

      const cx = ev.clientX ?? ev.touches?.[0]?.clientX;

      const cy = ev.clientY ?? ev.touches?.[0]?.clientY;

      if (ghostRef.current) {

        ghostRef.current.style.left = (cx - info.offX) + "px";

        ghostRef.current.style.top = (cy - info.offY) + "px";

      }

      const hit = getColAtPoint(cx, cy);

      setOverCol(hit);

    };



    const onUp = (ev) => {

      const cx = ev.clientX ?? ev.changedTouches?.[0]?.clientX;

      const cy = ev.clientY ?? ev.changedTouches?.[0]?.clientY;

      const targetCol = getColAtPoint(cx, cy);



      if (targetCol && targetCol !== info.fromCol) {
        // 1. Optimistic UI update
        const updated = tasks.map(t =>
          t.id === info.task.id ? { ...t, status: targetCol } : t
        );
        setTasks(updated);

        // 2. Persist to Backend
        const dbStatus = UI_TO_DB_STATUS[targetCol];
        updateTask(info.task.id, { status: dbStatus }).catch(err => {
          console.error("Failed to persist task move:", err);
          alert("Failed to save task move. Please refresh.");
          // Optional: Revert UI state here if needed
        });
      }



      setDragging(null);

      setOverCol(null);

      window.removeEventListener("pointermove", onMove);

      window.removeEventListener("pointerup", onUp);

    };



    window.addEventListener("pointermove", onMove);

    window.addEventListener("pointerup", onUp);

  };



  return (
    <div className="relative flex gap-4 overflow-x-auto pb-4 px-1 snap-x select-none no-scrollbar scroll-smooth w-full">



      {KANBAN_COLS.map(col => {

        const colTasks = tasks.filter(t => t.status === col);

        const color = COL_COLORS[col];

        const isOver = overCol === col && dragging && dragging.fromCol !== col;



        return (

          <div key={col}

            ref={el => colRefs.current[col] = el}

            style={{

              minWidth: 220, flex: "0 0 220px", borderRadius: 10, padding: "12px 10px",

              minHeight: 340, boxSizing: "border-box",

              background: isOver ? "var(--nav-active-bg)" : "var(--background)",

              border: isOver ? "2px solid var(--primary)" : "1px solid var(--panel-border)",

              transition: "background 0.12s, border-color 0.12s",

            }}>



            {/* Column header */}

            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>

              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />

              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>{col}</span>

              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: 10, padding: "1px 7px" }}>

                {colTasks.length}

              </span>

            </div>



            {/* Cards */}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

              {colTasks.map(task => {

                const isGhost = dragging?.task.id === task.id;

                return (

                  <div key={task.id}

                    onPointerDown={e => onPointerDown(e, task, col)}
                    onClick={() => onTaskClick && onTaskClick(task)}

                    style={{

                      background: "var(--surface)", borderRadius: 8, border: "1px solid var(--panel-border)",

                      padding: "12px 12px 10px", cursor: dragging ? "grabbing" : "grab",

                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",

                      opacity: isGhost ? 0.35 : 1,

                      transition: "opacity 0.15s",

                      touchAction: "none",

                    }}>

                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: "0 0 4px" }}>{task.name}</p>

                    {task.desc && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.4 }}>{task.desc}</p>}



                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: task.assignee ? 8 : 0 }}>

                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--nav-active-bg)", borderRadius: 5, padding: "2px 7px" }}>

                        <div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff" }}>

                          {projectName.charAt(0)}

                        </div>

                        <span style={{ fontSize: 11, color: "var(--nav-active-text)", fontWeight: 500 }}>{projectName}</span>

                      </div>

                      {task.priority && (

                        <span style={{ fontSize: 11, fontWeight: 600, color: PRI_COLOR[task.priority] || "var(--text-muted)", background: PRI_BG[task.priority] || "var(--surface-alt)", padding: "2px 8px", borderRadius: 5 }}>

                          {task.priority}

                        </span>

                      )}

                    </div>



                    {task.assignee && (

                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>

                          {task.assignee.charAt(0).toUpperCase()}

                        </div>

                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{task.assignee}</span>

                      </div>

                    )}

                  </div>

                );

              })}



              {/* Drop hint */}

              {colTasks.length === 0 && (

                <div style={{ border: `2px dashed ${isOver ? "var(--primary)" : "var(--panel-border)"}`, borderRadius: 8, padding: "24px 12px", textAlign: "center" }}>

                  <p style={{ fontSize: 11, color: isOver ? "var(--primary)" : "var(--text-dim)", margin: 0 }}>

                    {isOver ? "↓ Release to drop" : "No tasks"}

                  </p>

                </div>

              )}

            </div>

          </div>

        );

      })}



      {/* Floating ghost card */}

      {dragging && (

        <div ref={ghostRef} style={{

          position: "fixed",

          left: dragging.x, top: dragging.y,

          width: dragging.w, pointerEvents: "none",

          background: "var(--surface)", borderRadius: 8,

          border: "2px solid var(--primary)",

          padding: "12px 12px 10px",

          boxShadow: "0 8px 24px rgba(79,70,229,0.25)",

          opacity: 0.95, zIndex: 9999,

          transform: "rotate(2deg) scale(1.03)",

        }}>

          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", margin: "0 0 4px" }}>{dragging.task.name}</p>

          {dragging.task.desc && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{dragging.task.desc}</p>}

        </div>

      )}


    </div>

  );
}