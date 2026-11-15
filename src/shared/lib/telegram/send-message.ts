const TELEGRAM_API_BASE = "https://api.telegram.org";

export async function sendTelegramMessage(text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        return;
    }

    try {
        const response = await fetch(
            `${TELEGRAM_API_BASE}/bot${token}/sendMessage`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    chat_id: chatId,
                    text,
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                }),

                cache: "no-store",
            },
        );

        if (!response.ok) {
            const result = await response.json();

            console.error("TELEGRAM SEND ERROR", result);
        }
    } catch (error) {
        console.error("TELEGRAM SEND ERROR", error);
    }
}