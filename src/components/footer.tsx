"use client";

import Image from "next/image";
import { useRef } from "react";
import { useView } from "@/contexts/ViewContext";

type Props = {
  placement: "footer" | "inline"; // footer: 하단 고정, inline: Body 상단
};

export default function Bottom({ placement }: Props) {
  const { setView } = useView();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = () => {
    const value = inputRef.current?.value?.trim() ?? "";
    if (!value) return;
    console.log("send:", value);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <footer
      className={[
        "w-full",
        placement === "footer" ? "sticky bottom-0" : "",
        "p-3 max-md:px-[11px] max-md:pb-[25px]",
      ].join(" ")}
    >
      <div className="w-full">
        {/* 가로 스크롤 영역 */}
        <div
          className="
            mb-[5px]
            overflow-x-auto overflow-y-hidden
            px-1
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            touch-pan-x
          "
          role="tablist"
          aria-label="actions"
        >
          {/* 콘텐츠 행: 전체 너비를 콘텐츠 합으로 강제 */}
          <div className="inline-flex min-w-max gap-2">
            <button
              type="button"
              onClick={() => setView("map")}
              className="flex items-center gap-0.5 generalBtn shrink-0 bg-[#005DAB]"
            >
              <Image
                src="/icons/gyeonggi.svg"
                alt="지역화폐"
                width={15}
                height={15}
                className="object-contain"
              />
              경기지역화폐 가맹점
            </button>

            <button
              type="button"
              onClick={() => setView("map")}
              className="flex items-center gap-0.5 generalBtn shrink-0 bg-[#FFD8A8]"
            >
              <Image
                src="/icons/bus.svg"
                alt="버스 정류장"
                width={15}
                height={15}
                className="object-contain"
              />
              우리 동네 버스 정류장
            </button>

            <button
              type="button"
              className="flex items-center gap-0.5 generalBtn shrink-0 bg-[#D88866]"
            >
              <Image
                src="/icons/service.svg"
                alt="서비스 준비중"
                width={15}
                height={15}
                className="object-contain"
              />
              더 많은 서비스 준비중
            </button>
          </div>
        </div>

        {/* 입력창 */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full h-[40px] rounded-[5px] border-none bg-white px-2 py-1 drop-shadow text-black"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="send"
          >
            <Image
              src="/icons/input.svg"
              alt="send"
              width={24}
              height={24}
              className="object-contain"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}
