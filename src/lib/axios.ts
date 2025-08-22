import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://server.cieloblu.co.kr", 
  withCredentials: true, // 쿠키 필요시
  timeout: 30000,

});

export default api;
