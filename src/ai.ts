import { getLanguage } from "./config";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "gemma4:e2b"; // using the same as original

export function buildPrompt(type: string, code: string): string {
  const lang = getLanguage();
  
  if (type === "fix") {
    if (lang === "English") {
      return `Fix this Python code. Rules: Provide only code, no explanations, minimal changes.\n\n${code}`;
    }
    return `Pataisyk Python kodą.\nTaisyklės:\n- Tik kodas\n- Be paaiškinimų\n- Minimalūs pakeitimai\n\n${code}`;
  }

  if (type === "improve") {
    if (lang === "English") {
      return `Improve this Python code. Rules: Make it clearer and cleaner, preserve the same functionality, provide only code.\n\n${code}`;
    }
    return `Pagerink Python kodą.\nTaisyklės:\n- Aiškesnis ir švaresnis\n- Ta pati funkcija\n- Tik kodas\n\n${code}`;
  }

  // explain
  if (lang === "English") {
    return `Explain this Python code very simply for a kid learning to code:\n\n${code}`;
  }
  return `Paaiškink šį Python kodą labai paprastai lietuviškai:\n\n${code}`;
}

export function buildErrorPrompt(stderr: string): string {
  const lang = getLanguage();
  if (lang === "English") {
    return `Explain this Python error very simply for a kid learning to code:\n\n${stderr}`;
  }
  return `Paaiškink šią Python klaidą paprastai lietuviškai:\n\n${stderr}`;
}

export async function streamOllama(
  prompt: string,
  onChunk: (text: string, done: boolean) => void,
) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: true,
    }),
  });

  const reader = res.body?.getReader();
  if (!reader) { return; }

  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.response) {
          full += json.response;
          onChunk(full, false);
        }
      } catch (e) {
        // ignore parse error for incomplete chunks
      }
    }
  }

  onChunk(full, true);
}
