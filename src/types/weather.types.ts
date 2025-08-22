export interface UltraShortItem {
    baseDate: string;
    baseTime: string;
    category: string; // "T1H" 등
    fcstDate: string;
    fcstTime: string;
    fcstValue: string;
    nx: number;
    ny: number;
}

export interface UltraShortResponse {
    response: {
        header: {
            resultCode: string;
            resultMsg: string;
        };
        body: {
            items: {
                item: UltraShortItem[];
            };
            totalCount: number;
        };
    };
}