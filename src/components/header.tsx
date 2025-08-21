"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky w-full max-md:px-[11px] max-md:pt-[15px] p-3">
      <div className="w-full h-[40px] rounded-[5px] border-none bg-white drop-shadow flex items-center justify-center gap-2 p-2">
        <div className="flex items-center gap-1">
          <div>안양시 동안구</div>
          <div>|</div>
          <div>
            <Image
              src="/icons/top.png"
              alt="날씨"
              width={15}
              height={15}
              className="object-contain"
            ></Image>
          </div>
          <div>35°</div>
        </div>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-0.5 generalBtn shrink-0 bg-[#FF6F6F]">
            <Image
              src="/icons/top_1.png"
              alt="폭염 경보"
              width={15}
              height={15}
              className="object-contain"
            />
            폭염 경보
          </button>
          <button className="flex items-center gap-0.5 generalBtn shrink-0 bg-[#896FFF]">
            <Image
              src="/icons/top_2.png"
              alt="미세먼지"
              width={15}
              height={15}
              className="object-contain"
            />
            미세먼지 좋음
          </button>
        </div>
      </div>
    </header>
  );
}
