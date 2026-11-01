import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, PieChart, MapPin, Utensils, Palette,
  Clock, ShieldAlert, Loader2, AlertCircle
} from "lucide-react";
import { useEvent } from "../context/EventContext";

export default function AIEventPlannerPage() {
  const { selectedEvent, getPlan } = useEvent();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedEvent) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPlan(selectedEvent.id)
      .then(p => { if (!cancelled) setPlan(p); })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedEvent?.id]);

  if (!selectedEvent) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center max-w-xl mx-auto my-12">
        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Event Selected</h2>
        <p className="text-xs text-slate-400 mb-6">Select an event or create a new one to generate the AI plan.</p>
        <Link to="/app/create-event" className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition">
          Create Event
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-sm font-semibold text-slate-300">
          Synthesizing 6 specialized agents: Budget · Venue · Theme · Catering · Timeline · Risk...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center max-w-xl mx-auto my-12 border border-red-500/30">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-2">Agent Synthesis Failed</h2>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  const budget = plan?.budget_breakdown;
  const venue  = plan?.venue_requirements;
  const theme  = plan?.theme_concepts;
  const catering = plan?.catering_specifications;
  const timeline = plan?.timeline_schedule;
  const risks  = plan?.risk_assessment;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Event Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 via-[#111827] to-indigo-900/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600/30 text-purple-300">{selectedEvent.type}</span>
            <span className="text-xs text-slate-400">Target: {selectedEvent.date}</span>
          </div>
          <h1 className="text-2xl font-black text-white">{selectedEvent.name}</h1>
          <p className="text-xs text-purple-300 mt-1 max-w-2xl leading-relaxed">{plan?.summary}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/app/simulator" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition">
            What-If Simulator
          </Link>
          <Link to="/app/budget" className="glass-card hover:bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition">
            Budget Studio
          </Link>
        </div>
      </div>

      {/* 6 Agent Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Budget Agent */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5"><PieChart className="w-4 h-4" /> Budget Agent</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">10% Reserve</span>
            </div>
            <div className="text-2xl font-black text-white mb-1">₹{budget?.total_budget?.toLocaleString("en-IN")}</div>
            <p className="text-xs text-slate-400 mb-4">Per Guest: ₹{budget?.cost_per_guest?.toLocaleString()} • Contingency: ₹{budget?.contingency_reserve?.toLocaleString()}</p>
            <div className="space-y-2 text-xs">
              {budget?.categories?.slice(0, 4).map((c, i) => (
                <div key={i} className="flex justify-between text-slate-300">
                  <span>{c.category} ({c.percentage}%)</span>
                  <span className="font-semibold text-white">₹{c.allocated_amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <Link to="/app/budget" className="mt-5 text-xs text-purple-400 font-bold hover:underline block">Inspect Full Budget →</Link>
        </div>

        {/* 2. Venue Agent */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Venue Agent</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">{selectedEvent.arrangement_type}</span>
            </div>
            <div className="text-lg font-bold text-white mb-2">{venue?.min_carpet_area_sqft?.toLocaleString()} sq. ft.</div>
            <p className="text-xs text-slate-400 mb-3">Parking: ~{venue?.estimated_parking_slots} vehicles</p>
            <div className="p-3 bg-[#111827]/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              {venue?.indoor_outdoor_considerations}
            </div>
          </div>
          <div className="mt-4 text-[11px] text-slate-400">Suggested: {venue?.suggested_venue_types?.[0]?.type}</div>
        </div>

        {/* 3. Theme Agent */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5"><Palette className="w-4 h-4" /> Theme Agent</span>
            </div>
            <div className="text-base font-bold text-white mb-2 truncate">{theme?.theme_name}</div>
            <div className="flex items-center gap-2 my-3">
              {theme?.palette?.map((col, idx) => (
                <div key={idx} title={`${col.name} (${col.hex})`} className="w-7 h-7 rounded-lg border border-white/20 shadow-sm" style={{ backgroundColor: col.hex }} />
              ))}
            </div>
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{theme?.stage_mandap_concept}</p>
          </div>
          <Link to="/app/theme-studio" className="mt-5 text-xs text-pink-400 font-bold hover:underline block">Explore Moodboard →</Link>
        </div>

        {/* 4. Catering Agent */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5"><Utensils className="w-4 h-4" /> Catering Agent</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Jain Friendly</span>
            </div>
            <div className="text-lg font-bold text-white mb-1">{catering?.buffered_capacity} Plates Buffered</div>
            <p className="text-xs text-slate-400 mb-3">Est. Cost/Plate: ₹{catering?.estimated_cost_per_plate} • Staff: 1:{catering?.recommended_waitstaff}</p>
            <div className="space-y-1 text-xs text-slate-300">
              {catering?.curated_menu?.main_course_delicacies?.slice(0, 3).map((item, i) => (
                <p key={i}>• {item}</p>
              ))}
            </div>
          </div>
          <div className="mt-4 text-[11px] text-emerald-400 font-semibold">Food surplus recovery protocol active</div>
        </div>

        {/* 5. Timeline Agent */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-4 h-4" /> Timeline Agent</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">{timeline?.length || 9} Milestones</span>
            </div>
            <div className="space-y-2 text-xs">
              {timeline?.slice(0, 3).map((t, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-[#111827] border border-slate-800">
                  <div className="flex justify-between text-white font-semibold mb-0.5">
                    <span className="truncate">{t.title}</span>
                    <span className="text-[10px] text-purple-400 shrink-0 ml-2">{t.due_date}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
          <Link to="/app/timeline" className="mt-4 text-xs text-amber-400 font-bold hover:underline block">Open Calendar View →</Link>
        </div>

        {/* 6. Risk Agent */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> Risk Agent</span>
              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold">{risks?.length || 5} Flags</span>
            </div>
            <div className="space-y-2 text-xs">
              {risks?.slice(0, 2).map((r, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-red-950/20 border border-red-900/40 text-slate-300">
                  <div className="flex justify-between font-bold text-red-300 mb-1">
                    <span>{r.risk_name}</span>
                    <span className="text-[10px] shrink-0 ml-2">{r.probability}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{r.mitigation_strategy}</p>
                </div>
              ))}
            </div>
          </div>
          <Link to="/app/risks" className="mt-4 text-xs text-red-400 font-bold hover:underline block">Inspect All Risk Matrices →</Link>
        </div>
      </div>
    </div>
  );
}
