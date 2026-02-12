
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Use process.env.API_KEY directly in the named parameter object as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface SemanticAnalysis {
  category: string;
  keywords: string[];
  summary: string;
}

export const analyzeFileContent = async (
  fileName: string, 
  content: string, 
  existingCategories: string[]
): Promise<SemanticAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following file name and content snippet. 
      Categorize it into one of these existing categories if it fits: [${existingCategories.join(', ')}]. 
      If it doesn't fit, create a new concise (1-2 word) category name.
      Also provide 3-5 keywords that represent the semantic core of this file.
      
      File Name: ${fileName}
      Content Snippet: ${content.substring(0, 500)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'The semantic category name' },
            keywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: 'Semantic tags for the file'
            },
            summary: { type: Type.STRING, description: 'A 10-word summary of the file content' }
          },
          required: ['category', 'keywords', 'summary'],
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as SemanticAnalysis;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      category: 'Uncategorized',
      keywords: ['error', 'analysis-failed'],
      summary: 'Failed to analyze file content.'
    };
  }
};

/**
 * Generates a comprehensive 500-word educational note on the file's topic.
 */
export const generateDetailedContent = async (fileName: string, currentContent: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Write a high-quality, comprehensive educational note about the topic related to "${fileName}". 
      The content MUST be approximately 500 words long. 
      Use a professional, academic tone. 
      Structure it with an introduction, detailed core concepts, and a conclusion. 
      
      Context from existing content: ${currentContent.substring(0, 300)}`,
    });

    return response.text || "Failed to generate content. Please try again.";
  } catch (error) {
    console.error("Content generation error:", error);
    return "Error generating detailed content. Check your API connection.";
  }
};
