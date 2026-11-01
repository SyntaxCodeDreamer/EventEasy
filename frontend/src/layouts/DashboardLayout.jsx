import React from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  PieChart,
  Palette,
  Clock,
  Briefcase,
  Users,
  Compass,
  ShieldAlert,
  HeartHandshake,
  LogOut,
  ChevronDown,
  Layers
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEvent } from "../context/EventContext";
import GlobalAIChat from "../components/GlobalAIChat";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { events, selectedEvent, setSelectedEvent } = useEvent();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Dashboard", path: "/app", icon: LayoutDashboard },
    { name: "Create Event", path: "/app/create-event", icon: CalendarDays },
    { name: "AI Event Planner", path: "/app/planner", icon: Sparkles },
    { name: "Budget Studio", path: "/app/budget", icon: PieChart },
    { name: "Theme Studio", path: "/app/theme-studio", icon: Palette },
    { name: "Smart Timeline", path: "/app/timeline", icon: Clock },
    { name: "Vendor Hub", path: "/app/vendors", icon: Briefcase },
    { name: "Guest Experience", path: "/app/guests", icon: Users },
    { name: "What-If Simulator", path: "/app/simulator", icon: Compass },
    { name: "Risk Management", path: "/app/risks", icon: ShieldAlert },
    { name: "Community Mode", path: "/app/community", icon: HeartHandshake },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827]/90 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
                EventEase AI
              </h1>
              <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Multi-Agent Planner</p>
            </div>
          </div>

          {/* Event Selector Pill */}
          <div className="px-4 py-3 border-b border-slate-800/50">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Active Event Focus
            </label>
            <div className="relative">
              <select
                value={selectedEvent?.id || ""}
                onChange={(e) => {
                  const ev = events.find(x => x.id === e.target.value);
                  if (ev) setSelectedEvent(ev);
                }}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-purple-500 pr-8 truncate font-medium"
              >
                {events.length === 0 ? (
                  <option value="">No events found</option>
                ) : (
                  events.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F19]/60">
          <div className="flex items-center justify-between mb-2">
            <div className="truncate mr-2">
              <p className="text-xs font-bold text-white truncate">{user?.full_name || "Organizer"}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0B0F19] to-[#0D121F] p-8 relative">
        <Outlet />
        <GlobalAIChat />
      </main>
    </div>
  );
}

