import { GoogleGenAI, Type, Schema, Chat, FunctionDeclaration } from "@google/genai";
import { StudyStyle, OutputFormat, Flashcard, QuizQuestion } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found in environment");
  // Always create a new client to ensure we use the latest key if it was just selected
  return new GoogleGenAI({ apiKey });
};

export const generateNotes = async (
  content: string,
  style: StudyStyle
): Promise<{ title: string; markdown: string }> => {
  const ai = getClient();
  
  const systemInstruction = `
    You are StudyFlow, an expert study companion. 
    Your goal is to create clear, structured study notes.
    Style: ${style}.
    Use clean Markdown formatting (headers, bullet points, bold text).
    Always include a concise Title at the very top.
    Focus on extracting key concepts, definitions, and relationships.
    Do not use generic intros/outros.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: content,
    config: {
      systemInstruction,
      temperature: 0.3,
    },
  });

  const text = response.text || "# Generated Notes\nNo content generated.";
  // Naive title extraction
  const titleMatch = text.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : "Study Session";

  return { title, markdown: text };
};

export const generateFlashcards = async (
  content: string,
  style: StudyStyle,
  count: number = 10
): Promise<{ title: string; cards: Flashcard[] }> => {
  const ai = getClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A short, relevant title for this flashcard deck" },
      cards: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                front: { type: Type.STRING, description: "The question or term on the front of the card" },
                back: { type: Type.STRING, description: "The answer or definition on the back" }
            },
            required: ["front", "back"]
        }
      }
    },
    required: ["title", "cards"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create exactly ${count} study flashcards from the following content. Style: ${style}.\n\nContent:\n${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const result = JSON.parse(response.text || '{"title": "Error", "cards": []}');
  return result;
};

export const generateQuiz = async (
  content: string,
  style: StudyStyle,
  count: number = 5
): Promise<{ title: string; questions: QuizQuestion[] }> => {
  const ai = getClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the quiz" },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING, description: "The correct option string text" },
            explanation: { type: Type.STRING, description: "Why this answer is correct" }
          },
          required: ["id", "question", "options", "answer", "explanation"]
        }
      }
    },
    required: ["title", "questions"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate a multiple-choice practice quiz with exactly ${count} questions based on the following material. Style: ${style}. Ensure options are plausible distrators.\n\nContent:\n${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const result = JSON.parse(response.text || '{"title": "Error", "questions": []}');
  return result;
};

export const summarizeUrl = async (url: string): Promise<string> => {
    const ai = getClient();
    // Using search grounding to understand the URL content since we can't scrape client-side
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the key educational content found at this URL: ${url}. If it is a video, explain the main points covered.`,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    return response.text || "Could not summarize URL content.";
}

export const generateEducationalVideo = async (
  content: string,
  style: StudyStyle
): Promise<{ title: string; videoUri: string }> => {
  const ai = getClient();

  // Step 1: Generate a visual prompt for Veo based on the content
  const promptResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      Convert the following educational content into a detailed prompt for an AI Video Generation model (Veo).
      The user wants an educational video.
      If the content is about history (like the Mughals), describe a cinematic historical recreation of battles or key events.
      Explicitly ask for "Text overlays showing key facts" and "Cinematic style" in the prompt.
      Keep the prompt under 200 words.
      
      Content: ${content.substring(0, 5000)}
    `
  });
  
  const videoPrompt = promptResponse.text || `Educational video about: ${content.substring(0, 50)}`;
  const finalPrompt = `${videoPrompt}. Cinematic, high definition, 4k. Text overlays with facts.`;

  console.log("Generating video with prompt:", finalPrompt);

  // Step 2: Call Veo
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: finalPrompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  // Step 3: Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!downloadLink) {
    throw new Error("Video generation failed to return a URI.");
  }

  // Append API Key for playback
  const videoUri = `${downloadLink}&key=${process.env.API_KEY}`;
  
  const title = "AI Generated Video Lesson";

  return { title, videoUri };
};

// --- AI Tutor Tools ---

const generateImageTool: FunctionDeclaration = {
    name: "generateImage",
    description: "Generates an image based on a detailed text description. Use this when the user asks to see, draw, or generate a diagram, picture, or image.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            prompt: {
                type: Type.STRING,
                description: "A detailed visual description of the image to generate."
            }
        },
        required: ["prompt"]
    }
};

export const generateImageFromText = async (prompt: string): Promise<string> => {
    const ai = getClient();
    // Using gemini-2.5-flash-image (nano banana) for image generation
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }]
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated by the model.");
};

export const getTutorChat = (context: string): Chat => {
  const ai = getClient();
  
  const systemInstruction = `
    You are StudyFlow's AI Tutor.
    The user is currently studying the following material:
    
    --- START OF CONTEXT ---
    ${context.substring(0, 20000)}
    --- END OF CONTEXT ---
    
    Your Role:
    1. Answer the user's doubts specifically based on the context provided above.
    2. If the answer isn't in the notes, use your general knowledge but mention that it wasn't in the specific notes.
    3. Be encouraging, concise, and helpful.
    4. You have access to a tool 'generateImage'. If the user asks for a diagram, visual, or picture, use this tool with a descriptive prompt.
    5. Keep responses conversational.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [generateImageTool] }]
    }
  });
};
