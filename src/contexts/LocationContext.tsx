"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Location = {
  province: string;
  city: string;
  district: string;
};

type LocationCtx = {
  location: Location;
  setLocation: (loc: Location) => void;
  hasLocation: boolean;
};

const LocationContext = createContext<LocationCtx | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>({
    province: "사용자 미정",
    city: "",
    district: "",
  });
  const [hasLocation, setHasLocation] = useState(false);

  // 컴포넌트 마운트 시 로컬스토리지에서 위치 정보 로드
  useEffect(() => {
    const loadLocationFromStorage = () => {
      const userLocationInfo = localStorage.getItem("userLocation");
      if (userLocationInfo) {
        try {
          const info = JSON.parse(userLocationInfo) as {
            city: string; // 두번째 주소
            district: string;
          };
          setLocation({
            province: "", // 필요시 추가
            city: info.city,
            district: info.district,
          });
          setHasLocation(true);
        } catch (error) {
          console.error("로컬스토리지 위치 정보 파싱 오류:", error);
        }
      }
    };

    loadLocationFromStorage();
  }, []);

  // 위치 정보 업데이트 시 로컬스토리지에도 저장
  const updateLocation = (loc: Location) => {
    setLocation(loc);
    setHasLocation(true);

    // 로컬스토리지에 저장
    const locationInfo = {
      city: loc.city,
      district: loc.district,
    };
    localStorage.setItem("userLocation", JSON.stringify(locationInfo));
  };

  return (
    <LocationContext.Provider value={{ location, setLocation: updateLocation, hasLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within <LocationProvider>");
  return ctx;
};
