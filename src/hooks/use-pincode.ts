import { useEffect, useState } from "react";

interface PincodeResult {
  city: string;
  state: string;
  loading: boolean;
  valid: boolean | null; // null = not checked yet, true = valid, false = invalid
}

export function usePincodeLookup(pincode: string): PincodeResult {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!/^[0-9]{6}$/.test(pincode)) {
      if (pincode.length === 6) setValid(false);
      else setValid(null);
      setCity("");
      setState("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setValid(null);

    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setCity(po.District || po.Name || "");
          setState(po.State || "");
          setValid(true);
        } else {
          setCity("");
          setState("");
          setValid(false);
        }
      })
      .catch(() => {
        if (!cancelled) setValid(null); // network error — don't block
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pincode]);

  return { city, state, loading, valid };
}
