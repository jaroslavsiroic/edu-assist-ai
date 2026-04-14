import * as vscode from "vscode";
import { getLanguage, isDebug } from "./config";

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

  public send(state: string, content: string, reset = false, rung?: number) {
    this._panel.webview.postMessage({ state, content, reset, rung });
  }

  public sendDebug(content: string) {
    if (isDebug()) {
      this._panel.webview.postMessage({ isDebugLog: true, content });
    }
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
    let initialText = "Labas! Aš Neko. Padėsiu tau mokytis Python žingsnis po žingsnio. Įklijuok užduotį viršuje ir programuokime kartu! 🐱";
    let nekoSubtitle = "Tavo Python draugas";
    let btnExplainTask = "📝 Paaiškink užduotį";
    let btnShowExample = "💡 Parodyk pavyzdį";
    let btnExplainError = "⚠️ Ką reiškia ši klaida?";
    let btnExplainCode = "📖 Paaiškink mano kodą";
    let btnClearChat = "🗑️ Išvalyti";
    let taskBoxPlaceholder = "Įklijuokite mokytojo užduotį čia...";

    if (lang === "English") {
      initialText = "Hi! I'm Neko. I'm here to help you learn Python step-by-step. Paste your task above and let's explore your code together! 🐱";
      nekoSubtitle = "Your Python buddy";
      btnExplainTask = "📝 Explain the task";
      btnShowExample = "💡 Show me an example";
      btnExplainError = "⚠️ What does this error mean?";
      btnExplainCode = "📖 Explain my code";
      btnClearChat = "🗑️ Clear";
      taskBoxPlaceholder = "Paste the teacher's task here...";
    } else if (lang === "Polish") {
      initialText = "Cześć! Jestem Neko. Pomogę Ci w nauce Pythona krok po kroku. Wklej zadanie powyżej i wspólnie sprawdźmy Twój kod! 🐱";
      nekoSubtitle = "Twój kumpel od Pythona";
      btnExplainTask = "📝 Wyjaśnij zadanie";
      btnShowExample = "💡 Pokaż mi przykład";
      btnExplainError = "⚠️ Co oznacza ten błąd?";
      btnExplainCode = "📖 Wyjaśnij mój kod";
      btnClearChat = "🗑️ Wyczyść";
      taskBoxPlaceholder = "Wklej tutaj zadanie od nauczyciela...";
    }

    const debug = isDebug();

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
    html, body {
      background: var(--bg-color);
      color: var(--text-color);
      font-family: 'Nunito', sans-serif;
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }
    body {
      display: flex;
      flex-direction: column;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      flex-shrink: 0;
    }
    .neko-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.05);
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .neko-avatar {
      font-size: 20px;
      transition: all 0.3s ease;
      display: inline-block;
    }
    .neko-info {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .neko-name {
      font-weight: 700;
      font-size: 13px;
    }
    .neko-desc {
      font-size: 10px;
      opacity: 0.7;
      margin-top: -2px;
    }
    .thinking { transform: rotate(-10deg) scale(1.1); filter: drop-shadow(0 0 10px rgba(255,255,255,0.2)); }
    .talking { transform: scale(1.15) translateY(-5px); }
    
    .task-container {
      padding: 0 15px;
      flex-shrink: 0;
    }
    #task-box {
      width: 100%;
      border-radius: 8px;
      padding: 10px;
      background: rgba(0,0,0,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.1);
      font-family: 'Nunito', sans-serif;
      resize: vertical;
      box-sizing: border-box;
      outline: none;
    }

    .chat-container {
      flex-grow: 1;
      overflow-y: scroll; /* Force scrollbar to prevent width jump */
      padding: 10px 15px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }
    .bubble {
      background: var(--bubble-bg);
      padding: 12px 14px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-size: 13px;
      line-height: 1.5;
      border: 1px solid rgba(255,255,255,0.05);
      animation: fadeIn 0.3s ease-out forwards;
      position: relative;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    .user-bubble {
      background: rgba(100, 150, 255, 0.15);
      align-self: flex-end;
      border-bottom-right-radius: 2px;
      max-width: 80%;
      border: 1px solid rgba(100, 150, 255, 0.2);
    }
    .neko-bubble {
      border-bottom-left-radius: 2px;
      align-self: flex-start;
      max-width: 90%;
    }
    /* Bubble tail for Neko */
    .neko-bubble::before {
      content: '';
      position: absolute;
      top: -10px;
      left: 20px;
      border-width: 0 10px 10px 10px;
      border-style: solid;
      border-color: transparent transparent var(--bubble-bg) transparent;
    }
    .rung-indicator {
      font-size: 11px;
      background: var(--accent-color);
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      margin-bottom: 8px;
      display: inline-block;
      font-weight: 700;
      text-transform: uppercase;
    }
    .controls-wrapper {
      background: var(--bg-color);
      padding: 15px;
      border-top: 1px solid rgba(255,255,255,0.05);
      flex-shrink: 0;
    }
    .controls {
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    button {
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      padding: 8px 14px;
      border-radius: 20px;
      border: none;
      background: var(--btn-bg);
      color: white;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    button:hover {
      background: var(--btn-hover);
      transform: translateY(-2px);
    }
    button.clear-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 10px;
      padding: 4px 10px;
      opacity: 0.6;
      transition: all 0.2s ease;
    }
    button.clear-btn:hover {
      opacity: 1;
      background: rgba(233, 69, 96, 0.2);
      border-color: var(--accent-color);
      transform: none;
    }
    /* Markdown Styles */
    #content h1, #content h2, #content h3 {
      color: white;
      margin-top: 0;
    }
    #chat-container pre {
      background: #282c34;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid rgba(255,255,255,0.05);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
      max-width: 100%;
      margin: 8px 0;
    }
    #content pre code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
    }
    :not(pre) > code {
      background: rgba(233, 69, 96, 0.15);
      color: #ffb6c1;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      white-space: nowrap;
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

<div class="header">
  <div class="neko-profile">
    <div id="neko" class="neko-avatar">🐱</div>
    <div class="neko-info">
      <span class="neko-name">Neko</span>
      <span class="neko-desc">${nekoSubtitle}</span>
    </div>
  </div>
  <button onclick="sendCommand(this, 'clearChat')" class="clear-btn">${btnClearChat}</button>
</div>

<div class="task-container">
  <textarea id="task-box" placeholder="${taskBoxPlaceholder}" rows="2"></textarea>
</div>

<div id="chat-container" class="chat-container">
  <div class="bubble neko-bubble">${initialText}</div>
</div>

<div class="controls-wrapper">
  <div class="controls">
    <button onclick="sendCommand(this, 'explainTask')">${btnExplainTask}</button>
    <button onclick="sendCommand(this, 'showExample')">${btnShowExample}</button>
    <button onclick="sendCommand(this, 'explainError')">${btnExplainError}</button>
    <button onclick="sendCommand(this, 'explainCode')">${btnExplainCode}</button>
  </div>
</div>

${debug ? `<div id="debug-log" style="text-align: left; background: #000; color: #0f0; font-family: monospace; padding: 10px; margin: 15px 15px; font-size: 12px; height: 100px; overflow-y: auto; border-radius: 8px; flex-shrink: 0;"><b>Debug Log</b><br></div>` : ''}

<script>
  const vscode = acquireVsCodeApi();
  let activeNekoBubble = null;

  function sendCommand(btn, cmd){
    if(cmd === "clearChat") {
      document.getElementById("chat-container").innerHTML = "";
      vscode.postMessage({command: cmd});
      return;
    }

    const chatContainer = document.getElementById("chat-container");
    
    const userBubble = document.createElement("div");
    userBubble.className = "bubble user-bubble";
    // Use localized button text instead of raw command name
    userBubble.innerHTML = "<b>&gt;</b> " + btn.innerText.trim();
    chatContainer.appendChild(userBubble);
    
    activeNekoBubble = document.createElement("div");
    activeNekoBubble.className = "bubble neko-bubble";
    activeNekoBubble.innerHTML = "<i>Thinking... 🤔</i>";
    chatContainer.appendChild(activeNekoBubble);

    setState("thinking");
    chatContainer.lastElementChild.scrollIntoView({ behavior: 'smooth' });

    const taskBoxValue = document.getElementById("task-box").value;
    vscode.postMessage({command: cmd, task: taskBoxValue});
  }

  function setState(s){
    document.getElementById("neko").className = "neko-avatar " + s;
  }

  window.addEventListener("message", e => {
    if (e.data.isDebugLog) {
      const dbg = document.getElementById("debug-log");
      if (dbg) {
        dbg.innerHTML += "<div>[" + new Date().toLocaleTimeString() + "] " + String(e.data.content).replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</div>";
        dbg.scrollTop = dbg.scrollHeight;
      }
      return;
    }

    const { state, content, reset, rung } = e.data;
    const chatContainer = document.getElementById("chat-container");

    if (reset) {
       chatContainer.innerHTML = "";
       activeNekoBubble = null;
       return;
    }

    if (!activeNekoBubble && content) {
       activeNekoBubble = document.createElement("div");
       activeNekoBubble.className = "bubble neko-bubble";
       chatContainer.appendChild(activeNekoBubble);
    }

    if (activeNekoBubble && content) {
       let html = "";
       if (rung) {
         const stepLabel = "${lang === 'English' ? 'Step' : lang === 'Polish' ? 'Krok' : 'Žingsnis'}";
         html += "<div class='rung-indicator'>" + stepLabel + " " + rung + "</div>";
       }
       html += marked.parse(content);
       activeNekoBubble.innerHTML = html;
       activeNekoBubble.querySelectorAll('pre code').forEach((block) => {
         hljs.highlightElement(block);
       });
    }

    setState(state);
    
    // Auto-scroll logic to keep the bottom visible during stream
    if (activeNekoBubble) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
</script>

</body>
</html>
    `;
  }
}
