const { GoogleGenerativeAI } = require("@google/generative-ai");

// ===== SOZLAMALAR =====
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const FOOTER_TEXT = "\n\n📣 @magistr_guliston sahifasini kuzatishda davom eting!";

// ===== OB-HAVO =====
async function fetchWeather() {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=40.49&longitude=68.78&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`
  );
  const data = await res.json();
  const current = data.current;

  const getCondition = (code) => {
    if (code === 0) return "Ochiq havo ☀️";
    if (code <= 3) return "Yengil bulutli 🌤";
    if (code === 45 || code === 48) return "Tumanli 🌫";
    if (code >= 51 && code <= 55) return "Yengil yomg'ir 🌦";
    if (code >= 61 && code <= 65) return "Yomg'ir 🌧";
    if (code >= 71 && code <= 77) return "Qor ❄️";
    return "O'zgaruvchan havo 🌥";
  };

  const rainText = current.precipitation > 0 
    ? `Yog'ingarchilik: ${current.precipitation}mm` 
    : "Yog'ingarchilik ehtimoli past";

  return `🌤 **Sirdaryo viloyati ob-havosi:**

🌡 Harorat: ${current.temperature_2m}°C
💧 Namlik: ${current.relative_humidity_2m}%
💨 Shamol: ${current.wind_speed_10m} m/s
☔️ ${rainText}
☁️ Holat: ${getCondition(current.weather_code)}

@magistr_guliston sahifasini kuzatishda davom eting!`;
}

// ===== GEMINI AI =====
async function generateContent(dateStr, type) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompts = {
    birthdays: `Bugun ${dateStr}. Bugun tug'ilgan mashhur shaxslarni (olimlar, yozuvchilar, san'atkorlar) O'zbek tilida yozing. Emojilar bilan. Faqat matnni qaytaring.`,
    motivation: `O'quvchilarga kuch beradigan qisqa motivatsion fikr yozing. O'zbek tilida, emojilar bilan. Faqat matnni qaytaring.`,
    education: `Qiziqarli ilmiy yoki ta'limiy faktni O'zbek tilida yozing. 2-3 gap. Emojilar bilan. Faqat matnni qaytaring.`
  };

  const result = await model.generateContent(prompts[type]);
  return result.response.text();
}

// ===== TELEGRAM =====
async function sendToTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: "Markdown"
    })
  });
  if (!res.ok) throw new Error("Telegram xatolik");
  console.log("✅ Yuborildi!");
}

// ===== ASOSIY FUNKSIYA =====
async function main() {
  const args = process.argv[2]; // morning, motivation, education
  
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const today = new Date();
  const dateStr = `${today.getDate()}-${months[today.getMonth()]}`;

  try {
    if (args === "morning") {
      // 07:00 - Ob-havo va Tavallud topganlar
      console.log("🌅 Ertalabki postlar yuborilmoqda...");
      
      const weather = await fetchWeather();
      await sendToTelegram(weather);
      await new Promise(r => setTimeout(r, 2000));
      
      const birthdays = await generateContent(dateStr, "birthdays");
      await sendToTelegram(`🎂 **Bugun tavallud topganlar:**\n\n${birthdays}${FOOTER_TEXT}`);
      
    } else if (args === "motivation") {
      // 10:00 - Motivatsiya
      console.log("💡 Motivatsiya yuborilmoqda...");
      
      const motivation = await generateContent(dateStr, "motivation");
      await sendToTelegram(`💡 **Motivatsiya:**\n\n${motivation}${FOOTER_TEXT}`);
      
    } else if (args === "education") {
      // 14:00 - Ta'lim fakti
      console.log("📚 Ta'lim fakti yuborilmoqda...");
      
      const education = await generateContent(dateStr, "education");
      await sendToTelegram(`📚 **Ta'lim fakti:**\n\n${education}${FOOTER_TEXT}`);
      
    } else {
      console.log(`
Foydalanish:
  node scheduler.js morning     - 07:00 (ob-havo + tavallud)
  node scheduler.js motivation  - 10:00 (motivatsiya)
  node scheduler.js education   - 14:00 (ta'lim fakti)
      `);
    }

    console.log("✅ Tayyor!");
  } catch (err) {
    console.error("❌ Xatolik:", err.message);
  }
}

main();
