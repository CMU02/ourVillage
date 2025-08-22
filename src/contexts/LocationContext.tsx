"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Location = {
  province: string;
  city: string;
  district: string;
};

type LocationCtx = {
  location: Location;
  setLocation: (loc: Location) => void;
};

const LocationContext = createContext<LocationCtx | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>({
    province: "사용자 미정",
    city: "",
    district: "",
  });

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within <LocationProvider>");
  return ctx;
};
