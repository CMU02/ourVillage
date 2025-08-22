"use client";
import { Map, MapMarker } from "react-kakao-maps-sdk";

type Props = { onClose: () => void };

export default function KakaoMap({ onClose }: Props) {
  return (
    <div className="relative w-full h-full">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md hover:bg-green-600"
        aria-label="close map"
      >
        ✕
      </button>

      <Map
        className="rounded-[8px] drop-shadow"
        center={{ lat: 37.391378, lng: 126.956516 }}
        style={{ width: "100%", height: "100%" }}
        level={3}
      >
        <MapMarker position={{ lat: 37.391378, lng: 126.956516 }} />
      </Map>
    </div>
  );
}
