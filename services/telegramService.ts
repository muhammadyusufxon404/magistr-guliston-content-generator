
export const sendTelegramMessage = async (token: string, chatId: string, text: string) => {
  // Simple converter to ensure bold text works reliably in Telegram via HTML parse_mode
  // Converts **bold** to <b>bold</b>
  const htmlText = text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
    .replace(/__(.*?)__/g, '<i>$1</i>');    // Italic (sometimes used)

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.description || 'Telegramga yuborishda xatolik');
    }

    return data;
  } catch (error) {
    console.error('Telegram API Error:', error);
    throw error;
  }
};
