import { useQuery } from "@tanstack/react-query";
import { getUltraShortForecast } from "@/api/weather.api";
import { UltraShortItem } from "@/types/weather.types";

interface WeatherParams {
  nx: string;
  ny: string;
  baseDate: string;
  baseTime: string;
}

export const useWeather = (params: WeatherParams | null) => {
  return useQuery({
    queryKey: ["weather", params?.nx, params?.ny, params?.baseDate, params?.baseTime],
    queryFn: async () => {
      if (!params) throw new Error("날씨 매개변수가 없습니다");
      
      console.log("날씨 API 호출:", params);
      const data = await getUltraShortForecast(
        params.nx,
        params.ny,
        params.baseDate,
        params.baseTime
      );
      console.log("날씨 API 응답:", data);
      return data.response.body.items.item as UltraShortItem[];
    },
    enabled: !!params, // params가 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });
};