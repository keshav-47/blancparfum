import { useEffect, useState, useRef } from "react";

// In-memory cache — persists across component mounts within the same session
const cache: Record<string, string[]> = {};
const pendingRequests: Record<string, Promise<string[]>> = {};

function fetchCities(state: string): Promise<string[]> {
  if (cache[state]) return Promise.resolve(cache[state]);
  if (pendingRequests[state]) return pendingRequests[state];

  const promise = fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country: "India", state }),
  })
    .then((res) => res.json())
    .then((data) => {
      const cities = !data.error && Array.isArray(data.data) ? data.data.sort() : [];
      cache[state] = cities;
      delete pendingRequests[state];
      return cities;
    })
    .catch(() => {
      delete pendingRequests[state];
      return [] as string[];
    });

  pendingRequests[state] = promise;
  return promise;
}

// Preload all Indian states on first import
const preloaded = useRef ? false : false; // guard for module-level

export function preloadAllCities(states: readonly string[]) {
  states.forEach((s) => fetchCities(s));
}

export function useCitiesForState(state: string) {
  const [cities, setCities] = useState<string[]>(cache[state] || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) { setCities([]); return; }

    // Already cached — instant
    if (cache[state]) {
      setCities(cache[state]);
      return;
    }

    setLoading(true);
    fetchCities(state).then((data) => {
      setCities(data);
      setLoading(false);
    });
  }, [state]);

  return { cities, loading };
}
