"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type View = "chat" | "map";

type Ctx = {
  view: View;
  setView: (v: View) => void;
  inputValue: string;
  setInputValue: (s: string) => void;
};

const ViewContext = createContext<Ctx | null>(null);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("chat");
  const [inputValue, setInputValue] = useState("");
  const value = useMemo(
    () => ({ view, setView, inputValue, setInputValue }),
    [view, inputValue]
  );
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export const useView = () => {
  const ctx = useContext(ViewContext);
  if (!ctx) throw new Error("useView must be used within <ViewProvider>");
  return ctx;
};
