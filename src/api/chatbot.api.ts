import axios from "axios";

const client = axios.create({
    baseURL: "https://server.cieloblu.co.kr"
});

export interface ChatBotProps {
    userQuestion: string;
    options?: ChatBotOptions;
}

export interface ChatBotOptions {
    coords?: { nx: string; ny: string };
}

export const askChatBot = async ({ userQuestion, options }: ChatBotProps) => {
    const body: any = {
        userQuestion
    };

    // 좌표 정보가 있으면 추가
    if (options?.coords) {
        body.coords = {
            nx: options.coords.nx,
            ny: options.coords.ny
        };
    }

    const res = await client.post('/chatbot/ask', body);
    return res.data;
};