
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Topic } from "../types";

export class GeminiService {
  async sendMessage(
    message: string,
    history: Message[],
    topic: Topic
  ): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> {
    
    // Su Vercel, process.env.API_KEY viene iniettata durante la build o l'esecuzione.
    // Assicurati che nelle impostazioni di Vercel la variabile si chiami esattamente API_KEY.
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
      console.error("ERRORE: API_KEY non configurata. Verifica le Environment Variables su Vercel.");
      throw new Error("MISSING_API_KEY");
    }

    // Inizializzazione raccomandata: creare l'istanza subito prima dell'uso
    const ai = new GoogleGenAI({ apiKey });

    try {
      const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: topic.systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "L'assistente non ha restituito testo.";
      
      const sources: Array<{ title: string; uri: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri && chunk.web.title) {
            sources.push({
              title: chunk.web.title,
              uri: chunk.web.uri
            });
          }
        });
      }

      // Rimuoviamo i duplicati dalle fonti
      const uniqueSources = Array.from(new Set(sources.map(s => s.uri)))
        .map(uri => sources.find(s => s.uri === uri)!);

      return { text, sources: uniqueSources };
    } catch (error: any) {
      console.error("Errore durante la chiamata a Gemini:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
