import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  try {
    const ai = getAiClient();
    // Remove header from base64 string if present (data:image/jpeg;base64,...)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "You are a professional OCR engine. Extract all the text from this image accurately. Preserve the layout structure as much as possible using Markdown (headers, lists, tables). If the image is handwritten, do your best to transcribe it. Return ONLY the markdown content."
          }
        ]
      }
    });

    return response.text || "No text extracted.";
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to extract text from the document.");
  }
};
