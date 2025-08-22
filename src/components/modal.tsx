"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, FormEvent } from "react";
import { useLocation } from "@/contexts/LocationContext";

const CITY_API_URL = "https://server.cieloblu.co.kr/neighborhood/city";
const GEO_API_URL = "https://server.cieloblu.co.kr/neighborhood/get-city-data";

type CityThird = string;
type CitySecond = {
  name: string; // 예: "성남시 분당구", "가평군", "종로구"
  city_thirds: CityThird[];
};
type City = {
  name: string; // 예: "서울특별시", "경기도", "이어도"
  city_seconds: CitySecond[];
};
type ApiResponse = { cities: City[] };

type GeoResponse = {
  grid_x: string;
  grid_y: string;
  logt_hour: string;
  logt_minute: string;
  logt_second: string;
  lat_hour: string;
  lat_minute: string;
  lat_second: string;
  logt_second_100: string;
  lat_second_100: string;
};

type Props = { onClose?: () => void };

// --- Helper: 도/특별시/세종/이어도 구분 ---
function isCityProvince(province: string) {
  return /(특별시|광역시)$/.test(province); // 세종/이어도 제외
}
function isSejongProvince(province: string) {
  return /세종특별자치시$/.test(province);
}
function isIeodoProvince(province: string) {
  return province === "이어도";
}

// --- Helper: 시/구 분리 ---
function splitSiGu(original: string, province: string) {
  const trimmed = original.trim();

  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx > 0) {
    const si = trimmed.slice(0, spaceIdx).trim();
    const gu = trimmed.slice(spaceIdx + 1).trim();
    return { si, gu };
  }

  const m = trimmed.match(/^(.+?(시|군|구))(.*)$/);
  const tail = (m?.[3] || "").trim();
  const head = (m?.[1] || "").trim();

  if (isCityProvince(province)) {
    if (tail) return { si: head, gu: tail };
    if (/구$/.test(head)) return { si: province, gu: head };
    return { si: head, gu: "" };
  }

  if (tail) return { si: head, gu: tail };
  if (/시$|군$/.test(head)) return { si: head, gu: "" };
  if (/구$/.test(head)) return { si: head, gu: "" };
  return { si: head || province, gu: "" };
}

// 첫 번째로 비어있지 않은 동/읍/면을 고르는 유틸
function firstTruthy(arr?: string[]) {
  return Array.isArray(arr) ? arr.find(Boolean) ?? "" : "";
}

export default function Modal({ onClose }: Props) {
  const { setLocation, setHasGeoData } = useLocation();

  // API 데이터
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 선택 상태
  const [province, setProvince] = useState<string>("");
  const [city, setCity] = useState<string>(""); // 저장/POST용 원본 두번째 레벨 (이어도는 "")
  const [citySi, setCitySi] = useState<string>(""); // UI용 시/군
  const [cityGu, setCityGu] = useState<string>(""); // UI용 구
  const [district, setDistrict] = useState<string>("");

  // 초기 로딩
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setIsLoading(true);
        setErrorMsg("");

        const res = await fetch(CITY_API_URL, {
          method: "GET",
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ApiResponse = await res.json();
        const fetchedCities = Array.isArray(data?.cities) ? data.cities : [];
        setCities(fetchedCities);

        // 기본 시/도
        const firstProvince = fetchedCities.find((p) => p?.name)?.name ?? "";

        // 👉 '이어도'면 하위 스킵, city/district 빈 문자열
        if (isIeodoProvince(firstProvince)) {
          setProvince(firstProvince);
          setCity("");
          setCitySi(firstProvince);
          setCityGu("");
          setDistrict("");
          return;
        }

        const seconds =
          fetchedCities.find((p) => p?.name === firstProvince)?.city_seconds ??
          [];
        const firstOriginal = seconds.find((c) => c?.name)?.name ?? "";
        const firstCS = seconds.find((c) => c?.name === firstOriginal) ?? null;

        // 세종: 구 없음, thirds 합쳐 바로 동/읍/면
        if (isSejongProvince(firstProvince)) {
          const allThirds = seconds
            .flatMap((s) => s.city_thirds)
            .filter(Boolean);
          setProvince(firstProvince);
          setCity(firstOriginal); // POST second 용
          setCitySi(firstProvince); // 숨김
          setCityGu("");
          setDistrict(firstTruthy(allThirds));
          return;
        }

        // 일반: 첫 district를 '비어있지 않은 값'으로 선택
        const firstDistrict = firstTruthy(firstCS?.city_thirds);
        const { si, gu } = splitSiGu(firstOriginal, firstProvince);

        setProvince(firstProvince);
        setCity(firstOriginal);
        setCitySi(isCityProvince(firstProvince) ? firstProvince : si);
        setCityGu(gu);
        setDistrict(firstDistrict);
      } catch (err: unknown) {
        if ((err as any)?.name === "AbortError") return;
        setErrorMsg(
          err instanceof Error
            ? `위치 데이터를 불러오지 못했어요: ${err.message}`
            : "위치 데이터를 불러오지 못했어요"
        );
      } finally {
        setIsLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // 현재 province의 원본 citySeconds
  const citySeconds: CitySecond[] = useMemo(() => {
    const p = cities.find((c) => c.name === province);
    return Array.isArray(p?.city_seconds) ? p!.city_seconds : [];
  }, [cities, province]);

  // --- 모드 플래그 ---
  const ieodoProvinceMode = isIeodoProvince(province); // 시/도=이어도
  const sejongMode = isSejongProvince(province);
  const cityProvinceMode = isCityProvince(province);

  // 원본 ↔ 분리 매핑 리스트
  const parsedList = useMemo(() => {
    return citySeconds.map((cs) => {
      const spl = splitSiGu(cs.name, province);
      return {
        original: cs.name,
        si: spl.si,
        gu: spl.gu,
        thirds: cs.city_thirds,
      };
    });
  }, [citySeconds, province]);

  // 시/군 옵션
  const siOptions = useMemo(() => {
    if (ieodoProvinceMode || sejongMode) return []; // 이어도/세종: 숨김
    if (cityProvinceMode) return [province]; // 특별/광역시: 숨김 처리하되 안전 반환
    const set = new Set<string>();
    parsedList.forEach((p) => {
      if (p.si && p.si !== province) set.add(p.si);
    });
    return Array.from(set);
  }, [parsedList, cityProvinceMode, sejongMode, ieodoProvinceMode, province]);

  // 구 옵션
  const guOptions = useMemo(() => {
    if (ieodoProvinceMode || sejongMode) return []; // 이어도/세종: 구 없음
    if (cityProvinceMode) {
      const set = new Set<string>();
      parsedList.forEach((p) => p.gu && set.add(p.gu));
      return Array.from(set);
    } else {
      const set = new Set<string>();
      parsedList
        .filter((p) => p.si === citySi && p.gu)
        .forEach((p) => set.add(p.gu));
      return Array.from(set);
    }
  }, [parsedList, cityProvinceMode, sejongMode, ieodoProvinceMode, citySi]);

  // 동/읍/면 옵션
  const districtOptions: string[] = useMemo(() => {
    if (ieodoProvinceMode) return []; // 이어도: 하위 없음
    if (sejongMode) {
      return citySeconds.flatMap((s) => s.city_thirds).filter(Boolean);
    }
    // 일반
    let selected: CitySecond | null = null;
    if (cityProvinceMode) {
      const hit = parsedList.find((p) => p.gu === cityGu) ?? null;
      selected = hit
        ? citySeconds.find((c) => c.name === hit.original) ?? null
        : null;
    } else {
      const hit =
        parsedList.find((p) => p.si === citySi && p.gu === cityGu) ??
        parsedList.find((p) => p.si === citySi && !p.gu) ??
        null;
      selected = hit
        ? citySeconds.find((c) => c.name === hit.original) ?? null
        : null;
    }
    return Array.isArray(selected?.city_thirds)
      ? selected!.city_thirds.filter(Boolean)
      : [];
  }, [
    ieodoProvinceMode,
    sejongMode,
    cityProvinceMode,
    parsedList,
    cityGu,
    citySi,
    citySeconds,
  ]);

  // province 변경
  function handleProvinceChange(newProvince: string) {
    setProvince(newProvince);

    // 👉 이어도: 하위 단계 스킵, city/district 빈 문자열
    if (isIeodoProvince(newProvince)) {
      setCity("");
      setCitySi(newProvince);
      setCityGu("");
      setDistrict("");
      return;
    }

    const newList =
      cities.find((c) => c.name === newProvince)?.city_seconds ?? [];
    const firstOriginal = newList.find((c) => c?.name)?.name ?? "";
    const firstCS = newList.find((c) => c?.name === firstOriginal) ?? null;

    // 세종 처리
    if (isSejongProvince(newProvince)) {
      const allThirds = newList.flatMap((s) => s.city_thirds).filter(Boolean);
      setCity(firstOriginal);
      setCitySi(newProvince); // 숨김
      setCityGu(""); // 없음
      setDistrict(firstTruthy(allThirds));
      return;
    }

    const firstDistrict = firstTruthy(firstCS?.city_thirds);
    const { si, gu } = splitSiGu(firstOriginal, newProvince);

    setCity(firstOriginal);
    if (isCityProvince(newProvince)) {
      setCitySi(newProvince);
      setCityGu(gu);
    } else {
      setCitySi(si);
      setCityGu(gu);
    }
    setDistrict(firstDistrict);
  }

  // 시/군 변경
  function handleSiChange(newSi: string) {
    setCitySi(newSi);

    const firstGu = parsedList.find((p) => p.si === newSi && p.gu)?.gu ?? "";
    setCityGu(firstGu);

    const hit =
      parsedList.find((p) => p.si === newSi && p.gu === firstGu) ??
      parsedList.find((p) => p.si === newSi && !p.gu) ??
      null;

    const original = hit?.original ?? "";
    const thirds =
      citySeconds.find((c) => c.name === original)?.city_thirds ?? [];
    setCity(original);
    setDistrict(firstTruthy(thirds));
  }

  // 구 변경
  function handleGuChange(newGu: string) {
    setCityGu(newGu);

    let hit = null as null | { original: string; thirds: string[] };
    if (cityProvinceMode) {
      hit = parsedList.find((p) => p.gu === newGu) ?? null;
    } else {
      hit = parsedList.find((p) => p.si === citySi && p.gu === newGu) ?? null;
    }

    const original = hit?.original ?? "";
    const thirds =
      citySeconds.find((c) => c.name === original)?.city_thirds ?? [];
    setCity(original); // 저장/POST는 원본 사용
    setDistrict(firstTruthy(thirds));
  }

  // 동 변경
  function handleDistrictChange(newDistrict: string) {
    setDistrict(newDistrict);
  }

  // 저장
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const locationData = { province, city, district };
    setLocation(locationData); // LocationContext를 통해 설정 (자동으로 localStorage에도 저장됨)

    try {
      setIsSaving(true);
      const res = await fetch(GEO_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          first: province,
          second: ieodoProvinceMode ? "" : city,
          third: ieodoProvinceMode ? "" : district,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const geo: GeoResponse = await res.json();
      localStorage.setItem("userLocationGeo", JSON.stringify(geo));

      // LocationContext에 지오 정보 저장 완료 알림
      setHasGeoData(true);

      onClose?.();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? `좌표 정보를 저장하지 못했어요: ${err.message}`
          : "좌표 정보를 저장하지 못했어요"
      );
    } finally {
      setIsSaving(false);
    }
  }

  // --- UI ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-white p-4 rounded shadow-lg gap-4 min-w-[360px]"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium flex items-center gap-2">
            <Image
              src="/icons/location.svg"
              alt="위치"
              width={25}
              height={25}
            />
            내 위치 등록하기
          </div>
          <button
            type="submit"
            className="generalBtn bg-[#75B23B] disabled:opacity-50"
            disabled={
              isLoading ||
              isSaving ||
              !!errorMsg ||
              !province ||
              (!ieodoProvinceMode && !city) || // 이어도는 city 비필수
              (!ieodoProvinceMode && !sejongMode && !district) // 이어도/세종 제외 시 district 필수
            }
          >
            {isSaving ? "저장 중…" : "저장하기"}
          </button>
        </div>

        {(isLoading || isSaving) && (
          <div className="text-sm text-gray-500">
            {isLoading
              ? "지역 정보를 불러오는 중…"
              : "좌표 정보를 저장하는 중…"}
          </div>
        )}
        {!!errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

        <div className="flex flex-wrap items-center gap-2">
          {/* 1) 시/도 */}
          <select
            value={province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
            disabled={
              isLoading || isSaving || !!errorMsg || cities.length === 0
            }
          >
            {cities
              .filter((prov) => !!prov?.name)
              .map((prov) => (
                <option key={prov.name} value={prov.name}>
                  {prov.name}
                </option>
              ))}
          </select>
          <span>시/도</span>

          {/* 2) 시/군 (세종/특별·광역시/이어도는 숨김) */}
          {!isIeodoProvince(province) &&
            !sejongMode &&
            !isCityProvince(province) && (
              <>
                <select
                  value={citySi}
                  onChange={(e) => handleSiChange(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                  disabled={
                    isLoading ||
                    isSaving ||
                    !!errorMsg ||
                    siOptions.length === 0
                  }
                >
                  {siOptions.map((si) => (
                    <option key={si} value={si}>
                      {si}
                    </option>
                  ))}
                </select>
                <span>시/군</span>
              </>
            )}

          {/* 3) 구 (세종/이어도 없음, 특별·광역시는 표시, 도는 구가 있을 때만) */}
          {!isIeodoProvince(province) &&
            !sejongMode &&
            (isCityProvince(province) || guOptions.length > 0) && (
              <>
                <select
                  value={cityGu}
                  onChange={(e) => handleGuChange(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                  disabled={
                    isLoading ||
                    isSaving ||
                    !!errorMsg ||
                    (isCityProvince(province) ? false : !citySi) ||
                    guOptions.length === 0
                  }
                >
                  {guOptions.map((gu) => (
                    <option key={gu} value={gu}>
                      {gu}
                    </option>
                  ))}
                </select>
                <span>구</span>
              </>
            )}

          {/* 4) 동/읍/면 (세종만 노출, 이어도는 하위 없음 → 비노출) */}
          {!isIeodoProvince(province) && (
            <>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1"
                disabled={
                  isLoading ||
                  isSaving ||
                  !!errorMsg ||
                  districtOptions.length === 0
                }
              >
                {districtOptions
                  .filter((d) => !!d)
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
              <span>동/읍/면</span>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
