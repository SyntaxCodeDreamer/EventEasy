import React, { useEffect, useState } from "react";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useEvent } from "../context/EventContext";

export default function RiskManagementPage() {
  const { selectedEvent, getPlan } = useEvent();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedEvent) return;
    let cancelled = false;
    setLoading(true);
    getPlan(selectedEvent.id)
      .then(plan => { if (!cancelled) setRisks(plan?.risk_assessment || []); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedEvent?.id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          Risk Management & Backup Matrix
          <span className="text-xs bg-red-600/30 text-red-300 px-3 py-1 rounded-full border border-red-500/30 font-semibold">Failsafe Architecture</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Automated evaluation of weather, power, vendor, and catering failure vectors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-red-500/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Risk Vectors</span>
          <div className="text-2xl font-black text-white">{risks.length}</div>
          <span className="text-[11px] text-red-400 mt-1 block">Monitored conditions</span>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-amber-500/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Outdoor Vulnerability</span>
          <div className="text-2xl font-black text-amber-400">{selectedEvent?.arrangement_type === "Outdoor" ? "Elevated" : "Controlled"}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Pagoda canopy fallback ready</span>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Contingency Coverage</span>
          <div className="text-2xl font-black text-emerald-400">100%</div>
          <span className="text-[11px] text-emerald-300 mt-1 block">Deterministic Python backend</span>
        </div>
      </div>

      <div className="space-y-4">
        {risks.map((risk, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className={`w-5 h-5 ${risk.severity === "CRITICAL" ? "text-red-400" : "text-amber-400"}`} />
                <h3 className="font-bold text-base text-white">{risk.risk_name}</h3>
                <span className="text-[10px] font-mono text-slate-500">{risk.risk_id}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2.5 py-0.5 rounded font-bold ${risk.probability === "HIGH" ? "bg-red-500/20 text-red-300" : "bg-slate-700 text-slate-300"}`}>
                  Prob: {risk.probability}
                </span>
                <span className={`px-2.5 py-0.5 rounded font-bold ${risk.severity === "CRITICAL" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-300"}`}>
                  Severity: {risk.severity}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">Operational Impact</span>
                <p className="text-slate-300 bg-[#1E293B] p-3 rounded-xl border border-slate-700/60 leading-relaxed">{risk.impact_description}</p>
              </div>
              <div>
                <span className="text-purple-400 block mb-1 font-semibold uppercase text-[10px]">Mitigation & Backup</span>
                <p className="text-purple-200 bg-purple-950/20 p-3 rounded-xl border border-purple-800/30 leading-relaxed">{risk.mitigation_strategy}</p>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 pt-2">
              <span className="font-semibold text-slate-300">Trigger: </span>{risk.trigger_condition}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
