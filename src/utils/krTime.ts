// 한국 시간 계산 함수 (컴포넌트 외부로 이동)
export function getKstParts(date: Date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).formatToParts(date);

    const get = (type: string) => parts.find(p => p.type === type)!.value;
    return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        hour: get("hour"),
        minute: get("minute"),
    };
}

export function buildForecastBase(nx: string, ny: string) {
    const now = new Date();

    const LAG_MIN = 10; // 발행 지연 버퍼(필요시 7~12 사이로 조정)
    const t = new Date(now.getTime() - LAG_MIN * 60_000);
    const { year, month, day, hour, minute } = getKstParts(t);

    let baseDate = `${year}${month}${day}`;
    let baseTime: string;

    if (parseInt(minute, 10) >= 30) {
        // 같은 시각의 HH:30 사용
        baseTime = `${hour}30`;
    } else {
        // 아직 HH:30 데이터가 안정적으로 없을 수 있음
        // 30분 더 빼서 '직전 시각'으로 이동 후 그 시각의 HH:30 사용
        const tPrev = new Date(t.getTime() - 30 * 60_000);
        const p = getKstParts(tPrev);
        baseDate = `${p.year}${p.month}${p.day}`;
        baseTime = `${p.hour}30`;
    }

    // 디버그
    // console.log({ nx, ny, baseDate, baseTime });

    return { nx, ny, baseDate, baseTime };
} 