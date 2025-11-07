
import { GoogleGenAI } from "@google/genai";
import { ServiceCategory } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("La variable de entorno API_KEY no está configurada. Las funciones de Gemini no funcionarán.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateJobDescription = async (title: string, category: ServiceCategory): Promise<string> => {
  if (!API_KEY) {
    return "La clave de API no está configurada. Por favor, establece la variable de entorno API_KEY.";
  }
  
  try {
    const prompt = `Genera una descripción detallada y clara para una solicitud de servicio. La categoría del servicio es "${category}" y el título es "${title}". La descripción debe ser profesional, mencionar posibles problemas comunes relacionados con este servicio y pedir amablemente al profesional que describa su experiencia relevante. Escribe solo el texto de la descripción, sin frases introductorias como "Aquí tienes una descripción:".`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error al generar la descripción del trabajo:", error);
    return "No se pudo generar la descripción. Por favor, escríbela manualmente.";
  }
};
