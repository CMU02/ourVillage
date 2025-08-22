// contexts/ViewContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Intent = "general" | "local_currency" | "bus";

export type View = "chat" | "map" | "localCurrency" | "bus";

// 차후 MapData 에서 localCurrencyMarker 와 BusMarker 따로 생성 고려
export type MarkerData = {
  lat: number;
  lng: number;
  title: string;
  address?: string;

  // 지역화폐 전용
  industry?: string;

  // 버스 전용
  meta?: {
    vehId: string;
    busType?: string;
    plainNo?: string;
    congetion?: string;
    isFull?: boolean;
    dataTm?: string;
  };
};

type MapData = {
  center: { lat: number; lng: number };
  markers: MarkerData[];
  kind: "localCurrency" | "bus";
};

type Ctx = {
  view: View;
  setView: (v: View) => void;

  mapData: MapData;
  setMapData: (d: MapData) => void;

  // 질문 후 다시 초기화하기 위한 일회용
  intent: Intent;
  setIntent: (i: Intent) => void;
};

const ViewContext = createContext<Ctx | null>(null);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("chat");
  const [mapData, setMapData] = useState<MapData>({
    center: { lat: 37.405, lng: 126.932 },
    markers: [],
    kind: "localCurrency",
  });

  // 기본은 일반 모드
  const [intent, setIntent] = useState<Intent>("general");

  return (
    <ViewContext.Provider
      value={{
        view,
        setView,
        mapData,
        setMapData,
        intent,
        setIntent,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export const useView = () => {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error("useView must be used within <ViewProvider>");
  return ctx;
};
