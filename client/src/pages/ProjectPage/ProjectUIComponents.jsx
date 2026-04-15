import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
 
// ── Circular stat card ────────────────────────────────────────────────────────
export function CircleStat({ percent, label, sublabel, color }) {
  const data = [{ value: percent }, { value: 100 - percent }];
  return (
    <div style={{ flex:1, background:"var(--surface)", borderRadius:12, border:"1px solid var(--panel-border)", padding:"20px 16px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize:11, color:"var(--text-muted)", margin:"0 0 10px", fontWeight:500 }}>{label}</p>
      <div style={{ position:"relative", width:76, height:76, margin:"0 auto 8px" }}>
        <PieChart width={76} height={76}>
          <Pie data={data} cx="38" cy="38" innerRadius={26} outerRadius={36} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
            <Cell fill={color}/>
            <Cell fill="var(--surface-alt)"/>
          </Pie>
        </PieChart>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color }}>{percent}%</span>
        </div>
      </div>
      <p style={{ fontSize:11, color:"var(--text-muted)", margin:0 }}>{sublabel}</p>
    </div>
  );
}
 
// ── Team member stat card ─────────────────────────────────────────────────────
export function MemberStat({ count }) {
  return (
    <div style={{ flex:1, background:"var(--surface)", borderRadius:12, border:"1px solid var(--panel-border)", padding:"20px 16px", textAlign:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize:11, color:"var(--text-muted)", margin:"0 0 10px", fontWeight:500 }}>Team Members</p>
      <div style={{ width:76, height:76, borderRadius:"50%", background:"var(--primary)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
        <span style={{ fontSize:16, fontWeight:700, color:"#fff" }}>{count}</span>
      </div>
      <p style={{ fontSize:11, color:"var(--text-muted)", margin:0 }}>{count} member{count !== 1 ? "s" : ""}</p>
    </div>
  );
}
 
// ── Tab bar ───────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, setActive }) {
  return (
    <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--panel-border)", marginBottom:16 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => setActive(t)}
          style={{ padding:"8px 18px", border:"none", background:"none", cursor:"pointer", fontSize:13, fontWeight:active === t ? 600 : 400, color:active === t ? "var(--text-main)" : "var(--text-dim)", borderBottom:active === t ? "2px solid var(--primary)" : "2px solid transparent", marginBottom:-1, transition:"all 0.15s" }}>
          {t}
        </button>
      ))}
    </div>
  );
}