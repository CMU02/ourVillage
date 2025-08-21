"use client";

import Header from "../components/header";
import Body from "../components/body";
import Footer from "@/components/footer";
import { ViewProvider, useView } from "@/contexts/ViewContext";

function FooterSlot() {
  const { view } = useView();
  return view === "chat" ? <Footer placement="footer" /> : null;
}

function MainSlot() {
  const { view } = useView();
  // map: 스크롤 숨김, chat: 스크롤 유지
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
  return (
    <ViewProvider>
      <div className="flex flex-col min-h-dvh font-lee">
        <header className="sticky top-0 z-20">
          <Header />
        </header>

        <MainSlot />

        <footer className="z-20">
          <FooterSlot />
        </footer>
      </div>
    </ViewProvider>
  );
}
