import { GoogleGenAI, Type } from "@google/genai";
import { DeconstructedNote, RemixedContent, Platform, NoteType } from "../types";

// Helper to get AI client. Always use named parameter and process.env.API_KEY.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeContentWithAI = async (
  textContext: string,
  files: File[]
): Promise<DeconstructedNote> => {
  // Always create a new client instance right before use to ensure the latest API key is used.
  const ai = getAiClient();
  const fileParts = await Promise.all(files.map(fileToGenerativePart));

  const prompt = `
    你是一个顶级的新媒体爆款内容拆解专家。
    请分析用户上传的素材（图片/视频截图/视频文件）以及提供的文本内容。

    用户需求：
    1. **平台识别**：判断是抖音、小红书还是视频号风格。
    2. **内容拆解**：
       - **标题**：提取核心标题。
       - **视觉分析**：如果是视频，必须分析“拍摄风格”、“镜头语言”、“剪辑节奏”；如果是图片则分析构图角度。
       - **音画拆解 (仅视频)**：提取口播文案 (spokenContent) 和画面文字 (screenText)。
       - **脚本还原 (仅视频)**：按照镜号、画面描述、音频内容还原原视频脚本。
    3. **改写建议**：
       - 给出 3 个爆款标题建议，每个标题严禁超过 20 个字。
    4. **规范**：严禁在任何列表项前使用 "-" 符号。

    请以 JSON 格式输出。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [{ text: prompt }, ...fileParts]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                platform: { type: Type.STRING, enum: [Platform.DOUYIN, Platform.XIAOHONGSHU, Platform.VIDEO_ACCOUNT, Platform.UNKNOWN] },
                type: { type: Type.STRING, enum: [NoteType.VIDEO, NoteType.IMAGE_TEXT] },
                title: { type: Type.STRING },
                contentBody: { type: Type.STRING },
                visualDescription: { type: Type.STRING },
                spokenContent: { type: Type.STRING },
                screenText: { type: Type.STRING },
                videoScript: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sceneNo: { type: Type.INTEGER },
                            visual: { type: Type.STRING },
                            audio: { type: Type.STRING }
                        },
                        required: ["sceneNo", "visual", "audio"]
                    }
                },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                titleSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                remixIdea: { type: Type.STRING }
            },
            required: ["platform", "type", "title", "contentBody", "visualDescription", "tags", "titleSuggestions", "remixIdea"]
        }
      }
    });

    // Directly access the .text property from the response object.
    const text = response.text || "{}";
    const data = JSON.parse(text);
    return { id: Math.random().toString(36).substring(7), ...data };
  } catch (error) {
    console.error("Analysis Error", error);
    throw error;
  }
};

export const generateRemixedContent = async (
  referenceNote: DeconstructedNote,
  userContext: string
): Promise<RemixedContent> => {
  // Create a new client instance right before use.
  const ai = getAiClient();
  const isVideo = referenceNote.type === NoteType.VIDEO;

  const prompt = `
    你是一位全能新媒体专家。基于“参考内容”和“用户新主题”，创作一篇爆款文案${isVideo ? '以及一份拍摄脚本' : ''}。

    --- 参考背景 ---
    原标题: ${referenceNote.title}
    核心视觉逻辑: ${referenceNote.visualDescription}
    
    --- 用户新主题 ---
    ${userContext}

    --- 任务要求 ---
    1. **爆款标题**：极具吸引力，带Emoji，**严禁超过 20 个字**。
    2. **笔记正文**：小红书/抖音高转化风格，多Emoji，分段清晰，亲切感强。
    3. **标签**：5-8个高热度话题。
    4. **创作脚本 (重点)**：如果是视频改写，请根据新主题编写一份标准的拍摄脚本，包含镜号、新画面视觉描述、新口播/音频。
    5. **规范**：正文中严禁在列表前使用 "-" 符号。

    请直接输出 JSON 数据。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedVisuals: { type: Type.STRING },
                script: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sceneNo: { type: Type.INTEGER },
                            visual: { type: Type.STRING },
                            audio: { type: Type.STRING }
                        },
                        required: ["sceneNo", "visual", "audio"]
                    }
                }
            },
            required: ["title", "content", "tags", "suggestedVisuals"]
        }
      }
    });
    // Use the .text property to retrieve the generated string.
    const text = response.text;
    if (!text) throw new Error("AI returned empty text");
    return JSON.parse(text) as RemixedContent;
  } catch (error) {
    console.error("Remix Error", error);
    throw error;
  }
};