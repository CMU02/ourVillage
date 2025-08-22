"use client";

import Footer from "@/components/footer";
import Modal from "@/components/modal";
import { useEffect, useMemo, useState } from "react";
import Body from "../components/body";
import Header from "../components/header";

import { ChatProvider } from "@/contexts/ChatContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { ViewProvider, useView } from "@/contexts/ViewContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Tanstack Query Client 객체 생성
const queryClient = new QueryClient();

// 푸터컨테이너 분기점 반응형
function FooterContainer() {
  const { view } = useView();
  return view === "chat" ? <Footer placement="footer" /> : null;
}

// 메인컨테이너 분기점 반응형
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
  const [villageCheck, setVillageCheck] = useState<boolean>(true); // 초기값은 항상 true로 설정
  const [isClient, setIsClient] = useState(false);

  // 클라이언트에서만 localStorage 확인
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("userLocation");
    setVillageCheck(!!saved);
  }, []);

  const rootClass = useMemo(
    () =>
      `flex flex-col min-h-dvh font-lee ${!villageCheck ? "overflow-hidden" : ""
      }`,
    [villageCheck]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <ChatProvider>
          <ViewProvider>
            <div className={rootClass}>
              <header className="sticky top-0 z-20">
                <Header />
              </header>

              <MainContainer />

              <footer className="sticky bottom-0 z-20">
                <FooterContainer />
              </footer>

              {/* villageCheck가 false일 때 전체 화면을 덮는 오버레이 */}
              {!villageCheck && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
                  role="dialog"
                  aria-modal="true"
                >
                  {/* Modal 자체는 투명 배경 위의 카드라고 가정 */}
                  <Modal onClose={() => setVillageCheck(true)} />
                </div>
              )}
            </div>
          </ViewProvider>
        </ChatProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}
