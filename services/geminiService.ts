import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, GenerationResult } from '../types';

// The API key must be obtained exclusively from the environment variable `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'SEO-friendly title for the article.' },
    slug: { type: Type.STRING, description: 'URL-friendly slug.' },
    metaDescription: { type: Type.STRING, description: 'Concise meta description (155-160 characters).' },
    content: { type: Type.STRING, description: 'The full article content as a single HTML string, using tags like h2, h3, h4, p, ul, li, strong.' },
    imagePrompts: {
      type: Type.ARRAY,
      description: 'A list of descriptive prompts for an AI image generator.',
      items: { type: Type.STRING },
    },
  },
  required: ['title', 'slug', 'metaDescription', 'content', 'imagePrompts'],
};


export const generateSeoArticle = async (formData: FormData): Promise<GenerationResult> => {
  const prompt = `You are an expert SEO content writer. Your task is to write a comprehensive, high-quality, and engaging article based on the provided information.

**Primary Keyword:** "${formData.keyword}"

**Article Word Count:** Approximately ${formData.wordCount} words.

**Instructions:**
1.  **Title:** Create a compelling, SEO-friendly title that includes the primary keyword.
2.  **Slug:** Generate a URL-friendly slug for the article (e.g., "how-to-choose-best-air-purifier").
3.  **Meta Description:** Write a concise and enticing meta description (around 155-160 characters) that includes the keyword.
4.  **Content:**
    *   Write the article in well-structured HTML format. Use headings (h2, h3, h4), paragraphs (p), bullet points (ul/li), and bold text (strong) to improve readability. Do not include <html> or <body> tags.
    *   The tone should be informative, authoritative, and helpful to the reader.
    *   Naturally incorporate the primary keyword and related LSI keywords throughout the article.
    *   The article must be at least ${formData.wordCount} words long.
${formData.sampleUrl ? `*   Refer to this sample article for tone and structure, but DO NOT copy its content: ${formData.sampleUrl}` : ''}
${formData.productImage ? `*   The article should be about the product shown in the attached image. Describe its features, benefits, and why it's a good choice for consumers.` : ''}
5.  **Image Prompts:**
${formData.generateImages ? `*   Suggest 3-5 relevant image prompts for the article. These prompts should be descriptive and suitable for an AI image generator (e.g., "A minimalist photo of the sleek air purifier on a wooden side table next to a green plant.").` : '* Do not generate image prompts.'}

Please provide the output in a single JSON object with the specified schema.
If image generation is disabled, the "imagePrompts" array should be empty.`;

  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [{ text: prompt }];

  if (formData.productImage) {
    parts.push({
      inlineData: {
        mimeType: formData.productImage.mimeType,
        data: formData.productImage.base64,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Use gemini-2.5-pro for complex text tasks
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (typeof result.title !== 'string' || typeof result.content !== 'string') {
        throw new Error("Invalid JSON structure received from API.");
    }

    return result as GenerationResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate article: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9', // Standard ratio for website banners/hero images
      },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
};