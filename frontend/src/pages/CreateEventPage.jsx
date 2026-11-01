import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Bot, 
  Check, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  Clock, 
  Loader2,
  Wand2
} from "lucide-react";
import { api } from "../services/api";
import { useEvent } from "../context/EventContext";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { refreshEvents, setSelectedEvent } = useEvent();

  // Natural Language prompt state
  const [naturalPrompt, setNaturalPrompt] = useState(
    "I want to organize a traditional Gujarati wedding in Ahmedabad for 300 guests. My budget is ₹10 lakh. The celebration will last two days. I want traditional food with Jain options, beautiful decorations, and a memorable experience without overspending."
  );
  const [extracting, setExtracting] = useState(false);
  const [creating, setCreating] = useState(false);

  // Structured form state
  const [formData, setFormData] = useState({
    name: "Patel Family Traditional Wedding",
    type: "Wedding",
    location: "Ahmedabad, Gujarat",
    date: "2026-12-20",
    duration_days: 2,
    guest_count: 300,
    budget: 1000000,
    preferred_theme: "Traditional Gujarati Bandhani & Marigold",
    food_preferences: "Vegetarian with Jain food options",
    cultural_preferences: "Gujarati Traditions (Garba, Lagna Mandap)",
    arrangement_type: "Outdoor",
    additional_requirements: "Stage for Garba/Sangeet, separate Jain counter, generator backup."
  });

  const handleExtractFromAI = async () => {
    if (!naturalPrompt.trim()) return;
    setExtracting(true);
    try {
      const extracted = await api.extractPrompt(naturalPrompt);
      setFormData(prev => ({
        ...prev,
        ...extracted,
        budget: extracted.budget || prev.budget,
        guest_count: extracted.guest_count || prev.guest_count
      }));
    } catch (e) {
      console.error("Extraction error:", e);
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await api.createEvent(formData);
      await refreshEvents();
      setSelectedEvent(created);
      navigate("/app/planner");
    } catch (e) {
      console.error("Event creation error:", e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          AI Event Creation Wizard
          <span className="text-xs bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">
            Multi-Agent Initializer
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Describe your vision in plain English, Gujarati, or Hindi. The AI Orchestrator extracts parameters and coordinates all 6 agents.
        </p>
      </div>

      {/* Natural Language Prompt Card */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Natural Language Requirement Input
          </h2>
        </div>
        <textarea
          rows={3}
          value={naturalPrompt}
          onChange={(e) => setNaturalPrompt(e.target.value)}
          placeholder="Describe your event, e.g. 'I want to organize a traditional Gujarati wedding in Ahmedabad for 300 guests with ₹10 lakh budget...'"
          className="w-full bg-[#1E293B] border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
        />
        <div className="mt-3 flex justify-between items-center">
          <p className="text-[11px] text-slate-400">
            Click extract to have Gemini populate and validate structured fields automatically.
          </p>
          <button
            type="button"
            onClick={handleExtractFromAI}
            disabled={extracting}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-purple-600/20 disabled:opacity-50"
          >
            {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Extract Structured Plan
          </button>
        </div>
      </div>

      {/* Review & Correct Structured Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          Review & Refine Parameters Before Agent Synthesis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Title
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Category
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Wedding">Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Engagement">Engagement</option>
              <option value="Navratri">Navratri Celebration</option>
              <option value="Religious Festival">Religious Festival</option>
              <option value="Community Event">Community Event</option>
              <option value="College Festival">College Festival</option>
              <option value="Corporate">Corporate Event</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-white focus:outline-none focus:border-purple-500"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-white focus:outline-none focus:border-purple-500"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Expected Guest Count
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.guest_count}
                onChange={(e) => setFormData({ ...formData, guest_count: Number(e.target.value) })}
                required
                min={10}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-white focus:outline-none focus:border-purple-500"
              />
              <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Total Budget (INR ₹)
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                required
                step={10000}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 pl-9 text-white focus:outline-none focus:border-purple-500"
              />
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Duration (Days)
            </label>
            <input
              type="number"
              value={formData.duration_days}
              onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
              min={1}
              max={14}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Arrangement Format
            </label>
            <select
              value={formData.arrangement_type}
              onChange={(e) => setFormData({ ...formData, arrangement_type: e.target.value })}
              className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Outdoor">Outdoor Lawn / Plot</option>
              <option value="Indoor">Indoor Air-conditioned Banquet</option>
              <option value="Both">Hybrid (Indoor + Outdoor)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-xs">
            Food & Dietary Preferences
          </label>
          <input
            type="text"
            value={formData.food_preferences}
            onChange={(e) => setFormData({ ...formData, food_preferences: e.target.value })}
            className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-xs">
            Preferred Theme & Cultural Atmosphere
          </label>
          <input
            type="text"
            value={formData.preferred_theme}
            onChange={(e) => setFormData({ ...formData, preferred_theme: e.target.value })}
            className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-xl shadow-purple-600/30 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Orchestrating Agents & Synthesizing Master Plan...</span>
            </>
          ) : (
            <>
              <span>Initialize Multi-Agent Event Plan</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

