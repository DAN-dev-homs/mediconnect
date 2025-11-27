import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePrescriptionAdvice = async (medicationName: string, patientAge: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Donne-moi une posologie standard et des instructions brèves pour le médicament "${medicationName}" pour un patient de ${patientAge} ans. 
      Réponds en JSON avec les champs: dosage (string), instructions (string).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dosage: { type: Type.STRING },
            instructions: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Error:", error);
    return { dosage: "À déterminer", instructions: "Consulter le vidal." };
  }
};

export const summarizeConsultation = async (notes: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Résume les notes médicales suivantes de manière professionnelle pour le dossier patient: \n\n${notes}`
        });
        return response.text;
    } catch (e) {
        return "Erreur de résumé.";
    }
};