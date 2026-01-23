export interface ChatRequest {
    message: string;
    thread_id: string;
}

export interface ChatResponse {
    response?: string;
    reply_markdown?: string;
    message?: string;
    [key: string]: any;
}
