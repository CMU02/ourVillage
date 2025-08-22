"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios"; // axios 인스턴스

export default function Chat() {
  const [text, setText] = useState("우리 동네 궁금증을 해소하세요!");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        // 루트 호출
        const res = await api.get<string>("/");

        // res.data가 문자열이라면 그대로 사용
        setText(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
        
      } catch (e) {
        console.error(e);
        setText("서버 연결 실패");

      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="flex justify-center items-center">
      {loading ? "불러오는 중..." : text}
    </div>
  );
}
