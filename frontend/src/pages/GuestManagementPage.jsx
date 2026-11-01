import React, { useEffect, useState } from "react";
import { Users, Plus, Check, MessageCircle, Send, Heart, Copy } from "lucide-react";
import { api } from "../services/api";
import { useEvent } from "../context/EventContext";

export default function GuestManagementPage() {
  const { selectedEvent } = useEvent();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitationLanguage, setInvitationLanguage] = useState("gujarati");
  const [copied, setCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: "",
    group_tag: "Family",
    phone: "",
    pax_count: 2,
    dietary_preference: "Vegetarian",
    rsvp_status: "Confirmed"
  });

  const loadGuests = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const data = await api.getGuests(selectedEvent.id);
      setGuests(data);
    } catch (e) {
      console.error("Guest load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [selectedEvent]);

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !newGuest.name) return;
    try {
      await api.createGuest({ ...newGuest, event_id: selectedEvent.id });
      setShowAddModal(false);
      setNewGuest({ name: "", group_tag: "Family", phone: "", pax_count: 2, dietary_preference: "Vegetarian", rsvp_status: "Confirmed" });
      await loadGuests();
    } catch (e) {
      console.error("Error creating guest:", e);
    }
  };

  const invitationTemplates = {
    gujarati: `શ્રી ગણેશાય નમઃ 🌸
સ્નેહીશ્રી,
અમારા પરિવારના શુભ પ્રસંગે "${selectedEvent?.name || "લગ્ન મહોત્સવ"}" માં આપ સૌ પરિવારજનો સહર્ષ ઉપસ્થિત રહી વર-વધૂને અંતરના આશીર્વાદ આપશો એવી અમારી નમ્ર વિનંતી છે.

તારીખ: ${selectedEvent?.date || "૨૦ ડિસેમ્બર, ૨૦૨૬"}
સ્થળ: ${selectedEvent?.location || "અમદાવાદ, ગુજરાત"}
શુભેચ્છક: પટેલ પરિવાર
(ભોજન સમારંભ: શુદ્ધ શાકાહારી અને જૈન વ્યવસ્થા ઉપલબ્ધ)`,

    hindi: `॥ श्री गणेशाय नमः ॥
सादर निमंत्रण 🌸
परमपिता परमात्मा की असीम अनुकंपा से, हमारे परिवार के मांगलिक अवसर "${selectedEvent?.name || "शुभ विवाह"}" में आपकी उपस्थिति सादर प्रार्थनीय है।

दिनांक: ${selectedEvent?.date || "20 दिसंबर, 2026"}
स्थान: ${selectedEvent?.location || "अहमदाबाद, गुजरात"}
दर्शनाभिलाषी: पटेल परिवार
(भोजन व्यवस्था: शुद्ध शाकाहारी एवं जैन भोजन)`,

    english: `Warm Greetings! 🌸
With the divine blessings of Almighty, we cordially invite you and your family to celebrate the auspicious occasion of:
"${selectedEvent?.name || "Wedding Celebration"}"

Date: ${selectedEvent?.date || "20th December 2026"}
Venue: ${selectedEvent?.location || "Ahmedabad, Gujarat"}
Warm Regards: Patel Family
(Pure Vegetarian & Jain Dining Arrangements)`
  };

  const handleCopyInvitation = () => {
    navigator.clipboard.writeText(invitationTemplates[invitationLanguage]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Smart Guest Experience & Invites
            <span className="text-xs bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-semibold">
              Multilingual Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            RSVP headcounts, dietary flags (Vegetarian/Jain), and WhatsApp invitation generation in Gujarati, Hindi & English.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Add Guest Entry
        </button>
      </div>

      {/* Multilingual Invitation Generator Box */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-[#111827] to-indigo-950/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-400" />
              AI Cultural Invitation Text Generator
            </h2>
            <p className="text-xs text-slate-400">Personalized cultural invitation for instant WhatsApp sharing</p>
          </div>
          <div className="flex items-center gap-2">
            {["gujarati", "hindi", "english"].map((lang) => (
              <button
                key={lang}
                onClick={() => setInvitationLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  invitationLanguage === lang
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-[#1E293B] text-slate-300 hover:bg-slate-700"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-[#0B0F19]/80 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
          {invitationTemplates[invitationLanguage]}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCopyInvitation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied to Clipboard!" : "Copy Shareable Message"}
          </button>
        </div>
      </div>

      {/* Add Guest Modal/Form */}
      {showAddModal && (
        <form onSubmit={handleAddGuest} className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">New Guest Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Guest / Family Head Name</label>
              <input
                type="text"
                required
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
                placeholder="e.g. Mukesh & Family"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Group Affiliation</label>
              <select
                value={newGuest.group_tag}
                onChange={(e) => setNewGuest({ ...newGuest, group_tag: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Family">Family / Relatives</option>
                <option value="Close Friends">Close Friends</option>
                <option value="VIP">VIP Dignitaries</option>
                <option value="Colleagues">Work Colleagues</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Pax Count (Headcount)</label>
              <input
                type="number"
                min={1}
                value={newGuest.pax_count}
                onChange={(e) => setNewGuest({ ...newGuest, pax_count: Number(e.target.value) })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Dietary Requirement</label>
              <select
                value={newGuest.dietary_preference}
                onChange={(e) => setNewGuest({ ...newGuest, dietary_preference: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Vegetarian">Pure Vegetarian</option>
                <option value="Jain">Jain (No Root Veg / Onion / Garlic)</option>
                <option value="Vegan">Vegan</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">RSVP Status</label>
              <select
                value={newGuest.rsvp_status}
                onChange={(e) => setNewGuest({ ...newGuest, rsvp_status: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white"
                placeholder="+91 98250..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
            >
              Save Guest
            </button>
          </div>
        </form>
      )}

      {/* Guest Roster Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <h2 className="text-sm font-bold text-white mb-4">Confirmed Guest Roster</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3">Guest / Family</th>
                <th className="pb-3">Group Tag</th>
                <th className="pb-3">Pax Count</th>
                <th className="pb-3">Dietary</th>
                <th className="pb-3">RSVP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No guests logged yet. Click 'Add Guest Entry' to begin building your guest list.
                  </td>
                </tr>
              ) : (
                guests.map((g) => (
                  <tr key={g.id} className="text-slate-300 hover:bg-slate-800/30">
                    <td className="py-3 font-medium text-white">{g.name}</td>
                    <td className="py-3">{g.group_tag}</td>
                    <td className="py-3 font-semibold">{g.pax_count} Pax</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        g.dietary_preference === "Jain" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {g.dietary_preference}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                        {g.rsvp_status}
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
  );
}

