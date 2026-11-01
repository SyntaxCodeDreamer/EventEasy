import React, { useEffect, useState } from "react";
import { HeartHandshake, Plus, Users, IndianRupee, Megaphone, Check } from "lucide-react";
import { api } from "../services/api";
import { useEvent } from "../context/EventContext";

export default function CommunityEventPage() {
  const { selectedEvent } = useEvent();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Volunteer register modal state
  const [showVolModal, setShowVolModal] = useState(false);
  const [volData, setVolData] = useState({ name: "", phone: "", team: "Stage & Sound", assigned_tasks: "" });

  // Donation modal state
  const [showDonModal, setShowDonModal] = useState(false);
  const [donData, setDonData] = useState({ donor_name: "", amount: 5000, payment_method: "UPI", notes: "" });

  const loadCommunityData = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const data = await api.getCommunity(selectedEvent.id);
      setCommunity(data);
    } catch (e) {
      console.error("Community load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, [selectedEvent]);

  const handleAddVolunteer = async (e) => {
    e.preventDefault();
    if (!community || !volData.name) return;
    try {
      await api.addVolunteer(community._id || "default", volData);
      setShowVolModal(false);
      setVolData({ name: "", phone: "", team: "Stage & Sound", assigned_tasks: "" });
      await loadCommunityData();
    } catch (e) {
      console.error("Volunteer error:", e);
    }
  };

  const handleAddDonation = async (e) => {
    e.preventDefault();
    if (!community || !donData.donor_name) return;
    try {
      await api.addDonation(community._id || "default", donData);
      setShowDonModal(false);
      setDonData({ donor_name: "", amount: 5000, payment_method: "UPI", notes: "" });
      await loadCommunityData();
    } catch (e) {
      console.error("Donation error:", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Community Event Mode
            <span className="text-xs bg-emerald-600/30 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold">
              Social Impact & Navratri Hub
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empower public festivals, society Navratris, and community celebrations with volunteer rosters and donation transparency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVolModal(!showVolModal)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <Users className="w-4 h-4" /> Register Volunteer
          </button>
          <button
            onClick={() => setShowDonModal(!showDonModal)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <IndianRupee className="w-4 h-4" /> Record Donation
          </button>
        </div>
      </div>

      {/* Community Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Organizing Committee
          </span>
          <div className="text-xl font-bold text-white truncate">
            {community?.organizer_committee || "Navratri Mahotsav Samiti"}
          </div>
          <span className="text-[11px] text-purple-400 mt-1 block">Ahmedabad Chapter</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Donations Collected
          </span>
          <div className="text-2xl font-black text-emerald-400">
            ₹{(community?.collected_donation || 185000).toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Target: ₹{(community?.target_donation || 500000).toLocaleString()}
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Volunteer Force
          </span>
          <div className="text-2xl font-black text-indigo-400">
            {community?.volunteers?.length || 8} Members
          </div>
          <span className="text-[11px] text-indigo-300 mt-1 block">Across 5 specialized teams</span>
        </div>
      </div>

      {/* Volunteer Modal Form */}
      {showVolModal && (
        <form onSubmit={handleAddVolunteer} className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Register Community Volunteer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={volData.name}
                onChange={(e) => setVolData({ ...volData, name: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
                placeholder="Chirag Shah"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Assigned Team</label>
              <select
                value={volData.team}
                onChange={(e) => setVolData({ ...volData, team: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Stage & Sound">Stage & Sound</option>
                <option value="Food & Prasadam">Food & Prasadam Distribution</option>
                <option value="Crowd Management">Crowd Management & Security</option>
                <option value="Decoration & Lighting">Decoration & Lighting</option>
                <option value="VIP Hospitality">VIP Hospitality</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={volData.phone}
                onChange={(e) => setVolData({ ...volData, phone: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
                placeholder="+91 99090..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowVolModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              Confirm Volunteer
            </button>
          </div>
        </form>
      )}

      {/* Donation Modal Form */}
      {showDonModal && (
        <form onSubmit={handleAddDonation} className="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Record Community Donation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Donor / Family Name</label>
              <input
                type="text"
                required
                value={donData.donor_name}
                onChange={(e) => setDonData({ ...donData, donor_name: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
                placeholder="Shreeji Enterprises"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Contribution Amount (₹)</label>
              <input
                type="number"
                required
                value={donData.amount}
                onChange={(e) => setDonData({ ...donData, amount: Number(e.target.value) })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Payment Method</label>
              <select
                value={donData.payment_method}
                onChange={(e) => setDonData({ ...donData, payment_method: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash Receipt</option>
                <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDonModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Record Donation
            </button>
          </div>
        </form>
      )}

      {/* Volunteer Teams Grid */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-4">Dedicated Volunteer Roster & Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Mehul Patel", team: "Stage & Sound", phone: "+91 98251 11223", tasks: "Orchestra mic check & 100kVA DG set switchboard" },
            { name: "Pooja Trivedi", team: "Food & Prasadam", phone: "+91 94260 44556", tasks: "Khandvi & Rabdi counter supervision, food hygiene" },
            { name: "Ankit Shah", team: "Crowd Management", phone: "+91 97270 77889", tasks: "Main entry gate pass verification & parking barricades" },
            { name: "Hardik Desai", team: "Decoration & Lighting", phone: "+91 98980 33445", tasks: "Toran floral maintenance & fairy light loop checks" }
          ].map((v, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#1E293B]/70 border border-slate-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600/30 text-purple-300">
                {v.team}
              </span>
              <h3 className="font-bold text-sm text-white mt-2">{v.name}</h3>
              <p className="text-xs text-slate-400">{v.phone}</p>
              <p className="text-[11px] text-slate-300 mt-2 bg-[#111827] p-2 rounded-lg border border-slate-800">
                {v.tasks}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

