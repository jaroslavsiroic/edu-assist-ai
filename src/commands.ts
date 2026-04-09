import * as vscode from "vscode";
import { exec } from "child_process";
import { NekoPanel } from "./webview";
import { streamOllama, buildPrompt, buildErrorPrompt } from "./ai";

export function getCode(): { code: string; editor: vscode.TextEditor } | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  const selection = editor.selection;
  let code = editor.document.getText(selection);

  if (!code) {
    code = editor.document.getText(); // fallback full file
  }

  return { code, editor };
}

export function cleanCode(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (m) =>
      m.replace(/```[a-z]*\n?/, "").replace(/```$/, ""),
    )
    .trim();
}

export async function handleAI(type: string) {
  const ctx = getCode();
  if (!ctx) {
    return;
  }

  NekoPanel.show();
  const panel = NekoPanel.currentPanel;
  if (!panel) { return; }

  panel.send("thinking", "Thinking... 🤔");

  const prompt = buildPrompt(type, ctx.code);

  await streamOllama(prompt, async (chunk, done) => {
    // Send markdown chunk to the panel
    panel.send("talking", chunk, false);

    if (done && (type === "fix" || type === "improve")) {
      const cleaned = cleanCode(chunk);

      await ctx.editor.edit((editBuilder) => {
        editBuilder.replace(ctx.editor.selection, cleaned);
      });
    }
  });
}

export function runPython() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const file = editor.document.fileName;
  
  NekoPanel.show();
  const panel = NekoPanel.currentPanel;
  if (!panel) { return; }

  panel.send("thinking", "Running code... 🏃");

  exec(`python "${file}"`, async (err, stdout, stderr) => {
    if (err) {
      panel.send("thinking", "Found an error... explaining 🐱");

      const prompt = buildErrorPrompt(stderr);

      await streamOllama(prompt, (chunk) => {
        panel.send("talking", chunk, false);
      });
    } else {
      panel.send("talking", "✅ Works!\n\n```text\n" + (stdout || "No output.") + "\n```");
    }
  });
}
