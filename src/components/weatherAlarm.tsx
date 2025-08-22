import { UltraShortItem } from "@/types/weather.types";
import { getKstParts } from "@/utils/krTime";
import Image from "next/image";

interface WeatherAlarmProps {
  weatherInfo: UltraShortItem[];
}

interface AlarmInfo {
  type:
    | "폭염주의보"
    | "폭염경보"
    | "호우주의보"
    | "호우경보"
    | "강풍주의보"
    | "강풍경보"
    | "낙뢰주의보"
    | "한파주의보"
    | "한파경보";
  iconPath: string;
  color: string;
  message: string;
}

export default function WeatherAlarm({ weatherInfo }: WeatherAlarmProps) {
  // 현재 시간에 가장 가까운 데이터 가져오기
  const getClosestItem = (items: UltraShortItem[]) => {
    if (typeof window === "undefined") return items[0]; // SSR 안전

    const kstParts = getKstParts(new Date());
    const krTime = Number(
      `${kstParts.hour.padStart(2, "0")}${kstParts.minute.padStart(2, "0")}`
    );

    const filtered = items.filter((i) => Number(i.fcstTime) <= krTime);
    if (filtered.length === 0) {
      return items.sort((a, b) => Number(a.fcstTime) - Number(b.fcstTime))[0];
    }

    return filtered.sort((a, b) => Number(b.fcstTime) - Number(a.fcstTime))[0];
  };

  // 각 카테고리별 데이터 추출
  const getWeatherData = () => {
    const t1hItems = weatherInfo.filter((i) => i.category === "T1H"); // 기온
    const rn1Items = weatherInfo.filter((i) => i.category === "RN1"); // 1시간 강수량
    const wsdItems = weatherInfo.filter((i) => i.category === "WSD"); // 풍속
    const lgtItems = weatherInfo.filter((i) => i.category === "LGT"); // 낙뢰

    return {
      temperature: t1hItems.length
        ? parseFloat(getClosestItem(t1hItems)?.fcstValue || "0")
        : 0,
      rainfall: rn1Items.length
        ? parseFloat(getClosestItem(rn1Items)?.fcstValue || "0")
        : 0,
      windSpeed: wsdItems.length
        ? parseFloat(getClosestItem(wsdItems)?.fcstValue || "0")
        : 0,
      lightning: lgtItems.length
        ? parseFloat(getClosestItem(lgtItems)?.fcstValue || "0")
        : 0,
    };
  };

  // 경보 판단 로직
  const getActiveAlarms = (): AlarmInfo[] => {
    const { temperature, rainfall, windSpeed, lightning } = getWeatherData();
    const alarms: AlarmInfo[] = [];

    // 🌡️ 폭염 관련
    if (temperature >= 35) {
      alarms.push({
        type: "폭염경보",
        iconPath: "/icons/heatWave.svg",
        color: "bg-[#FF6F6F]]",
        message: `폭염경보 (${temperature}°C)`,
      });
    } else if (temperature >= 33) {
      alarms.push({
        type: "폭염주의보",
        iconPath: "/icons/heatWave.svg",
        color: "bg-[#FF6F6F]]",
        message: `폭염주의보 (${temperature}°C)`,
      });
    }

    // ❄️ 한파 관련 (snow 아이콘 사용)
    if (temperature <= -15) {
      alarms.push({
        type: "한파경보",
        iconPath: "/icons/snow.svg",
        color: "bg-[#896FFF]]",
        message: `한파경보 (${temperature}°C)`,
      });
    } else if (temperature <= -12) {
      alarms.push({
        type: "한파주의보",
        iconPath: "/icons/snow.svg",
        color: "bg-[#896FFF]]",
        message: `한파주의보 (${temperature}°C)`,
      });
    }

    // 🌧️ 호우 관련
    if (rainfall >= 30) {
      alarms.push({
        type: "호우경보",
        iconPath: "/icons/heavyRain.svg",
        color: "bg-[#2C8BC0]]",
        message: `호우경보 (${rainfall}mm/h)`,
      });
    } else if (rainfall >= 20) {
      alarms.push({
        type: "호우주의보",
        iconPath: "/icons/heavyRain.svg",
        color: "bg-[#2C8BC0]",
        message: `호우주의보 (${rainfall}mm/h)`,
      });
    }

    // 💨 강풍 관련
    if (windSpeed >= 21) {
      alarms.push({
        type: "강풍경보",
        iconPath: "/icons/strongWind.svg",
        color: "bg-[#505D66]",
        message: `강풍경보 (${windSpeed}m/s)`,
      });
    } else if (windSpeed >= 14) {
      alarms.push({
        type: "강풍주의보",
        iconPath: "/icons/strongWind.svg",
        color: "bg-[#505D66]",
        message: `강풍주의보 (${windSpeed}m/s)`,
      });
    }

    // ⚡ 낙뢰 관련 (yellowDust 아이콘을 낙뢰용으로 사용하거나 wind 아이콘 사용)
    if (lightning > 0) {
      alarms.push({
        type: "낙뢰주의보",
        iconPath: "/icons/wind.svg",
        color: "bg-[#505D66]",
        message: "낙뢰주의보",
      });
    }

    return alarms;
  };

  const activeAlarms = getActiveAlarms();

  return (
    <div className="flex flex-wrap gap-1">
      {activeAlarms.length === 0 ? (
        <button
          className="flex items-center gap-0.5 generalBtn shrink-0 text-gray-600 bg-gray-100"
          title="현재 발효 중인 기상 경보가 없습니다"
        >
          <Image src="/icons/noAlarm.svg" alt="경보 없음" width={16} height={16} />
          <span className="text-xs">경보 없음</span>
        </button>
      ) : (
        activeAlarms.map((alarm, index) => (
          <button
            key={index}
            className={`flex items-center gap-0.5 generalBtn shrink-0 text-white ${alarm.color}`}
            title={alarm.message}
          >
            <Image
              src={alarm.iconPath}
              alt={alarm.type}
              width={16}
              height={16}
              className="filter brightness-0 invert"
            />
            <span className="text-xs">{alarm.type}</span>
          </button>
        ))
      )}
    </div>
  );
}
