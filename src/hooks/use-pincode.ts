import { useEffect, useState } from "react";

interface PincodeResult {
  city: string;
  state: string;
  loading: boolean;
}

export function usePincodeLookup(pincode: string): PincodeResult {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!/^[0-9]{6}$/.test(pincode)) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setCity(po.District || po.Name || "");
          setState(po.State || "");
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pincode]);

  return { city, state, loading };
}
