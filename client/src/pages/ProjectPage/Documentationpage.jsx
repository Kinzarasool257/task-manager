import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolBtn({ title, onClick, children, active }) {
    return (
        <button
            title={title}
            onMouseDown={e => { e.preventDefault(); onClick && onClick(); }}
            style={{ background: active ? "var(--nav-active-bg)" : "none", border: "none", borderRadius: 5, cursor: "pointer", padding: "5px 7px", color: active ? "var(--nav-active-text)" : "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, transition: "background 0.1s" }}
        >
            {children}
        </button>
    );
}

const exec = (cmd, val = null) => document.execCommand(cmd, false, val);

// ── DOCUMENTATION PAGE ────────────────────────────────────────────────────────
export default function DocumentationPage() {
    const { id } = useParams();
    const editorRef = useRef(null);
    const [saved, setSaved] = useState(false);

    const storageKey = `doc_content_${id}`;

    // Load saved content
    useEffect(() => {
        const content = localStorage.getItem(storageKey) || "";
        if (editorRef.current) editorRef.current.innerHTML = content;
    }, [storageKey]);

    const handleSave = () => {
        const content = editorRef.current?.innerHTML || "";
        localStorage.setItem(storageKey, content);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const insertLink = () => {
        const url = prompt("Enter URL:");
        if (url) exec("createLink", url);
    };

    const TOOLBAR = [
        { title: "Bold", icon: <strong>B</strong>, cmd: "bold" },
        { title: "Italic", icon: <em style={{ fontStyle: "italic" }}>I</em>, cmd: "italic" },
        { title: "Strikethrough", icon: <s>S</s>, cmd: "strikeThrough" },
        { title: "Code", icon: <span style={{ fontFamily: "monospace" }}>&lt;&gt;</span>, cmd: "formatBlock", val: "pre" },
        { title: "H1", icon: <span>H<sub>1</sub></span>, cmd: "formatBlock", val: "h1" },
        { title: "H2", icon: <span>H<sub>2</sub></span>, cmd: "formatBlock", val: "h2" },
        { title: "H3", icon: <span>H<sub>3</sub></span>, cmd: "formatBlock", val: "h3" },
        { title: "Bullet list", icon: <span>&#8226;&#8212;</span>, cmd: "insertUnorderedList" },
        { title: "Ordered list", icon: <span>1&#8212;</span>, cmd: "insertOrderedList" },
        { title: "Align left", icon: <span>&#8676;</span>, cmd: "justifyLeft" },
        { title: "Align center", icon: <span>&#8596;</span>, cmd: "justifyCenter" },
        { title: "Align right", icon: <span>&#8677;</span>, cmd: "justifyRight" },
    ];

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--surface-alt)" }}>
            <main style={{ flex: 1, overflow: "auto", padding: 24 }}>

                {/* Toolbar */}
                <div style={{ background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: "12px 12px 0 0", padding: "8px 12px", display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", borderBottom: "none" }}>
                    {TOOLBAR.map((t, i) => (
                        <ToolBtn key={i} title={t.title} onClick={() => t.cmd === "formatBlock" ? exec(t.cmd, t.val) : exec(t.cmd)}>
                            {t.icon}
                        </ToolBtn>
                    ))}

                    {/* Divider */}
                    <div style={{ width: 1, height: 20, background: "var(--panel-border)", margin: "0 4px" }} />

                    {/* Link */}
                    <ToolBtn title="Insert link" onClick={insertLink}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                    </ToolBtn>

                    {/* Divider */}
                    <div style={{ width: 1, height: 20, background: "var(--panel-border)", margin: "0 4px" }} />

                    {/* Undo / Redo */}
                    <ToolBtn title="Undo" onClick={() => exec("undo")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6M3.51 15a9 9 0 101.3-4.6" /></svg>
                    </ToolBtn>
                    <ToolBtn title="Redo" onClick={() => exec("redo")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6M20.49 15a9 9 0 11-1.3-4.6" /></svg>
                    </ToolBtn>
                </div>

                {/* Editor area */}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    style={{ background: "var(--surface)", border: "1px solid var(--panel-border)", borderRadius: "0 0 12px 12px", padding: "24px 28px", minHeight: 320, fontSize: 14, lineHeight: 1.8, color: "var(--text-main)", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    onKeyDown={e => {
                        if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleSave();
                        }
                    }}
                />

                {/* Save row */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                    <button
                        onClick={handleSave}
                        style={{ background: saved ? "var(--success)" : "var(--primary)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s", minWidth: 130 }}
                    >
                        {saved ? "Saved ✓" : "Save Changes"}
                    </button>
                </div>
            </main>

            <style>{`
        [contenteditable]:empty:before { content: "Start writing your documentation..."; color: var(--text-muted); pointer-events: none; }
        [contenteditable] h1 { font-size: 24px; font-weight: 700; margin: 16px 0 8px; color: var(--text-main); }
        [contenteditable] h2 { font-size: 20px; font-weight: 600; margin: 14px 0 6px; color: var(--text-main); }
        [contenteditable] h3 { font-size: 16px; font-weight: 600; margin: 12px 0 4px; color: var(--text-main); }
        [contenteditable] pre { background: var(--nav-active-bg); color: var(--nav-active-text); padding: 12px; border-radius: 6px; font-family: monospace; font-size: 13px; overflow-x: auto; }
        [contenteditable] a   { color: var(--primary); text-decoration: underline; }
        [contenteditable] ul  { padding-left: 20px; color: var(--text-main); }
        [contenteditable] ol  { padding-left: 20px; color: var(--text-main); }
      `}</style>
        </div>

    );
}