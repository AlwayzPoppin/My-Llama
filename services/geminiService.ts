import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TrainingPair, ForgePlan, OLLAMA_MODELS, ToolDefinition } from "../types";

let API_KEY = "";

export const setGeminiApiKey = (key: string) => {
  API_KEY = key;
};

const getAI = () => {
  if (!API_KEY) {
    // Fallback to process.env if available, but primarily use the dynamic key
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.API_KEY;
    if (envKey) return new GoogleGenAI({ apiKey: envKey });
    throw new Error("Gemini API Key not configured. Please enter one in settings.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateSyntheticAudio = async (text: string, voice: string = 'Kore'): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio ? `data:audio/pcm;base64,${base64Audio}` : '';
};

export const generateSyntheticVideo = async (prompt: string): Promise<string> => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateSyntheticData = async (
  topic: string,
  count: number = 5,
  includeThought: boolean = false
): Promise<TrainingPair[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate ${count} high-quality instruction-response pairs for fine-tuning an LLM on: ${topic}. 
    ${includeThought ? 'For each pair, include a "thought" field that explains the step-by-step logical reasoning process (CoT) required to arrive at the answer.' : ''}
    Each pair should be accurate, concise, and professional.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            instruction: { type: Type.STRING },
            response: { type: Type.STRING },
            thought: { type: Type.STRING }
          },
          required: includeThought ? ["instruction", "response", "thought"] : ["instruction", "response"]
        }
      }
    }
  });

  try {
    const rawData = JSON.parse(response.text || '[]');
    return rawData.map((item: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      ...item
    }));
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return [];
  }
};

export const autoRankPreference = async (prompt: string, optionA: string, optionB: string): Promise<{ winner: 'A' | 'B', critique: string }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-latest',
    contents: `As a Master AI Critic and Senior Software Architect, evaluate these two AI outputs for the prompt: "${prompt}".
    
    CRITIQUE CRITERIA:
    1. Functional Correctness
    2. Maintainability
    3. Conciseness
    
    OPTION A:
    """
    ${optionA}
    """
    
    OPTION B:
    """
    ${optionB}
    """
    
    Select the winner and provide a technical critique.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winner: { type: Type.STRING, description: "Must be 'A' or 'B'" },
          critique: { type: Type.STRING, description: "Technical justification for the choice" }
        },
        required: ["winner", "critique"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return { winner: data.winner as 'A' | 'B', critique: data.critique };
};

export const getAutoForgePlan = async (mission: string, availableModels?: string[]): Promise<ForgePlan> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-latest',
    contents: `Act as a world-class AI Orchestrator. Mission: "${mission}".
    
    If the mission involves Voice Acting:
    - Focus on scripts, phonetic markers, and emotional resonance.
    - Enable Audio features if possible.
    - Curriculum should include 'Instruction: [Script Line] -> Response: [Vocal Direction/Labeling]'.
    
    If the mission involves Video Editing:
    - Focus on pacing, narrative flow, and visual consistency.
    - Enable Vision and Video features.
    - Curriculum should include 'Instruction: [Scene description/Shot list] -> Response: [Edit recommendations/Cut timing]'.
    
    If the mission involves Video, Audio, or Multimodality:
    - Ensure Video/Audio features are noted in the config.
    - Set the protocol to include Temporal analysis or Acoustic synthesis.
    
    General rules:
    1. Select base model from: ${availableModels && availableModels.length > 0 ? availableModels.join(', ') : OLLAMA_MODELS.join(', ')}.
    2. Determine config (epochs, learningRate, contextLength, vision).
    3. Generate 10 lessons.
    Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          config: {
            type: Type.OBJECT,
            properties: {
              baseModel: { type: Type.STRING },
              epochs: { type: Type.NUMBER },
              learningRate: { type: Type.NUMBER },
              batchSize: { type: Type.NUMBER },
              contextLength: { type: Type.NUMBER },
              visionEnabled: { type: Type.BOOLEAN },
              visionEncoder: { type: Type.STRING },
              audioEnabled: { type: Type.BOOLEAN },
              videoEnabled: { type: Type.BOOLEAN }
            }
          },
          missionBriefing: { type: Type.STRING },
          protocol: { type: Type.ARRAY, items: { type: Type.STRING } },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                instruction: { type: Type.STRING },
                response: { type: Type.STRING },
                thought: { type: Type.STRING }
              }
            }
          }
        },
        required: ["config", "missionBriefing", "protocol", "lessons"]
      }
    }
  });

  try {
    const plan = JSON.parse(response.text || '{}');
    return {
      ...plan,
      lessons: plan.lessons.map((l: any) => ({ ...l, id: Math.random().toString(36).substr(2, 9) }))
    };
  } catch (error) {
    throw new Error("Failed to generate mission plan.");
  }
};

export const verifyDataset = async (dataset: any[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Review this training dataset for quality. For each entry, mark as 'pass' or 'fail'.
    Dataset: ${JSON.stringify(dataset.map(d => ({ id: d.id, instruction: d.instruction, response: d.response })))}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            status: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["id", "status"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
}

export const generateToolLessons = async (tool: ToolDefinition, count: number = 3) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate ${count} training lessons for tool: ${tool.name}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            instruction: { type: Type.STRING },
            response: { type: Type.STRING }
          },
          required: ["instruction", "response"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]').map((d: any) => ({ id: Math.random().toString(36).substr(2, 9), ...d }));
}

export const generateModelfile = async (baseModel: string, config: any): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create an Ollama Modelfile for a model based on "${baseModel}". 
    Config: Epochs=${config.epochs}, LR=${config.learningRate}, Batch=${config.batchSize}.`,
  });
  return response.text || `# Modelfile\nFROM ${baseModel}`;
};
