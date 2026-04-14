import * as vscode from "vscode";
import { NekoPanel } from "./webview";
import { handleAI, runPython, resetLadders } from "./commands";

export function activate(context: vscode.ExtensionContext) {
  // Register all commands
  context.subscriptions.push(
    vscode.commands.registerCommand("neko-ai.open", () => {
      NekoPanel.show();
      setupPanelMessageListener();
    }),
    vscode.commands.registerCommand("neko-ai.explainTask", () => handleAI("explainTask")),
    vscode.commands.registerCommand("neko-ai.showExample", () => handleAI("showExample")),
    vscode.commands.registerCommand("neko-ai.explainError", () => handleAI("explainError")),
    vscode.commands.registerCommand("neko-ai.explainCode", () => handleAI("explainCode"))
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      // Only reset if an actual active code editor changed (prevent noise)
      if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
        resetLadders();
      }
    })
  );
}

function setupPanelMessageListener() {
  if (NekoPanel.currentPanel) {
    NekoPanel.currentPanel.onMessageCallback = (msg) => {
      // route new buttons
      handleAI(msg.command, msg.task);
    };
  }
}

// Intercept Panel creation to always ensure listener is set when it's created
const originalShow = NekoPanel.show;
NekoPanel.show = () => {
  originalShow();
  setupPanelMessageListener();
};

export function deactivate() {}

