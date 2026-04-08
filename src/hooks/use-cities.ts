import { useEffect, useState } from "react";

export function useCitiesForState(state: string) {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) { setCities([]); return; }

    let cancelled = false;
    setLoading(true);
    setCities([]);

    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: "India", state }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.error && Array.isArray(data.data)) {
          setCities(data.data.sort());
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [state]);

  return { cities, loading };
}
