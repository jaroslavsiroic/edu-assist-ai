import * as vscode from "vscode";

export function getLanguage(): string {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get<string>("language") || "Lithuanian";
}

export function getAiProvider(): string {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get<string>("aiProvider") || "Ollama";
}

export function getGoogleApiKey(): string {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get<string>("googleApiKey") || "";
}

export function getGoogleModel(): string {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get<string>("googleModel") || "gemini-2.5-flash";
}

export function isDebug(): boolean {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get<boolean>("debugMode") === true;
}
