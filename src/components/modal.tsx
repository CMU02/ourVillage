"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { useLocation } from "@/contexts/LocationContext";

type Props = {
  onClose?: () => void;
};

export default function Modal({ onClose }: Props) {
  const { setLocation } = useLocation();

  const [province, setProvince] = useState("경기");
  const [city, setCity] = useState("안양");
  const [district, setDistrict] = useState("동안");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocation({ province, city, district }); // 🔥 Context 업데이트
    onClose?.(); // 모달 닫기
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-white p-4 rounded shadow-lg gap-4"
      >
        <div className="flex items-center gap-2">
          <Image src="/icons/location.svg" alt="위치" width={25} height={25} />
          <div className="font-medium">내 위치 등록하기</div>
        </div>

        <div className="flex gap-2">
          <select value={province} onChange={(e) => setProvince(e.target.value)}>
            <option>경기</option>
            <option>강원</option>
          </select>
          <span>도</span>

          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option>안양</option>
            <option>수원</option>
          </select>
          <span>시</span>

          <select value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option>동안</option>
            <option>만안</option>
          </select>
          <span>구</span>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="generalBtn bg-[#75B23B]">
            저장하기
          </button>
          <button type="reset" className="generalBtn bg-gray-300">
            초기화
          </button>
        </div>
      </form>
    </div>
  );
}
