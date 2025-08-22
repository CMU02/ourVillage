import { UltraShortItem } from "@/types/weather.types";

interface WeatherConditionProps {
    skyItem?: UltraShortItem;
    precipitationItem?: UltraShortItem;
}

interface WeatherInfo {
    icon: string;
    description: string;
}

/**
 * 날씨 조건에 따른 아이콘과 설명을 반환하는 함수
 * 1. 강수형태(PTY)를 먼저 확인
 * 2. 강수형태가 0(없음)이면 하늘상태(SKY)로 판단
 * 3. 강수형태가 1 이상이면 강수형태로 판단
 */
export function getWeatherCondition({ skyItem, precipitationItem }: WeatherConditionProps): WeatherInfo {
    // 기본값
    const defaultWeather: WeatherInfo = {
        icon: "/icons/sunny.svg",
        description: "맑음"
    };

    // 강수형태 확인
    const precipitationType = precipitationItem ? parseInt(precipitationItem.fcstValue) : 0;

    // 강수형태가 0이 아닌 경우 (비, 눈 등)
    if (precipitationType > 0) {
        switch (precipitationType) {
            case 1: // 비
                return {
                    icon: "/icons/rain.svg",
                    description: "비"
                };
            case 2: // 비/눈
                return {
                    icon: "/icons/rain.svg", // 기존 rain 아이콘 사용
                    description: "비/눈"
                };
            case 3: // 눈
                return {
                    icon: "/icons/snow.svg",
                    description: "눈"
                };
            case 5: // 빗방울
                return {
                    icon: "/icons/rain.svg", // 기존 rain 아이콘 사용
                    description: "빗방울"
                };
            case 6: // 빗방울눈날림
                return {
                    icon: "/icons/rain.svg", // 기존 rain 아이콘 사용
                    description: "빗방울눈날림"
                };
            case 7: // 눈날림
                return {
                    icon: "/icons/snow.svg",
                    description: "눈날림"
                };
            default:
                return defaultWeather;
        }
    }

    // 강수형태가 0인 경우 하늘상태로 판단
    const skyCondition = skyItem ? parseInt(skyItem.fcstValue) : 1;

    switch (skyCondition) {
        case 1: // 맑음
            return {
                icon: "/icons/sunny.svg",
                description: "맑음"
            };
        case 3: // 구름많음
            return {
                icon: "/icons/cloud.svg", // 기존 cloud 아이콘 사용
                description: "구름많음"
            };
        case 4: // 흐림
            return {
                icon: "/icons/cloud.svg", // 기존 cloud 아이콘 사용
                description: "흐림"
            };
        default:
            return defaultWeather;
    }
}

// 기존 컴포넌트 형태도 유지 (호환성)
export default function ValidWeatherCondition({ skyItem, precipitationItem }: WeatherConditionProps) {
    return getWeatherCondition({ skyItem, precipitationItem });
}