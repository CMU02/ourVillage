// contexts/ViewContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Intent = "general" | "local_currency" | "bus";

export type View = "chat" | "map" | "localCurrency" | "bus";

export type MarkerData = {
  lat: number;
  lng: number;
  title: string;
  address?: string;
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

  // ⬇️ 추가: intent (질문 1회용 모드)
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
