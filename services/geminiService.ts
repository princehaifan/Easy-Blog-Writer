import { GoogleGenAI, Type } from "@google/genai";
import { BlogSectionData, OutlineSection } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateOutline = async (title: string, language: string, keywords: string): Promise<OutlineSection[]> => {
    let prompt = `Generate a comprehensive, SEO-optimized blog post outline for the title '${title}'. The blog should be written in ${language}.
Provide an introduction, at least 3-4 main sections with clear headings, and a conclusion.
For each section, also provide a short, descriptive prompt for an image generation model that visually represents the section's content.`;

    if (keywords) {
        prompt += `\n\nFocus on naturally incorporating these SEO keywords into the section titles and themes: ${keywords}.`;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sections: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: {
                                    type: Type.STRING,
                                    description: "The heading for this blog section."
                                },
                                imagePrompt: {
                                    type: Type.STRING,
                                    description: "A descriptive prompt for generating a relevant image."
                                }
                            },
                            required: ["title", "imagePrompt"]
                        }
                    }
                },
                required: ["sections"]
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.sections;
    } catch (e) {
        console.error("Failed to parse JSON response:", response.text);
        throw new Error("Could not generate a valid blog outline. The model's response was not valid JSON.");
    }
};

export const generateSectionContent = async (sectionTitle: string, blogTitle: string, language: string, keywords: string): Promise<string> => {
    let prompt = `You are an expert blog writer specializing in SEO. Write a detailed and engaging blog section for the heading "${sectionTitle}" as part of a larger blog post titled "${blogTitle}". 
The content should be in ${language}, informative, easy to read, and naturally incorporate relevant keywords. 
Do not include the heading in your response, only write the paragraph content for the section. Use markdown for formatting like bold text or lists if appropriate.`;

    if (keywords) {
        prompt += `\n\nPay special attention to naturally weaving in the following keywords: ${keywords}.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};

export const generateImageForSection = async (prompt: string): Promise<string | null> => {
    try {
        const fullPrompt = `${prompt}, high quality, photorealistic, blog post illustration`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Image generation failed:", error);
        return null;
    }
};


export const generateBlogFromTitle = async (title: string, language: string, keywords: string): Promise<BlogSectionData[]> => {
    const outline = await generateOutline(title, language, keywords);

    const sectionPromises = outline.map(async (section, index) => {
        const [content, imageUrl] = await Promise.all([
            generateSectionContent(section.title, title, language, keywords),
            generateImageForSection(section.imagePrompt)
        ]);

        return {
            id: `${Date.now()}-${index}`,
            title: section.title,
            imagePrompt: section.imagePrompt,
            content,
            imageUrl
        };
    });

    return await Promise.all(sectionPromises);
};