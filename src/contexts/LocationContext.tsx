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
  hasGeoData: boolean; // Geo 데이터 유무
  setHasGeoData: (hasGeo: boolean) => void; // Geo 데이터 유무 설정 함수
};

const LocationContext = createContext<LocationCtx | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>({
    province: "사용자 미정",
    city: "",
    district: "",
  });
  const [hasLocation, setHasLocation] = useState(false); // 행정구역 정보
  const [hasGeoData, setHasGeoData] = useState(false); // 행정구역 좌표 정보
  const [isClient, setIsClient] = useState(false);

  // 컴포넌트 마운트 시 로컬스토리지에서 위치 정보 로드
  useEffect(() => {
    setIsClient(true);
    
    const userLocationInfo = localStorage.getItem("userLocation");
    const userLocationGeo = localStorage.getItem("userLocationGeo");

    if (userLocationInfo) {
      try {
        const info = JSON.parse(userLocationInfo) as {
          province?: string;
          city: string;
          district: string;
        };
        setLocation({
          province: info.province || "",
          city: info.city,
          district: info.district,
        });
        setHasLocation(true);
      } catch (error) {
        console.error("로컬스토리지 위치 정보 파싱 오류:", error);
      }
    }

    // 지오 정보 확인
    if (userLocationGeo) {
      setHasGeoData(true);
    }
  }, []);

  // 위치 정보 업데이트 시 로컬스토리지에도 저장
  const updateLocation = (loc: Location) => {
    setLocation(loc);
    setHasLocation(true);

    // 로컬스토리지에 저장 (province 포함)
    const locationInfo = {
      province: loc.province,
      city: loc.city,
      district: loc.district,
    };
    localStorage.setItem("userLocation", JSON.stringify(locationInfo));
  };

  return (
    <LocationContext.Provider value={{ location, setLocation: updateLocation, hasLocation, hasGeoData, setHasGeoData }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within <LocationProvider>");
  return ctx;
};
