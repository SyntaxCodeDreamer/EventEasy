import React, { useEffect, useState } from "react";
import { Briefcase, Plus, Phone, Mail, IndianRupee, Check, AlertCircle } from "lucide-react";
import { api } from "../services/api";
import { useEvent } from "../context/EventContext";

export default function VendorHubPage() {
  const { selectedEvent } = useEvent();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    category: "Caterers",
    contact_name: "",
    phone: "",
    email: "",
    quoted_price: 0,
    final_price: 0,
    paid_amount: 0,
    status: "Not Contacted",
    notes: ""
  });

  const loadVendors = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const data = await api.getVendors(selectedEvent.id);
      setVendors(data);
    } catch (e) {
      console.error("Vendor load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [selectedEvent]);

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !newVendor.name) return;
    try {
      await api.createVendor({ ...newVendor, event_id: selectedEvent.id });
      setShowAddForm(false);
      setNewVendor({
        name: "",
        category: "Caterers",
        contact_name: "",
        phone: "",
        email: "",
        quoted_price: 0,
        final_price: 0,
        paid_amount: 0,
        status: "Not Contacted",
        notes: ""
      });
      await loadVendors();
    } catch (e) {
      console.error("Error creating vendor:", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Vendor Management Hub
            <span className="text-xs bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-semibold">
              Quotation Tracker
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track real vendor contacts, negotiate quotes, and record stage-wise milestone payments.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Add Vendor Contact
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateVendor} className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Add Verified Vendor Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Company / Vendor Name</label>
              <input
                type="text"
                required
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
                placeholder="e.g. Swagat Caterers Ahmedabad"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Category</label>
              <select
                value={newVendor.category}
                onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Venues">Venues</option>
                <option value="Caterers">Caterers</option>
                <option value="Photographers">Photographers & Cinematography</option>
                <option value="Decorators">Decorators & Mandap</option>
                <option value="Makeup Artists">Makeup Artists</option>
                <option value="DJs">DJs & Sound Engineers</option>
                <option value="Entertainment">Entertainment & Folk Dancers</option>
                <option value="Transportation">Transportation & Logistics</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Contact Person</label>
              <input
                type="text"
                value={newVendor.contact_name}
                onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
                placeholder="Ramesh Patel"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
                placeholder="+91 98250 12345"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Quoted Price (₹)</label>
              <input
                type="number"
                value={newVendor.quoted_price}
                onChange={(e) => setNewVendor({ ...newVendor, quoted_price: Number(e.target.value) })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Booking Status</label>
              <select
                value={newVendor.status}
                onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Not Contacted">Not Contacted</option>
                <option value="Contacted">Contacted</option>
                <option value="Quotation Received">Quotation Received</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Booked">Booked</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              Save Vendor
            </button>
          </div>
        </form>
      )}

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vendors.length === 0 ? (
          <div className="col-span-full glass-panel p-10 text-center text-slate-400 text-xs">
            No vendors registered yet. Click 'Add Vendor Contact' above to track your event suppliers.
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600/30 text-purple-300">
                    {vendor.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    vendor.status === "Booked" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {vendor.status}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">{vendor.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{vendor.contact_name || "Primary Representative"}</p>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-purple-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Quoted</span>
                  <span className="font-bold text-white">₹{vendor.quoted_price?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Paid Advance</span>
                  <span className="font-bold text-emerald-400">₹{vendor.paid_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

