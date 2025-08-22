// 한국 시간 계산 함수 (컴포넌트 외부로 이동)
export const getKrTime = () => {
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