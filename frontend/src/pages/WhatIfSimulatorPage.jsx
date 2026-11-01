import React, { useState } from "react";
import { 
  Compass, 
  Sparkles, 
  TrendingDown, 
  Users, 
  CloudRain, 
  UtensilsCrossed, 
  Check, 
  X, 
  AlertTriangle, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { api } from "../services/api";
import { useEvent } from "../context/EventContext";

export default function WhatIfSimulatorPage() {
  const { selectedEvent, refreshEvents } = useEvent();
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [notification, setNotification] = useState("");

  // Preset Scenarios
  const runPresetScenario = async (type) => {
    if (!selectedEvent) return;
    setLoading(true);
    setSimulationResult(null);
    setNotification("");

    let payload = { event_id: selectedEvent.id, scenario_type: type };

    if (type === "BUDGET_CUT") {
      // Step 5 hackathon scenario: ₹10 lakh to ₹8 lakh
      payload.new_budget = 800000;
    } else if (type === "GUEST_SURGE") {
      // Step 2 hackathon scenario: +100 additional guests (300 -> 400)
      payload.new_guest_count = (selectedEvent.guest_count || 300) + 100;
    } else if (type === "RAIN_RISK") {
      // Weather contingency
      payload.scenario_type = "RAIN_RISK";
      payload.indoor_outdoor_change = "Rain Contingency";
    }

    try {
      const res = await api.simulate(payload);
      setSimulationResult(res);
    } catch (e) {
      console.error("Simulation error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!selectedEvent || !simulationResult) return;
    setApplying(true);
    try {
      await api.applySimulation(selectedEvent.id, simulationResult);
      await refreshEvents();
      setNotification("Simulation changes officially applied to your event plan and budget.");
    } catch (e) {
      console.error("Failed to apply simulation:", e);
    } finally {
      setApplying(false);
    }
  };

  if (!selectedEvent) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center max-w-xl mx-auto my-12">
        <Compass className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Event Active</h2>
        <p className="text-xs text-slate-400">Select an event to run interactive simulations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          What-If Event Simulation Engine
          <span className="text-xs bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">
            Predictive Decision Support
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore alternative scenarios in real-time. The system recalibrates finances and logistics without overwriting your official plan without your consent.
        </p>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          onClick={() => runPresetScenario("BUDGET_CUT")}
          className="p-5 glass-card rounded-2xl hover:border-purple-500 cursor-pointer transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
            <TrendingDown className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">Scenario 1: Budget Reduction</h3>
          <p className="text-xs text-slate-400 mb-3">
            What happens if the budget decreases from ₹10 lakh to ₹8 lakh? Which non-critical categories can be trimmed?
          </p>
          <span className="text-xs text-purple-400 font-bold group-hover:underline">Run ₹8L Optimization →</span>
        </div>

        <div 
          onClick={() => runPresetScenario("GUEST_SURGE")}
          className="p-5 glass-card rounded-2xl hover:border-indigo-500 cursor-pointer transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">Scenario 2: +100 Guest Surge</h3>
          <p className="text-xs text-slate-400 mb-3">
            What happens if guest count increases from 300 to 400? How will catering buffers & venue sq ft scale?
          </p>
          <span className="text-xs text-indigo-400 font-bold group-hover:underline">Simulate Guest Surge →</span>
        </div>

        <div 
          onClick={() => runPresetScenario("RAIN_RISK")}
          className="p-5 glass-card rounded-2xl hover:border-pink-500 cursor-pointer transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-600/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition">
            <CloudRain className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white mb-1">Scenario 3: Rain Contingency</h3>
          <p className="text-xs text-slate-400 mb-3">
            What if unseasonal rain strikes an outdoor wedding? Evaluates German pagoda hangars and generator safety.
          </p>
          <span className="text-xs text-pink-400 font-bold group-hover:underline">Simulate Weather Risk →</span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="glass-panel p-10 rounded-3xl text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">
            Agents recalculating category allocations, risks, and catering buffers...
          </p>
        </div>
      )}

      {/* Simulation Output Card */}
      {simulationResult && !loading && (
        <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600/30 text-purple-300">
                Simulation Result
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Scenario: {simulationResult.scenario}
              </h2>
            </div>
            {simulationResult.budget_delta !== 0 && (
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Budget Variance</span>
                <span className={`text-lg font-black ${simulationResult.budget_delta < 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {simulationResult.budget_delta < 0 ? "-" : "+"}₹{Math.abs(simulationResult.budget_delta).toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* Impact Points */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Operational Impact Summary
            </h3>
            <div className="space-y-2">
              {simulationResult.impact_points?.map((pt, i) => (
                <div key={i} className="p-3 bg-[#1E293B]/70 rounded-xl border border-slate-700/60 text-xs text-slate-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Recommendations */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              AI Agent Trade-Off Recommendations
            </h3>
            <div className="space-y-2">
              {simulationResult.recommended_actions?.map((act, i) => (
                <div key={i} className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs text-purple-200 flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Risks identified */}
          {simulationResult.new_risks?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                Elevated Risk Factors
              </h3>
              <div className="space-y-2">
                {simulationResult.new_risks.map((r, i) => (
                  <div key={i} className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-300">
                    <span className="font-bold">{r.risk_name}: </span>
                    <span className="text-slate-300">{r.mitigation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Confirmation Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Review carefully. Your official plan will not change unless you click "Apply Proposed Changes".
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSimulationResult(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
              >
                Discard Simulation
              </button>
              <button
                type="button"
                onClick={handleApplyChanges}
                disabled={applying}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Apply Proposed Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

