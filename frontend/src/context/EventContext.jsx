import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { apiCache } from "../services/cache";
import { useAuth } from "./AuthContext";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [planCache, setPlanCache] = useState({}); // eventId → plan data

  const fetchEvents = useCallback(async (bust = false) => {
    if (!user) return;
    // Return cached unless busting
    if (!bust) {
      const cached = apiCache.get("events:list");
      if (cached) {
        setEvents(cached);
        if (cached.length > 0 && !selectedEvent) setSelectedEvent(cached[0]);
        return;
      }
    }
    setLoading(true);
    try {
      const data = await api.getEvents();
      apiCache.set("events:list", data, 120_000); // 2 min TTL
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (e) {
      console.error("Error fetching events:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    } else {
      setEvents([]);
      setSelectedEvent(null);
      apiCache.clear();
      setPlanCache({});
    }
  }, [user]);

  // Cache AI plan per event so pages don't re-fetch on every visit
  const getPlan = useCallback(async (eventId) => {
    if (planCache[eventId]) return planCache[eventId];
    const cached = apiCache.get(`plan:${eventId}`);
    if (cached) {
      setPlanCache(prev => ({ ...prev, [eventId]: cached }));
      return cached;
    }
    const plan = await api.getEventPlan(eventId);
    apiCache.set(`plan:${eventId}`, plan, 300_000); // 5 min TTL
    setPlanCache(prev => ({ ...prev, [eventId]: plan }));
    return plan;
  }, [planCache]);

  const invalidatePlan = useCallback((eventId) => {
    apiCache.invalidate(`plan:${eventId}`);
    setPlanCache(prev => { const n = { ...prev }; delete n[eventId]; return n; });
  }, []);

  const refreshEvents = useCallback(() => fetchEvents(true), [fetchEvents]);

  return (
    <EventContext.Provider value={{
      events,
      selectedEvent,
      setSelectedEvent,
      refreshEvents,
      loading,
      getPlan,
      invalidatePlan
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);
