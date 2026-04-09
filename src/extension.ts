import * as vscode from "vscode";
import { NekoPanel } from "./webview";
import { handleAI, runPython } from "./commands";

export function activate(context: vscode.ExtensionContext) {
  // Register all commands
  context.subscriptions.push(
    vscode.commands.registerCommand("neko-ai.open", () => {
      NekoPanel.show();
      setupPanelMessageListener();
    }),
    vscode.commands.registerCommand("neko-ai.fix", () => handleAI("fix")),
    vscode.commands.registerCommand("neko-ai.explain", () => handleAI("explain")),
    vscode.commands.registerCommand("neko-ai.improve", () => handleAI("improve")),
    vscode.commands.registerCommand("neko-ai.runPython", runPython)
  );
}

function setupPanelMessageListener() {
  if (NekoPanel.currentPanel) {
    NekoPanel.currentPanel.onMessageCallback = (msg) => {
      if (msg.command === "run") {
        runPython();
      } else {
        // explain, improve, fix
        handleAI(msg.command);
      }
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

