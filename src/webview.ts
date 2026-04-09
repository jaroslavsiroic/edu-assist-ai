import * as vscode from "vscode";
import { getLanguage } from "./config";

export class NekoPanel {
  public static currentPanel: NekoPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  
  // Callback for messages from the webview
  public onMessageCallback?: (msg: any) => void;

  private constructor(panel: vscode.WebviewPanel) {
    this._panel = panel;
    this._panel.webview.html = this._getHtmlForWebview();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      (msg) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(msg);
        }
      },
      null,
      this._disposables
    );
  }

  public static show() {
    if (NekoPanel.currentPanel) {
      NekoPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "nekoAI",
      "🐱 Neko AI",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    NekoPanel.currentPanel = new NekoPanel(panel);
  }

  public send(state: string, content: string, reset = true) {
    this._panel.webview.postMessage({ state, content, reset });
  }

  public dispose() {
    NekoPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(): string {
    const lang = getLanguage();
    const initialText = lang === "English" ? "Hi! I am Neko 🐱" : "Labas! Aš Neko 🐱";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #1a1a2e;
      --bubble-bg: #16213e;
      --text-color: #e2e8f0;
      --accent-color: #e94560;
      --btn-bg: #0f3460;
      --btn-hover: #e94560;
    }
    body {
      background: var(--bg-color);
      color: var(--text-color);
      font-family: 'Nunito', sans-serif;
      text-align: center;
      margin: 0;
      padding: 10px;
    }
    .neko {
      font-size: 60px;
      margin: 10px 0;
      transition: all 0.3s ease;
      display: inline-block;
    }
    .thinking { transform: rotate(-10deg) scale(1.1); filter: drop-shadow(0 0 10px rgba(255,255,255,0.2)); }
    .talking { transform: scale(1.15) translateY(-5px); }
    .bubble {
      background: var(--bubble-bg);
      padding: 20px;
      border-radius: 16px;
      margin: 15px auto;
      max-width: 90%;
      height: 350px;
      overflow-y: auto;
      text-align: left;
      line-height: 1.6;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      position: relative;
    }
    /* Bubble tail */
    .bubble::before {
      content: '';
      position: absolute;
      top: -10px;
      left: 50%;
      margin-left: -10px;
      border-width: 0 10px 10px 10px;
      border-style: solid;
      border-color: transparent transparent var(--bubble-bg) transparent;
    }
    .controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    button {
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      padding: 10px 16px;
      border-radius: 20px;
      border: none;
      background: var(--btn-bg);
      color: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    button:hover {
      background: var(--btn-hover);
      transform: translateY(-2px);
    }
    /* Markdown Styles */
    #content h1, #content h2, #content h3 {
      color: white;
      margin-top: 0;
    }
    #content pre {
      background: #282c34;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
    }
    #content code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 0.9em;
    }
    :not(pre) > code {
      background: rgba(255,255,255,0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg-color);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--btn-bg);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--btn-hover);
    }
  </style>
</head>
<body>

<div id="neko" class="neko">🐱</div>

<div class="controls">
  <button onclick="sendCommand('fix')">🔧 Fix</button>
  <button onclick="sendCommand('explain')">📖 Explain</button>
  <button onclick="sendCommand('improve')">✨ Improve</button>
  <button onclick="sendCommand('run')">▶️ Run</button>
</div>

<div id="content" class="bubble">${initialText}</div>

<script>
  const vscode = acquireVsCodeApi();
  let fullText = "";

  // Configure marked for highlight js
  marked.setOptions({
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  });

  function sendCommand(cmd){
    fullText = "";
    setState("thinking");
    document.getElementById("content").innerHTML = "<i>Thinking... 🤔</i>";
    vscode.postMessage({command: cmd});
  }

  function setState(s){
    document.getElementById("neko").className = "neko " + s;
  }

  window.addEventListener("message", e => {
    const { state, content, reset } = e.data;
    if(reset) fullText = "";
    fullText = content;
    setState(state);
    
    // Parse markdown and set HTML
    document.getElementById("content").innerHTML = marked.parse(fullText);
    
    // Scroll to bottom
    const bubble = document.getElementById("content");
    bubble.scrollTop = bubble.scrollHeight;
  });
</script>

</body>
</html>
    `;
  }
}
