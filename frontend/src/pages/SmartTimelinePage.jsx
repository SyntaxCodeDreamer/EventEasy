import React, { useEffect, useState, useCallback } from "react";
import { Clock, Plus, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { api } from "../services/api";
import { cachedFetch, apiCache } from "../services/cache";
import { useEvent } from "../context/EventContext";

export default function SmartTimelinePage() {
  const { selectedEvent } = useEvent();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "", category: "Venue", due_date: "2026-11-15", priority: "HIGH", description: ""
  });

  const loadTasks = useCallback(async (bust = false) => {
    if (!selectedEvent) return;
    if (bust) apiCache.invalidate(`tasks:${selectedEvent.id}`);
    setLoading(true);
    try {
      const data = await cachedFetch(
        `tasks:${selectedEvent.id}`,
        () => api.getTasks(selectedEvent.id),
        90_000
      );
      setTasks(data);
    } catch (e) {
      console.error("Task load error:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedEvent?.id]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleToggle = async (task) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    try {
      await api.updateTask(task.id, { status: newStatus });
      apiCache.invalidate(`tasks:${selectedEvent.id}`);
    } catch (e) {
      console.error("Task update error:", e);
      // Revert on failure
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !newTask.title) return;
    try {
      await api.createTask({ ...newTask, event_id: selectedEvent.id });
      setShowAddModal(false);
      setNewTask({ title: "", category: "Venue", due_date: "2026-11-15", priority: "HIGH", description: "" });
      await loadTasks(true);
    } catch (err) {
      console.error("Task creation error:", err);
    }
  };

  const completedCount = tasks.filter(t => t.status === "COMPLETED").length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Smart Preparation Timeline
            <span className="text-xs bg-amber-600/30 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-semibold">
              Backwards Scheduler
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Milestones calculated relative to {selectedEvent?.date || "event date"}. Completion: {completedCount}/{tasks.length} ({progressPct}%)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Progress Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-slate-400 font-semibold">Overall Preparation Progress</span>
          <span className="text-purple-400 font-bold">{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Add Task Form */}
      {showAddModal && (
        <form onSubmit={handleCreateTask} className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">New Milestone</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-300 mb-1">Task Title</label>
              <input type="text" required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. Confirm catering vendor" />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Due Date</label>
              <input type="date" required value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Priority</label>
              <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white">
                {["CRITICAL","HIGH","MEDIUM","LOW"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">Add Task</button>
          </div>
        </form>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <div
              key={task.id || idx}
              className={`p-5 glass-card rounded-2xl border transition flex items-start justify-between gap-4 ${
                task.status === "COMPLETED" ? "opacity-55 border-slate-800" : "border-slate-700/60 hover:border-purple-500/40"
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggle(task)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                    task.status === "COMPLETED" ? "bg-purple-600 border-purple-500 text-white" : "border-slate-600 hover:border-purple-400"
                  }`}
                >
                  {task.status === "COMPLETED" && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-sm text-white ${task.status === "COMPLETED" ? "line-through text-slate-400" : ""}`}>
                      {task.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === "CRITICAL" ? "bg-red-500/20 text-red-400" :
                      task.priority === "HIGH" ? "bg-amber-500/20 text-amber-400" : "bg-slate-700 text-slate-300"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{task.description}</p>
                  {task.dependencies?.length > 0 && (
                    <p className="text-[11px] text-purple-400 mt-1.5">Depends on: {task.dependencies.join(", ")}</p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> {task.due_date}
                </span>
                <span className="text-[10px] text-slate-500 uppercase block mt-1">{task.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
