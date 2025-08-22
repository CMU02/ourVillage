"use client";

import { useState, useMemo } from "react";
import Header from "../components/header";
import Body from "../components/body";
import Footer from "@/components/footer";
import { ViewProvider, useView } from "@/contexts/ViewContext";
import Modal from "@/components/modal";
import { LocationProvider } from "@/contexts/LocationContext";

function FooterContainer() {
  const { view } = useView();
  return view === "chat" ? <Footer placement="footer" /> : null;
}

function MainContainer() {
  const { view } = useView();
  const mainClass =
    view === "map"
      ? "flex flex-1 min-h-0 overflow-hidden"
      : "flex flex-1 min-h-0 overflow-y-auto";

  return (
    <main className={mainClass}>
      <Body />
    </main>
  );
}

export default function Home() {
  // ✅ villageCheck: true면 모달 숨김, false면 모달 표시
  // localStorage에 userLocation이 없을 때만 false로 시작
  const [villageCheck, setVillageCheck] = useState<boolean>(() => {
    if (typeof window === "undefined") return true; // SSR 안전
    const saved = localStorage.getItem("userLocation");
    return !!saved; // 값이 있으면 true(모달 숨김), 없으면 false(모달 표시)
  });

  const rootClass = useMemo(
    () =>
      `flex flex-col min-h-dvh font-lee ${
        !villageCheck ? "overflow-hidden" : ""
      }`,
    [villageCheck]
  );

  return (
    <LocationProvider>
      <ViewProvider>
        <div className={rootClass}>
          <header className="sticky top-0 z-20">
            <Header />
          </header>

          <MainContainer />

          <footer className="z-20">
            <FooterContainer />
          </footer>

          {/* userLocation 없을 때만 모달 표시 */}
          {!villageCheck && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
              role="dialog"
              aria-modal="true"
            >
              <Modal onClose={() => setVillageCheck(true)} />
            </div>
          )}
        </div>
      </ViewProvider>
    </LocationProvider>
  );
}
