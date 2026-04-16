import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="var(--primary)" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    iconBg: "var(--nav-active-bg)",
    title: "Seamless Collaboration",
    desc: "Empower your projects with real-time updates and efficient project tracking when working with others.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="20 6 9 17 4 12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconBg: "rgba(239, 68, 68, 0.1)",
    title: "All-in-One Solution",
    desc: "Manage everything from tasks to goals in one integrated workspace designed to boost productivity.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="#F59E0B" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="#F59E0B" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="#F59E0B" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="#F59E0B" strokeWidth="2" />
      </svg>
    ),
    iconBg: "rgba(245, 158, 11, 0.1)",
    title: "Customizable Workflow",
    desc: "Personalize your workspace with flexible tools designed to match your unique work style.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { login, register, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--text-main)", transition: "background 0.3s, color 0.3s" }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 transition-all duration-300" style={{ background: "var(--surface)", borderBottom: "1px solid var(--panel-border)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--primary)" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-semibold text-base" style={{ color: "var(--text-main)" }}>
              Daily<span style={{ color: "var(--primary)" }}>TM</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {["Home", "Features", "Pricing", "Contact"].map((link) => (
              <a key={link} href="#" className="text-sm font-medium transition-colors" style={{ color: "var(--text-dim)" }} onMouseEnter={e => e.target.style.color = "var(--text-main)"} onMouseLeave={e => e.target.style.color = "var(--text-dim)"}>
                {link}
              </a>
            ))}
          </div>

          {/* Auth buttons & Theme Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`} 
              className="p-2 rounded-full transition-colors"
              style={{ background: "var(--surface-alt)", color: "var(--text-muted)" }}
            >
              {theme === "light" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              )}
            </button>

            {isAuthenticated ? (
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                style={{ background: "var(--primary)" }}
                onClick={() => navigate("/profile-setup")}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => login()} style={{ color: "var(--text-main)" }}>
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}
                  onClick={() => register()}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5" style={{ color: "var(--text-main)" }}>
          Your personal workspace
          <br />
          for <span style={{ color: "var(--primary)" }}>better productivity</span>
        </h1>
        <p className="text-lg leading-relaxed mb-9" style={{ color: "var(--text-dim)" }}>
          Organize your projects, tasks, and goals in one place.
          <br />
          Stay focused and achieve more with your personal command center.
        </p>
        <div className="flex items-center justify-center gap-4">
          {isAuthenticated ? (
            <Button
              size="lg"
              className="rounded-xl px-7"
              style={{ background: "var(--primary)", color: "#fff" }}
              onClick={() => navigate("/profile-setup")}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              size="lg"
              className="rounded-xl px-7"
              style={{ background: "var(--primary)", color: "#fff" }}
              onClick={() => register()}
            >
              Start for Free
            </Button>
          )}
          <Button variant="ghost" size="lg" className="gap-2" style={{ color: "var(--text-dim)" }}>
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ background: "var(--surface-alt)" }}>▶</span>
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ background: "var(--surface-alt)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--text-main)" }}>
              Essential features for{" "}
              <span style={{ color: "var(--primary)" }}>personal success</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Everything you need to simplify your projects and boost productivity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl" style={{ background: "var(--surface)" }}>
                <CardContent className="p-7">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: f.iconBg }}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-main)" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}