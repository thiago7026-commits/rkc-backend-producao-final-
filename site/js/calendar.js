// Calendar helpers.
// Requires Netlify env vars: AIRBNB_ICAL_URL (in the function) and Supabase envs for internal data.

import { supabase } from "./supabaseClient.js";

export async function fetchAirbnbCalendar() {
  const response = await fetch("/.netlify/functions/sync-airbnb-calendar");
  if (!response.ok) {
    throw new Error("Failed to fetch Airbnb calendar");
  }
  return response.json();
}

export async function fetchInternalBlocks() {
  // TODO: replace with your existing tables (reservas/bloqueios) in Supabase.
  // Example:
  // const { data, error } = await supabase.from("reservas").select("checkin, checkout, status");
  // if (error) throw error;
  // return data;
  return [];
}

export function mergeCalendarData(airbnbEvents = [], internalBlocks = []) {
  const merged = [];

  airbnbEvents.forEach((event) => {
    merged.push({
      ...event,
      type: "airbnb",
      color: "#ff6b6b"
    });
  });

  internalBlocks.forEach((block) => {
    merged.push({
      ...block,
      type: block.status || "blocked",
      color: block.status === "reserved" ? "#1dd1a1" : "#576574"
    });
  });

  return merged;
}
