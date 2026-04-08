import { useState } from "react";

interface LocationResult {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = (): Promise<LocationResult | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Location not supported by your browser");
        setLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Try BigDataCloud first (free, no key, client-side)
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await res.json();

            const city = data.city || data.locality || "";
            const state = data.principalSubdivision || "";
            const pincode = data.postcode || "";
            const street = [data.localityInfo?.administrative?.[4]?.name, data.locality]
              .filter(Boolean).join(", ");

            if (city || state || pincode) {
              setLoading(false);
              resolve({ street, city, state, pincode });
              return;
            }

            // Fallback to Nominatim
            const res2 = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              { headers: { "User-Agent": "BlancParfum/1.0 (customercare@blancparfum.in)" } }
            );
            const data2 = await res2.json();
            const addr = data2.address || {};

            setLoading(false);
            resolve({
              street: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(", "),
              city: addr.city || addr.town || addr.village || addr.state_district || "",
              state: addr.state || "",
              pincode: addr.postcode || "",
            });
          } catch {
            setError("Could not detect address. Please enter manually.");
            setLoading(false);
            resolve(null);
          }
        },
        (err) => {
          setLoading(false);
          if (err.code === err.PERMISSION_DENIED) {
            setError("Location access denied. Please allow location or enter address manually.");
          } else {
            setError("Could not get your location. Please enter manually.");
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  return { detect, loading, error };
}
