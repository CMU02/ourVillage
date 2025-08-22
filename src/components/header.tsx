"use client";

import { useLocation } from "@/contexts/LocationContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { UltraShortItem, UltraShortResponse } from "@/types/weather.types";

const WEATHER_API_PATH =
  "https://server.cieloblu.co.kr/weather/ultra-short-forecast";

export default function Header() {
  const { location, hasLocation, hasGeoData } = useLocation();
  const [weatherInfo, setWeatherInfo] = useState<UltraShortItem[]>([]); // 날씨 정보

  /**
   * 날씨API 호출하여 날씨 데이터 가져오는 함수 
   */
  const fetchWeather = async () => {
    const userLocationGeo = localStorage.getItem("userLocationGeo");
    if (!userLocationGeo) {
      console.warn("날씨 정보를 가져올 수 없습니다: userLocationGeo가 없습니다.");
      return;
    }

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

      console.log("날씨 API 호출:", { nx, ny, baseDate, baseTime });

      const { data } = await axios.get<UltraShortResponse>(WEATHER_API_PATH, {
        params: {
          nx,
          ny,
          base_date: baseDate,
          base_time: baseTime,
        },
      });

      console.log("날씨 API 응답:", data);
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
    const hours = kstTime.getHours();
    const minutes = kstTime.getMinutes();

    // 현재 시간보다 이전의 가장 가까운 30분 단위 시간 계산
    let baseHour = hours;
    let baseMinute = 30;

    // 현재 분이 30분 미만이면 이전 시간의 30분으로 설정
    if (minutes < 30) {
      baseHour = hours - 1;
      baseMinute = 30;

      // 0시 30분 미만인 경우 전날 23시 30분으로 설정
      if (baseHour < 0) {
        baseHour = 23;
      }
    }

    const baseTime = `${String(baseHour).padStart(2, "0")}${String(baseMinute).padStart(2, "0")}`;
    return baseTime;
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 즉시 날씨 정보 가져오기 시도
    fetchWeather();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  useEffect(() => {
    // 위치 정보가 변경될 때마다 날씨 정보를 다시 가져옴
    if (hasLocation) {
      fetchWeather();
    }
  }, [hasLocation]); // hasLocation이 변경될 때마다 실행

  useEffect(() => {
    // 지오 정보가 업데이트될 때마다 날씨 정보를 다시 가져옴
    if (hasGeoData) {
      fetchWeather();
    }
  }, [hasGeoData]); // hasGeoData가 변경될 때마다 실행

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
              const krTime = Number(getKrTime());

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
