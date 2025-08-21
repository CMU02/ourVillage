"use client";

import Image from "next/image";

export default function Modal() {
  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col w-auto h-auto max-w-[90%] border-none bg-white p-[15px] rounded-[8px]">
        {/* 팝업 상단 안내문 + 버튼 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1">
            <Image
              src="/icons/setting.png"
              alt="위치"
              width={25}
              height={25}
              className="object-contain"
            />
            <div>내 위치 등록하기</div>
          </div>
          <div className="flex gap-1">
            <button className="generalBtn bg-[#75B23B]">저장하기</button>
            <button className="generalBtn bg-[#75B23B]">초기화</button>
          </div>
        </div>

        {/* 리스트박스 영역 */}
        <div className="flex justify-center items-center gap-1.5 mt-4">
          {/* 도 */}
          <select className="border rounded px-2 py-1">
            <option>경기</option>
            <option>강원</option>
          </select>
          <span>도</span>
          {/* 시 */}
          <select className="border rounded px-2 py-1">
            <option>안양</option>
            <option>수원</option>
          </select>
          <span>시</span>
          {/* 구 */}
          <select className="border rounded px-2 py-1">
            <option>동안</option>
            <option>만안</option>
          </select>
          <span>구</span>
        </div>
      </div>
    </div>
  );
}
