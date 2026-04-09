import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="#4F46E5" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    iconBg: "#EEF2FF",
    title: "Seamless Collaboration",
    desc: "Empower your projects with real-time updates and efficient project tracking when working with others.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <polyline points="20 6 9 17 4 12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconBg: "#FFF1F0",
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
    iconBg: "#FFFBEB",
    title: "Customizable Workflow",
    desc: "Personalize your workspace with flexible tools designed to match your unique work style.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();  // ✅ removed useKindeAuth entirely

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4F46E5" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-semibold text-base text-gray-900">
              Daily<span className="text-indigo-600">TM</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {["Home", "Features", "Pricing", "Contact"].map((link) => (
              <a key={link} href="#" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                {link}
              </a>
            ))}
          </div>

          {/* Auth buttons — ALL go to /signup */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/signup")}>
              Sign In
            </Button>
            <Button
              size="sm"
              className="bg-gray-900 hover:bg-gray-700 text-white rounded-lg"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-5">
          Your personal workspace
          <br />
          for <span className="text-indigo-600">better productivity</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-9">
          Organize your projects, tasks, and goals in one place.
          <br />
          Stay focused and achieve more with your personal command center.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-7"
            onClick={() => navigate("/signup")}  
          >
            Start for Free
          </Button>
          <Button variant="ghost" size="lg" className="text-gray-500 gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">▶</span>
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-b from-slate-50 to-indigo-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Essential features for{" "}
              <span className="text-indigo-600">personal success</span>
            </h2>
            <p className="text-gray-400 text-sm">
              Everything you need to simplify your projects and boost productivity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 rounded-2xl bg-white">
                <CardContent className="p-7">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: f.iconBg }}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}