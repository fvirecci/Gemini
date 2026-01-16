
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Topic } from "../types";

export class GeminiService {
  private getApiKey(): string | undefined {
    // Prova a recuperare la chiave da diverse fonti comuni in ambienti serverless/statici
    return process.env.API_KEY;
  }

  async sendMessage(
    message: string,
    history: Message[],
    topic: Topic
  ): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> {
    
    const apiKey = this.getApiKey();

    if (!apiKey || apiKey === "undefined" || apiKey.length < 5) {
      console.error("API_KEY mancante o non valida.");
      throw new Error("MISSING_API_KEY");
    }

    // Creiamo l'istanza qui per assicurarci di usare la chiave più recente
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

      const text = response.text || "Nessuna risposta ricevuta dal modello.";
      
      const sources: Array<{ title: string; uri: string }> = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web && chunk.web.uri && chunk.web.title) {
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
          }
        });
      }

      // Filtra duplicati
      const uniqueSources = Array.from(new Set(sources.map(s => s.uri)))
        .map(uri => sources.find(s => s.uri === uri)!);

      return { text, sources: uniqueSources };
    } catch (error: any) {
      console.error("Errore API Gemini:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
