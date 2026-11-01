import React, { useState } from "react";
import { Palette, Sparkles, Image as ImageIcon, Heart, Wand2, Loader2, Check } from "lucide-react";
import { api } from "../services/api";
import { useEvent } from "../context/EventContext";

export default function ThemeStudioPage() {
  const { selectedEvent } = useEvent();
  const [description, setDescription] = useState(
    "Create a royal Gujarati wedding decoration theme with traditional red and gold colors, floral mandap, warm lighting, and an elegant entrance."
  );
  const [culturalVibe, setCulturalVibe] = useState("Gujarati Traditional");
  const [loading, setLoading] = useState(false);
  const [themeResult, setThemeResult] = useState({
    theme_name: "Royal Gujarati Bandhani & Marigold Heritage",
    theme_description: "A majestic royal celebration rooted in Gujarati cultural craftsmanship, featuring vibrant vermillion, marigold floristry, and warm brass glow.",
    palette: [
      { name: "Kesariya Amber", hex: "#FF9933" },
      { name: "Sindoor Crimson", hex: "#9B111E" },
      { name: "Royal Gold", hex: "#D4AF37" },
      { name: "Emerald Patola Green", hex: "#097969" },
      { name: "Raw Silk Ivory", hex: "#FFFFF0" }
    ],
    entrance_concept: "Grand Toran arch adorned with fresh Genda phool (marigolds), brass diyas, and authentic Kutchi mirror-work fabric hangings.",
    stage_mandap_concept: "Four-pillar carved wooden Rajwadi mandap covered in cascading marigolds, brass urli with floating rose petals and fragrant lotus blooms.",
    lighting_mood: "Warm 2700K ambient fairy lights with brass floor lamps and subtle amber uplighting for traditional regality.",
    table_decor: "Kansa (bronze) styled chargers, block-printed table runners, and mini terracotta tea-light lanterns.",
    image_prompt: "A majestic outdoor Indian Gujarati wedding stage and floral mandap at sunset, adorned with rich marigold garlands, red and gold silk drapery, carved wooden columns, brass oil lamps, soft cinematic golden hour lighting, photorealistic 8k octane render."
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.generateTheme({
        event_type: selectedEvent?.type || "Wedding",
        description,
        cultural_vibe: culturalVibe
      });
      setThemeResult(data);
    } catch (err) {
      console.error("Theme generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          AI Event Theme & Decor Studio
          <span className="text-xs bg-pink-600/30 text-pink-300 px-3 py-1 rounded-full border border-pink-500/30 font-semibold">
            Creative Moodboard
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Craft cohesive cultural concepts, color schemes, stage mandap designs, and image-generation prompts.
        </p>
      </div>

      {/* Input generator */}
      <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-pink-400">
          <Wand2 className="w-5 h-5" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">Generate Custom Aesthetic Concept</h2>
        </div>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#1E293B] border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
          placeholder="Describe your vision, e.g. Royal Gujarati wedding decoration theme with traditional red and gold..."
        />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium">Cultural Vibe:</span>
            <select
              value={culturalVibe}
              onChange={(e) => setCulturalVibe(e.target.value)}
              className="bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="Gujarati Traditional">Gujarati Traditional (Lagna & Mandap)</option>
              <option value="Modern Minimalist">Modern Minimalist Indigo & Champagne</option>
              <option value="Royal Rajasthani">Royal Rajwadi Palace</option>
              <option value="Navratri Garba">Festive Navratri Garba Theme</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-pink-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Theme Blueprint
          </button>
        </div>
      </form>

      {/* Theme Studio Visual Output */}
      {themeResult && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="glass-panel p-6 rounded-3xl border border-pink-500/20 bg-gradient-to-r from-pink-950/20 via-[#111827] to-purple-950/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-600/30 text-pink-300">
                Curated Concept
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{themeResult.theme_name}</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{themeResult.theme_description}</p>
            </div>
            {/* Color Palette */}
            <div className="flex items-center gap-2 bg-[#1E293B]/80 p-2.5 rounded-2xl border border-slate-700">
              {themeResult.palette?.map((col, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 rounded-xl border border-white/20 shadow-md cursor-pointer hover:scale-105 transition"
                    style={{ backgroundColor: col.hex }}
                    title={`${col.name} (${col.hex})`}
                  />
                  <span className="text-[9px] text-slate-400 mt-1">{col.hex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Moodboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                Mandap & Stage Architecture
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed bg-[#111827] p-3.5 rounded-xl border border-slate-800">
                {themeResult.stage_mandap_concept}
              </p>

              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                Grand Entrance Concept
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed bg-[#111827] p-3.5 rounded-xl border border-slate-800">
                {themeResult.entrance_concept}
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                Ambient & Ceremonial Lighting Mood
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed bg-[#111827] p-3.5 rounded-xl border border-slate-800">
                {themeResult.lighting_mood}
              </p>

              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                Table Décor & Guest Centerpieces
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed bg-[#111827] p-3.5 rounded-xl border border-slate-800">
                {themeResult.table_decor}
              </p>
            </div>
          </div>

          {/* AI Image Generation Prompt */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-slate-300">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Synthesized 8K Photorealistic Prompt
              </h3>
            </div>
            <div className="p-3.5 bg-[#1E293B] rounded-xl text-xs text-slate-300 font-mono select-all">
              {themeResult.image_prompt}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Note: This synthesized prompt can be dispatched to Google Imagen or Midjourney to generate high-resolution vendor render sheets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

