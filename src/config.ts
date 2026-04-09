import * as vscode from "vscode";

export function getLanguage(): string {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get<string>("language") || "Lithuanian";
}
