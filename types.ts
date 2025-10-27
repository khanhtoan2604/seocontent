export interface FormData {
  keyword: string;
  sampleUrl: string;
  generateImages: boolean;
  wordCount: number;
  productImage: {
    base64: string;
    mimeType: string;
  } | null;
}

export interface GenerationResult {
  title: string;
  content: string; // The article body in Markdown format
  metaDescription: string;
  slug: string;
  imagePrompts?: string[]; // Prompts for generating images
}

export interface ImageGenerationState {
  isLoading: boolean;
  imageUrl: string | null;
  error: string | null;
}
