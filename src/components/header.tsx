"use client";

import { useLocation } from "@/contexts/LocationContext";
import Image from "next/image";
import { useMemo } from "react";
import { useWeather } from "@/hooks/useWeather";
import { getKrTime } from "@/utils/krTime";

export default function Header() {
  const { location, hasLocation } = useLocation();

  // 날씨 API 매개변수 계산
  const weatherParams = useMemo(() => {
    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window === "undefined") return null;

    const userLocationGeo = localStorage.getItem("userLocationGeo");
    if (!userLocationGeo) return null;

    try {
      const { grid_x: nx, grid_y: ny } = JSON.parse(userLocationGeo) as {
        grid_x: string;
        grid_y: string;
      };

      const now = new Date();
      const kstTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
      const baseTime = getKrTime();

      // 0시 30분 미만인 경우 전날 날짜로 설정
      let baseDate;
      if (kstTime.getHours() === 0 && kstTime.getMinutes() < 30) {
        const yesterday = new Date(kstTime);
        yesterday.setDate(yesterday.getDate() - 1);
        baseDate = yesterday.toISOString().slice(0, 10).replace(/-/g, "");
      } else {
        baseDate = kstTime.toISOString().slice(0, 10).replace(/-/g, "");
      }

      return { nx, ny, baseDate, baseTime };
    } catch (error) {
      console.error("지오 정보 파싱 오류:", error);
      return null;
    }
  }, [hasLocation]); // hasLocation이 변경될 때마다 재계산

  // React Query를 사용한 날씨 데이터 가져오기
  const { data: weatherInfo = [], isLoading, error } = useWeather(weatherParams);

  // 온도 표시 로직
  const getTemperatureDisplay = () => {
    if (isLoading) return "로딩중...";
    if (error) return "오류";

    const t1hItems = weatherInfo.filter((i) => i.category === "T1H");
    if (!t1hItems.length) return "데이터 없음";

    const krTime = Number(getKrTime());
    const closest = t1hItems
      .filter((i) => Number(i.fcstTime) <= krTime)
      .sort((a, b) => Number(b.fcstTime) - Number(a.fcstTime))[0];

    return closest ? `${closest.fcstValue}°C` : "데이터 없음";
  };

  return (
    <header className="sticky w-full max-md:px-[11px] max-md:pt-[15px] p-3">
      <div className="w-full h-[40px] rounded-[5px] border-none bg-white drop-shadow flex items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-1">
          {/* 위치 표시 영역 */}
          <div>
            {hasLocation
              ? `${location.city} ${location.district}`
              : "사용자 위치 지정"}
          </div>

          <div></div>
          <div>
            <Image
              src="/icons/sunny.svg"
              alt="날씨"
              width={15}
              height={15}
              className="object-contain"
            />
          </div>

          {/* 온도 표시: 로딩/에러/정상 */}
          <div>
            {getTemperatureDisplay()}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex items-center gap-0.5 generalBtn shrink-0 bg-[#FF6F6F]">
            <Image
              src="/icons/heatWave.svg"
              alt="폭염 경보"
              width={15}
              height={15}
              className="object-contain"
            />
            폭염 경보
          </button>
          <button className="flex items-center gap-0.5 generalBtn shrink-0 bg-[#896FFF]">
            <Image
              src="/icons/mask.svg"
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