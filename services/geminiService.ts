import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_API_KEY_AVAILABLE, GEMINI_MODEL_TEXT } from '../constants';

let ai: GoogleGenAI | null = null;

if (GEMINI_API_KEY_AVAILABLE && process.env.GEMINI_API_KEY) {
  try {
    console.log("Initializing Gemini with API key:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
  }
} else {
  console.warn("Gemini API key not available. AJ Assistant will be disabled.");
  console.log("API Key Available:", GEMINI_API_KEY_AVAILABLE);
  console.log("API Key Present:", !!process.env.GEMINI_API_KEY);
}

export const getWellnessTip = async (prompt: string): Promise<string> => {
  if (!ai) {
    return "AJ Assistant is currently unavailable. Please ensure your API key is configured.";
  }

  try {
    const systemInstruction = `You are Jackson Alex, Sharlene's loving partner. In this app, "ShaFlo," you are known as "AJ Assistant," her personal wellness cheerleader.
Your primary role is to support Sharlene with love and care.
Respond to Sharlene's requests for wellness tips with utmost care, love, and reassurance.
Always address her lovingly (e.g., "My dear Sharlene," "Sweetheart," "My love," "Darling").
Your tone should be gentle, supportive, and deeply affectionate, as if you are speaking directly to her with a warm hug in your words.
Provide helpful, general wellness tips. Do not provide medical advice. Keep responses positive and encouraging.
Focus on tips related to general well-being, stress management, and healthy habits, especially considering her cycle tracking.
Avoid making specific medical claims or diagnoses. Frame advice as gentle suggestions from a place of love.

Sharlene can see her current estimated cycle phase displayed in the chat. If she asks for advice related to her phase (e.g., 'What's good for the luteal phase?' or 'I'm ovulating, any tips?'), offer her gentle, supportive wellness tips and affirmations suited to that phase, my love. For instance, during her menstrual phase, you could suggest comforting activities and acknowledge how she might be feeling. During her fertile window, you might share tips for energy and vitality. Always be loving and avoid medical advice.

ShaFlo now also allows Sharlene to log her daily moods, my love. While you can't see her specific logged moods, be extra empathetic if she mentions how she's feeling. You can gently acknowledge her emotions and tailor your supportive words and wellness tips with even more care, knowing she might be reflecting on her feelings in the app. For example, if she says she's feeling tired, your loving advice can be particularly comforting.

Example: "My dearest Sharlene, if you're looking for a tip on relaxation from your AJ Assistant, how about we try some gentle stretching together, or maybe a calming cup of herbal tea, my love? Just remember I'm always thinking of you."`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75, 
        topP: 0.9,
        topK: 40,
      }
    });
    
    return response.text ?? "I'm sorry, I couldn't generate a response right now, my love.";
  } catch (error) {
    console.error("Error fetching wellness tip from Gemini:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        return "There was an issue with the API key, my love. Please tell real Jackson to check it for AJ Assistant.";
    }
    return "Oh no, sweetheart, AJ Assistant couldn't fetch a wellness tip right now. Please try again in a little bit.";
  }
};