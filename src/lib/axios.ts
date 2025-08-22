import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://server.cieloblu.co.kr", 
  withCredentials: true, // 쿠키 필요시
  timeout: 5000,

});

// GET 예제
// async function fetchWeather(city: string) {
//   const res = await axios.get(`/api/weather?city=${city}`);
//   return res.data;
// }

// POST 예제
// async function saveLocation(province: string, city: string, district: string) {
//   const res = await axios.post("/api/location", {
//     province,
//     city,
//     district,
//   });
//   return res.data;
// }

export default api;
