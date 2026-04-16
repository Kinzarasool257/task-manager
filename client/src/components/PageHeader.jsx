import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

/**
 * Standardized Page Header component for consistency across the application.
 * @param {string} title - The main title of the page.
 * @param {string} subtitle - Optional description or status text.
 * @param {ReactNode} icon - Optional icon to display next to the title.
 */
export default function PageHeader({ title, subtitle, icon }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const userInitials = user 
    ? `${user.given_name?.charAt(0) ?? ""}${user.family_name?.charAt(0) ?? ""}`.toUpperCase() 
    : "U";

  return (
    <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {icon && <div className="flex items-center shrink-0">{icon}</div>}
          <p className="text-base font-bold text-slate-900 truncate">{title}</p>
        </div>
        {subtitle && <p className="text-[11px] md:text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      <div className="hidden md:flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`} 
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          {theme === "light" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          )}
        </button>

        {/* Notifications */}
        <button 
          onClick={() => navigate("/dashboard/notifications")} 
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
        </button>

        {/* Profile Avatar */}
        <div 
          onClick={() => navigate("/profile")} 
          className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-100 transition-all"
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
