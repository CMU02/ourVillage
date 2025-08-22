"use client";

import { getWeatherCondition } from "@/components/vaildWeatherCondition";
import { useLocation } from "@/contexts/LocationContext";
import { useWeather } from "@/hooks/useWeather";
import { UltraShortItem } from "@/types/weather.types";
import { buildForecastBase, getKstParts } from "@/utils/krTime";
import Image from "next/image";
import { useMemo } from "react";
import WeatherAlarm from "./weatherAlarm";

export default function Header() {
  const { location, hasLocation, hasGeoData } = useLocation();

  // 날씨 API 매개변수 계산
  const weatherParams = useMemo(() => {
    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window === "undefined") return null;

    // 행정구역과 좌표 정보가 모두 있어야 함
    if (!hasLocation || !hasGeoData) return null;

    const userLocationGeo = localStorage.getItem("userLocationGeo");
    if (!userLocationGeo) return null;

    try {
      const { grid_x: nx, grid_y: ny } = JSON.parse(userLocationGeo) as {
        grid_x: string;
        grid_y: string;
      };

      const params = buildForecastBase(nx, ny);
      return params;
    } catch (error) {
      console.error("지오 정보 파싱 오류:", error);
      return null;
    }
  }, [hasLocation, hasGeoData]); // hasLocation과 hasGeoData가 변경될 때마다 재계산

  // React Query를 사용한 날씨 데이터 가져오기
  const { data: weatherInfo = [], isLoading, error } = useWeather(weatherParams);

  const getClosestItme = (item: UltraShortItem[]) => {
    const kstParts = getKstParts(new Date());
    const krTime = Number(`${kstParts.hour.padStart(2, '0')}${kstParts.minute.padStart(2, '0')}`);

    // console.log('getClosestItme Debug:', {
    //   krTime,
    //   itemCount: item.length,
    //   fcstTimes: item.map(i => i.fcstTime),
    //   filteredItems: item.filter((i) => Number(i.fcstTime) <= krTime)
    // });

    const filteredItems = item.filter((i) => Number(i.fcstTime) <= krTime);

    if (filteredItems.length === 0) {
      // console.log('No items found <= current time, returning earliest future item');
      // 현재 시간보다 이후의 데이터만 있다면 가장 이른 시간의 데이터 반환
      const earliestItem = item.sort((a, b) => Number(a.fcstTime) - Number(b.fcstTime))[0];
      // console.log('Selected earliest future item:', earliestItem);
      return earliestItem;
    }

    const result = filteredItems.sort((a, b) => Number(b.fcstTime) - Number(a.fcstTime))[0];
    // console.log('Selected item:', result);

    return result;
  }

  // 온도 표시 로직
  const getTemperatureDisplay = () => {
    if (isLoading) return "로딩중...";
    if (error) {
      console.error('Weather error:', error);
      return "오류";
    }

    const t1hItems = weatherInfo.filter((i) => i.category === "T1H");

    if (t1hItems.length === 0) return "데이터 없음";
    const closest = getClosestItme(t1hItems);

    return closest ? `${closest.fcstValue}°C` : "데이터 없음";
  };

  // 날씨 아이콘과 설명 가져오기
  const getWeatherDisplay = () => {
    if (isLoading || error || !weatherInfo.length) {
      return {
        icon: "/icons/sunny.svg",
        description: "날씨"
      };
    }

    const skyItems = weatherInfo.filter((i) => i.category === "SKY");
    const precipitationItems = weatherInfo.filter((i) => i.category === "PTY");

    const skyItem = skyItems.length ? getClosestItme(skyItems) : undefined;
    const precipitationItem = precipitationItems.length ? getClosestItme(precipitationItems) : undefined;

    return getWeatherCondition({ skyItem, precipitationItem });
  };

  const weatherDisplay = getWeatherDisplay();

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
              src={weatherDisplay.icon}
              alt={weatherDisplay.description}
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
          <WeatherAlarm weatherInfo={weatherInfo} />
        </div>
      </div>
    </header>
  );
}