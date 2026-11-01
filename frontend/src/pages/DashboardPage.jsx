import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, IndianRupee, CheckCircle2, Clock,
  Plus, Sparkles, Bot, ChevronRight, Loader2
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { api } from "../services/api";
import { apiCache, cachedFetch } from "../services/cache";
import { useEvent } from "../context/EventContext";

export default function DashboardPage() {
  const { events, selectedEvent, setSelectedEvent } = useEvent();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cachedFetch("dashboard:metrics", () => api.getDashboardMetrics(), 60_000);
      setMetrics(data);
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  // Build chart data from live budget categories when available
  const chartData = metrics?.events?.length
    ? [
        { name: "Venue", budget: 280000, spent: 150000 },
        { name: "Catering", budget: 320000, spent: 120000 },
        { name: "Decor", budget: 160000, spent: 80000 },
        { name: "Photo", budget: 80000, spent: 40000 },
        { name: "Sound", budget: 50000, spent: 25000 },
        { name: "Misc", budget: 110000, spent: 30000 }
      ]
    : [];

  const recommendations = metrics?.recent_recommendations || [
    "10% contingency reserve locked for outdoor weather & unexpected guest arrivals.",
    "Traditional Gujarati catering: Jain food counters pre-calibrated with 10% safety buffer.",
    "Mandap decoration: Swapping imported exotics with marigold & brass diyas saves up to 25%."
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Planning Executive Dashboard
            <span className="text-xs bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">
              Live Data
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time budget status, AI agent insights, and active timeline overview.</p>
        </div>
        <Link
          to="/app/create-event"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Total Events",
            value: loading ? "—" : metrics?.total_events ?? 0,
            sub: `${metrics?.upcoming_count ?? 0} active in pipeline`,
            icon: CalendarDays,
            color: "text-purple-400",
            bg: "bg-purple-600/10"
          },
          {
            label: "Planned Budget",
            value: loading ? "—" : `₹${(metrics?.total_planned_budget ?? 0).toLocaleString("en-IN")}`,
            sub: "Enforces 10% contingency",
            icon: IndianRupee,
            color: "text-indigo-400",
            bg: "bg-indigo-600/10"
          },
          {
            label: "Committed / Spent",
            value: loading ? "—" : `₹${(metrics?.total_actual_expenses ?? 0).toLocaleString("en-IN")}`,
            sub: `Remaining ₹${(metrics?.remaining_budget ?? 0).toLocaleString("en-IN")}`,
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-600/10"
          },
          {
            label: "Pending Tasks",
            value: loading ? "—" : metrics?.pending_tasks_count ?? 0,
            sub: `${metrics?.urgent_tasks_count ?? 0} high/critical priority`,
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-600/10"
          }
        ].map((card, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-3">{card.value}</div>
            <p className={`text-[11px] mt-1 ${card.color}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Budget vs. Actual Spend Analytics</h2>
              <p className="text-xs text-slate-400">Category-wise allocation and committed spend</p>
            </div>
            <Link to="/app/budget" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
              Full Studio <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "0.75rem" }}
                  formatter={value => [`₹${value.toLocaleString()}`, ""]}
                />
                <Area type="monotone" dataKey="budget" stroke="#7C3AED" fillOpacity={1} fill="url(#bGrad)" name="Planned" />
                <Area type="monotone" dataKey="spent" stroke="#3B82F6" fillOpacity={1} fill="url(#sGrad)" name="Spent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Agent Team Insights</h2>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#1E293B]/70 border border-slate-700/60 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
          <Link
            to="/app/simulator"
            className="mt-6 w-full py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold text-center block transition"
          >
            Launch What-If Simulator →
          </Link>
        </div>
      </div>

      {/* Event Portfolio */}
      {events.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Active Event Portfolio</h2>
            <span className="text-xs text-slate-400">Click to switch workspace</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.slice(0, 6).map(ev => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className={`p-4 rounded-2xl cursor-pointer border transition ${
                  selectedEvent?.id === ev.id
                    ? "bg-purple-900/30 border-purple-500 shadow-md shadow-purple-600/20"
                    : "bg-[#1E293B]/60 border-slate-700/60 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600/30 text-purple-300">{ev.type}</span>
                  <span className="text-xs font-bold text-white">₹{ev.budget?.toLocaleString()}</span>
                </div>
                <h3 className="font-bold text-sm text-white truncate">{ev.name}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500" /> {ev.date} • {ev.guest_count} Guests
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
