import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, PieChart, ShieldCheck, ArrowRight, CheckCircle2, Bot, Layers, Compass } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent">
                EventEase AI
              </span>
              <span className="text-[10px] block text-purple-400 font-semibold tracking-wider">Multi-Agent Event Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-purple-500/30 text-purple-300 text-xs font-semibold mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Next-Gen Multi-Agent Autonomous Event Planning</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Your Event. Your Budget. <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              Your AI Planning Team.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Orchestrate weddings, festivals, corporate galas, and community Navratris with 6 coordinated AI agents. 
            Deterministic budgets, cultural Indian traditions, real-time What-if simulations, and vendor management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-purple-600/30 transition transform hover:-translate-y-0.5 text-base"
            >
              Start Planning Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-base transition"
            >
              Explore Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Specialized Multi-Agent Grid */}
      <section className="py-20 px-6 border-t border-slate-800/80 bg-[#0E1322]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Not a Chatbot. A Coordinated Multi-Agent AI System.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Each specialized agent operates with independent schemas and mathematical algorithms, unified under a central Orchestrator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Budget Agent",
                icon: PieChart,
                desc: "Deterministic financial allocation enforcing 100% budget integrity with an auto-calculated 10% contingency reserve."
              },
              {
                title: "Venue & Capacity Agent",
                icon: Calendar,
                desc: "Calculates square-footage requirements, seating formats, parking logistics, and hybrid indoor/outdoor arrangements."
              },
              {
                title: "Theme & Decor Studio",
                icon: Sparkles,
                desc: "Culturally rich traditional Indian, Gujarati, and modern themes with hex palettes, mandap designs, and moodboards."
              },
              {
                title: "Catering Agent",
                icon: CheckCircle2,
                desc: "Food volume metrics, separate Jain food preparations, plate costing buffers, and surplus food distribution protocols."
              },
              {
                title: "Smart Timeline Agent",
                icon: Layers,
                desc: "Backwards milestone scheduling from T-120 days to event execution with automated dependency propagation."
              },
              {
                title: "What-If Simulator",
                icon: Compass,
                desc: "Simulate budget shifts from ₹10L to ₹8L or rain risks, recalculating operational feasibility before user approval."
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="p-6 glass-card rounded-2xl hover:border-purple-500/40 transition group">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 EventEase AI. Powered by Google Gemini Multi-Agent Architecture & Deterministic Intelligence.</p>
      </footer>
    </div>
  );
}

