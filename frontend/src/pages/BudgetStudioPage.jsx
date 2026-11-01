import React, { useEffect, useState, useCallback } from "react";
import {
  PieChart as PieIcon, IndianRupee, Plus, Loader2, Trash2
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis
} from "recharts";
import { api } from "../services/api";
import { cachedFetch, apiCache } from "../services/cache";
import { useEvent } from "../context/EventContext";

const COLORS = ["#7C3AED","#3B82F6","#EC4899","#10B981","#F59E0B","#6366F1","#8B5CF6","#64748B"];

export default function BudgetStudioPage() {
  const { selectedEvent } = useEvent();
  const [budgetData, setBudgetData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "Venue", title: "", estimated_cost: 0, actual_cost: 0, paid_amount: 0, notes: ""
  });

  const loadData = useCallback(async (bust = false) => {
    if (!selectedEvent) return;
    setLoading(true);
    if (bust) {
      apiCache.invalidate(`budget:${selectedEvent.id}`);
      apiCache.invalidate(`expenses:${selectedEvent.id}`);
    }
    try {
      const [b, exp] = await Promise.all([
        cachedFetch(`budget:${selectedEvent.id}`, () => api.getBudget(selectedEvent.id), 120_000),
        cachedFetch(`expenses:${selectedEvent.id}`, () => api.getExpenses(selectedEvent.id), 60_000)
      ]);
      setBudgetData(b);
      setExpenses(exp);
    } catch (e) {
      console.error("Budget load error:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedEvent?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !newExpense.title) return;
    try {
      await api.createExpense({ ...newExpense, event_id: selectedEvent.id });
      setShowAddForm(false);
      setNewExpense({ category: "Venue", title: "", estimated_cost: 0, actual_cost: 0, paid_amount: 0, notes: "" });
      await loadData(true); // bust cache and reload
    } catch (err) {
      console.error("Expense error:", err);
    }
  };

  const pieChartData = budgetData?.categories?.map(cat => ({
    name: cat.category,
    value: cat.allocated_amount
  })) || [];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Intelligent Budget & Expense Studio
            <span className="text-xs bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">Deterministic Math</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Category allocations, INR calculations, and expense tracking.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Budget", value: `₹${budgetData?.total_budget?.toLocaleString("en-IN") ?? 0}`, sub: "Active event cap", color: "text-purple-400" },
          { label: "Contingency Reserve", value: `₹${budgetData?.contingency_reserve?.toLocaleString("en-IN") ?? 0}`, sub: "10% buffer", color: "text-amber-400" },
          { label: "Committed Spend", value: `₹${budgetData?.total_actual?.toLocaleString("en-IN") ?? 0}`, sub: "From verified invoices", color: "text-emerald-400" },
          { label: "Remaining Balance", value: `₹${budgetData?.remaining_budget?.toLocaleString("en-IN") ?? 0}`, sub: "Safe operating balance", color: "text-indigo-400" }
        ].map((c, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{c.label}</span>
            <div className={`text-2xl font-black ${c.color}`}>{c.value}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">{c.sub}</span>
          </div>
        ))}
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <form onSubmit={handleAddExpense} className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4 animate-in slide-in-from-top-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Record Expense</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              { label: "Expense Title", key: "title", type: "text", placeholder: "Stage Mandap Advance", required: true },
              { label: "Estimated Cost (₹)", key: "estimated_cost", type: "number" },
              { label: "Actual Invoiced (₹)", key: "actual_cost", type: "number" },
              { label: "Paid Amount (₹)", key: "paid_amount", type: "number" },
              { label: "Notes", key: "notes", type: "text", placeholder: "UPI / Cheque ref" }
            ].map(field => (
              <div key={field.key}>
                <label className="block text-slate-300 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={newExpense[field.key]}
                  onChange={e => setNewExpense({ ...newExpense, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-slate-300 mb-1">Category</label>
              <select
                value={newExpense.category}
                onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                {["Venue","Catering","Decoration","Photography & Video","Entertainment & Sound","Transportation & Logistics","Invitations & Gifts","Miscellaneous"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30">Save Expense</button>
          </div>
        </form>
      )}

      {/* Charts + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-1">Category Allocation (Deterministic)</h2>
          <p className="text-xs text-slate-400 mb-4">10% contingency reserve excluded from allocations</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieChartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "0.75rem" }}
                  formatter={value => [`₹${value.toLocaleString()}`, "Allocated"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
            {budgetData?.categories?.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{c.category}: ₹{(c.allocated_amount / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h2 className="text-sm font-bold text-white mb-1">Expense Ledger</h2>
          <p className="text-xs text-slate-400 mb-4">Verified invoices vs. estimated costs</p>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Invoiced</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">No expenses recorded yet.</td>
                  </tr>
                ) : (
                  expenses.map(exp => (
                    <tr key={exp.id} className="text-slate-300 hover:bg-slate-800/30">
                      <td className="py-2.5 font-medium text-white">{exp.title}</td>
                      <td className="py-2.5">{exp.category}</td>
                      <td className="py-2.5 font-semibold">₹{exp.actual_cost?.toLocaleString()}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${exp.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
