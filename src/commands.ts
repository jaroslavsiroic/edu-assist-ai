import * as vscode from "vscode";
import { exec } from "child_process";
import { NekoPanel } from "./webview";
import { streamModel, buildPrompt } from "./ai";

export function getCode(): { code: string; document: vscode.TextDocument } | null {
  let editor = vscode.window.activeTextEditor;

  // If no active editor (e.g. focus is on webview), search visible editors for a Python file
  if (!editor) {
    editor = vscode.window.visibleTextEditors.find(e => 
      e.document.languageId === "python" || e.document.fileName.endsWith(".py")
    );
  }

  // Fallback to the first visible editor if any
  if (!editor && vscode.window.visibleTextEditors.length > 0) {
    editor = vscode.window.visibleTextEditors[0];
  }

  if (!editor) {
    return null;
  }

  // Robustly fetch full text as requested
  const code = editor.document.getText();
  return { code, document: editor.document };
}

export function cleanCode(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, (m) =>
      m.replace(/```[a-z]*\n?/, "").replace(/```$/, ""),
    )
    .trim();
}

interface LadderState {
  explainTask: number;
  showExample: number;
  explainError: number;
  explainCode: number;
}

export const activeLadders: LadderState = {
  explainTask: 1,
  showExample: 1,
  explainError: 1,
  explainCode: 1,
};

const MAX_RUNGS: Record<keyof LadderState, number> = {
  explainTask: 3,
  showExample: 3,
  explainError: 4,
  explainCode: 4,
};

export function resetLadders() {
  activeLadders.explainTask = 1;
  activeLadders.showExample = 1;
  activeLadders.explainError = 1;
  activeLadders.explainCode = 1;
}

export async function handleAI(type: string, taskDescription: string = "") {
  if (type === "clearChat") {
    resetLadders();
    return;
  }

  const ctx = getCode();
  if (!ctx) {
    return;
  }

  NekoPanel.show();
  const panel = NekoPanel.currentPanel;
  if (!panel) { return; }

  let currentRung = 1;
  if (type in activeLadders) {
    currentRung = activeLadders[type as keyof LadderState];
  }

  panel.send("thinking", "Thinking... 🤔", false, currentRung);

  const prompt = buildPrompt(type, ctx.code, taskDescription, currentRung);
  panel.sendDebug(`Command '${type}' (Rung ${currentRung}) triggered. Establishing stream...`);

  // Advance ladder for next time
  if (type in activeLadders && activeLadders[type as keyof LadderState] < MAX_RUNGS[type as keyof LadderState]) {
    activeLadders[type as keyof LadderState]++;
  }

  await streamModel(prompt, async (chunk, done) => {
    panel.sendDebug(`Chunk received | done: ${done} | length: ${chunk.length}`);
    // Send markdown chunk to the panel
    panel.send("talking", chunk, false, currentRung);
  });
}

export function runPython() {
  const ctx = getCode();
  if (!ctx) {
    return;
  }

  const file = ctx.document.fileName;
  
  NekoPanel.show();
  const panel = NekoPanel.currentPanel;
  if (!panel) { return; }

  panel.send("thinking", "Running code... 🏃", false);

  exec(`python "${file}"`, async (err, stdout, stderr) => {
    if (err) {
      panel.send("thinking", "Found an error... explaining 🐱", false, activeLadders.explainError);

      panel.sendDebug(`Python run failed, analyzing error...`);
      let currentRung = activeLadders.explainError;
      const prompt = buildPrompt("explainError", stderr, "", currentRung);
      
      if (activeLadders.explainError < MAX_RUNGS.explainError) {
        activeLadders.explainError++;
      }

      await streamModel(prompt, (chunk) => {
        panel.sendDebug(`Chunk received | length: ${chunk.length}`);
        panel.send("talking", chunk, false, currentRung);
      });
    } else {
      panel.send("talking", "✅ Works!\n\n```text\n" + (stdout || "No output.") + "\n```");
    }
  });
}
