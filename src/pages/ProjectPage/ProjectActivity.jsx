import { timeAgo } from "./projectUtils";
 
function ActivityIcon({ type }) {
  if (type === "task") {
    return (
      <div style={{ width:28, height:28, borderRadius:"50%", background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    );
  }
  return (
    <div style={{ width:28, height:28, borderRadius:"50%", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    </div>
  );
}
 
export default function ProjectActivity({ activity }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", padding:20, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      {activity.length === 0 ? (
        <p style={{ fontSize:13, color:"#9ca3af" }}>No activity yet.</p>
      ) : (
        <div style={{ display:"flex", flexDirection:"column" }}>
          {activity.map((a, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0", borderBottom: i < activity.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <ActivityIcon type={a.type}/>
              <div>
                <p style={{ fontSize:12, color:"#374151", margin:"0 0 2px", lineHeight:1.5 }}>{a.text}</p>
                <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>{timeAgo(a.at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}