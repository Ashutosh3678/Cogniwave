import type { ChatRequest, ChatResponse } from "../../types/chat";

const CHAT_API_URL = "https://anandvelpuri-zenith.hf.space/chat";

export async function sendChatMessage(
    payload: ChatRequest,
    jwtToken: string
): Promise<ChatResponse> {
    // Ensure we have a valid URL - removing double slashes if any (except protocol)
    const cleanUrl = CHAT_API_URL.replace(/([^:]\/)\/+/g, "$1");

    const res = await fetch(cleanUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Chat API failed (${res.status}): ${errorText}`);
    }

    return res.json();
}

