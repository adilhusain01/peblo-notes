import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function generateNoteInsights(content: string, title?: string) {
  const prompt = `You are an AI assistant analyzing a note. Given the following note content, provide:
1. A concise summary (2-3 sentences)
2. Key action items extracted (list of specific tasks/todos)
3. A suggested title if the current title is missing or weak

Note Title: ${title || "Untitled"}
Note Content: ${content}

Respond with ONLY valid JSON in this exact format:
{
  "summary": "concise summary here",
  "action_items": ["action 1", "action 2"],
  "suggested_title": "suggested title here"
}`

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    prompt,
  });

  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned);
}
