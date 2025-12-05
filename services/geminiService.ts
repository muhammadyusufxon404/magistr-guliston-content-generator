import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedContent } from '../types';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    educationFact: {
      type: Type.STRING,
      description: "A short, interesting educational fact in Uzbek with emojis.",
    },
    motivation: {
      type: Type.STRING,
      description: "A short motivational quote/thought in Uzbek with emojis.",
    },

    birthdays: {
      type: Type.STRING,
      description: "Famous people born on this day in Uzbek with emojis.",
    },
  },
  required: ["educationFact", "motivation", "birthdays"],
};

export const generateDailyContent = async (dateStr: string): Promise<GeneratedContent> => {
  const modelId = "gemini-2.5-flash"; // Optimized for speed/cost for text tasks
  
  const prompt = `
    Siz Telegram kanali (@magistr_guliston) uchun kontent yaratuvchi yordamchisiz.
    Bugungi sana: ${dateStr}.
    
    Quyidagi 4 ta bo'lim uchun O'zbek tilida (lotin alifbosida) qisqa, qiziqarli va Telegram uchun tayyor formatda (Markdown) matn yozing.
    
    Talablar:
    1. Ta'lim fakti: Qiziqarli ilmiy yoki ta'limiy fakt. 1-2 gap.
    2. Motivatsiya: O'quvchiga kuch beradigan qisqa fikr.
    3. Bugun tug'ilganlar: Bugun tug'ilgan mashhur shaxslar (olimlar, yozuvchilar).
    
    Har bir matn oxirida "@magistr_guliston sahifasini kuzatishda davom eting!" so'zini QOSHMANG (buni dastur o'zi qo'shadi).
    Faqat asosiy mazmunni yozing. Emojilardan foydalaning.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedContent;
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};
