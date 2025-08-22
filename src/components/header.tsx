"use client";

import { useLocation } from "@/contexts/LocationContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { UltraShortItem, UltraShortResponse } from "@/types/weather.types";

const WEATHER_API_PATH =
  "https://server.cieloblu.co.kr/weather/ultra-short-forecast";

export default function Header() {
  const { location, hasLocation } = useLocation();
  const [weatherInfo, setWeatherInfo] = useState<UltraShortItem[]>([]); // 날씨 정보

  /**
   * 날씨API 호출하여 날씨 데이터 가져오는 함수 
   */
  const fetchWeather = async () => {
    const userLocationGeo = localStorage.getItem("userLocationGeo");
    if (!userLocationGeo) return console.warn("위치 정보가 없습니다.");
    
    try {
      const { grid_x: nx, grid_y: ny } = JSON.parse(userLocationGeo) as {
        grid_x: string;
        grid_y: string;
      };

      const { data } = await axios.get<UltraShortResponse>(WEATHER_API_PATH, {
        params: {
          nx,
          ny,
          base_date: new Date().toISOString().slice(0, 10).replace(/-/g, ""), // YYYYMMDD
          base_time: getKrTime().toString(),
        },
      });
      setWeatherInfo(data.response.body.items.item);
    } catch (error) {
      console.error("날씨 정보 가져오기 실패:", error);
    }
  };

  const getKrTime = () => {
    const now = new Date();
    const kstTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    const hours = String(kstTime.getHours()).padStart(2, "0");
    const minutes = String(kstTime.getMinutes()).padStart(2, "0");
    const currentTime = Number(`${hours}${minutes}`);
    return currentTime;
  };

  useEffect(() => {
    // 위치 정보가 있을 때만 날씨 정보를 가져옴
    if (hasLocation) {
      fetchWeather();
    }
  }, [hasLocation]); // hasLocation이 변경될 때마다 실행

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
            {(() => {
              const t1hItems = weatherInfo.filter((i) => i.category === "T1H");
              if (!t1hItems.length) return "데이터 없음";
              const krTime = getKrTime();

              // 현재 시간보다 작거나 같은 fcstTime 중에서 가장 큰 값
              const closest = t1hItems
                .filter((i) => Number(i.fcstTime) <= krTime)
                .sort((a, b) => Number(b.fcstTime) - Number(a.fcstTime))[0];
              return closest ? `${closest.fcstValue}°C` : "데이터 없음";
            })()}
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
