import { UltraShortResponse } from "@/types/weather.types";
import axios from "axios";
const client = axios.create({
    baseURL: 'https://server.cieloblu.co.kr/weather'
})

export const getUltraShortForecast = async (nx: string, ny: string, base_date: string, base_time: string): Promise<UltraShortResponse> => {
    const response = await client.get('/ultra-short-forecast', {
        params: { nx, ny, base_date, base_time }
    })

    return response.data;
}