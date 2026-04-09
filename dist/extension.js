"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode4 = __toESM(require("vscode"));

// src/webview.ts
var vscode2 = __toESM(require("vscode"));

// src/config.ts
var vscode = __toESM(require("vscode"));
function getLanguage() {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get("language") || "Lithuanian";
}

// src/webview.ts
var NekoPanel = class _NekoPanel {
  static currentPanel;
  _panel;
  _disposables = [];
  // Callback for messages from the webview
  onMessageCallback;
  constructor(panel) {
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
  static show() {
    if (_NekoPanel.currentPanel) {
      _NekoPanel.currentPanel._panel.reveal(vscode2.ViewColumn.Beside);
      return;
    }
    const panel = vscode2.window.createWebviewPanel(
      "nekoAI",
      "\u{1F431} Neko AI",
      vscode2.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );
    _NekoPanel.currentPanel = new _NekoPanel(panel);
  }
  send(state, content, reset = true) {
    this._panel.webview.postMessage({ state, content, reset });
  }
  dispose() {
    _NekoPanel.currentPanel = void 0;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
  _getHtmlForWebview() {
    const lang = getLanguage();
    const initialText = lang === "English" ? "Hi! I am Neko \u{1F431}" : "Labas! A\u0161 Neko \u{1F431}";
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

<div id="neko" class="neko">\u{1F431}</div>

<div class="controls">
  <button onclick="sendCommand('fix')">\u{1F527} Fix</button>
  <button onclick="sendCommand('explain')">\u{1F4D6} Explain</button>
  <button onclick="sendCommand('improve')">\u2728 Improve</button>
  <button onclick="sendCommand('run')">\u25B6\uFE0F Run</button>
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
    document.getElementById("content").innerHTML = "<i>Thinking... \u{1F914}</i>";
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
};

// src/commands.ts
var vscode3 = __toESM(require("vscode"));
var import_child_process = require("child_process");

// src/ai.ts
var OLLAMA_URL = "http://localhost:11434/api/generate";
var MODEL = "gemma4:e2b";
function buildPrompt(type, code) {
  const lang = getLanguage();
  if (type === "fix") {
    if (lang === "English") {
      return `Fix this Python code. Rules: Provide only code, no explanations, minimal changes.

${code}`;
    }
    return `Pataisyk Python kod\u0105.
Taisykl\u0117s:
- Tik kodas
- Be paai\u0161kinim\u0173
- Minimal\u016Bs pakeitimai

${code}`;
  }
  if (type === "improve") {
    if (lang === "English") {
      return `Improve this Python code. Rules: Make it clearer and cleaner, preserve the same functionality, provide only code.

${code}`;
    }
    return `Pagerink Python kod\u0105.
Taisykl\u0117s:
- Ai\u0161kesnis ir \u0161varesnis
- Ta pati funkcija
- Tik kodas

${code}`;
  }
  if (lang === "English") {
    return `Explain this Python code very simply for a kid learning to code:

${code}`;
  }
  return `Paai\u0161kink \u0161\u012F Python kod\u0105 labai paprastai lietuvi\u0161kai:

${code}`;
}
function buildErrorPrompt(stderr) {
  const lang = getLanguage();
  if (lang === "English") {
    return `Explain this Python error very simply for a kid learning to code:

${stderr}`;
  }
  return `Paai\u0161kink \u0161i\u0105 Python klaid\u0105 paprastai lietuvi\u0161kai:

${stderr}`;
}
async function streamOllama(prompt, onChunk) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: true
    })
  });
  const reader = res.body?.getReader();
  if (!reader) {
    return;
  }
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
      }
    }
  }
  onChunk(full, true);
}

// src/commands.ts
function getCode() {
  const editor = vscode3.window.activeTextEditor;
  if (!editor) {
    return null;
  }
  const selection = editor.selection;
  let code = editor.document.getText(selection);
  if (!code) {
    code = editor.document.getText();
  }
  return { code, editor };
}
function cleanCode(text) {
  return text.replace(
    /```[\s\S]*?```/g,
    (m) => m.replace(/```[a-z]*\n?/, "").replace(/```$/, "")
  ).trim();
}
async function handleAI(type) {
  const ctx = getCode();
  if (!ctx) {
    return;
  }
  NekoPanel.show();
  const panel = NekoPanel.currentPanel;
  if (!panel) {
    return;
  }
  panel.send("thinking", "Thinking... \u{1F914}");
  const prompt = buildPrompt(type, ctx.code);
  await streamOllama(prompt, async (chunk, done) => {
    panel.send("talking", chunk, false);
    if (done && (type === "fix" || type === "improve")) {
      const cleaned = cleanCode(chunk);
      await ctx.editor.edit((editBuilder) => {
        editBuilder.replace(ctx.editor.selection, cleaned);
      });
    }
  });
}
function runPython() {
  const editor = vscode3.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const file = editor.document.fileName;
  NekoPanel.show();
  const panel = NekoPanel.currentPanel;
  if (!panel) {
    return;
  }
  panel.send("thinking", "Running code... \u{1F3C3}");
  (0, import_child_process.exec)(`python "${file}"`, async (err, stdout, stderr) => {
    if (err) {
      panel.send("thinking", "Found an error... explaining \u{1F431}");
      const prompt = buildErrorPrompt(stderr);
      await streamOllama(prompt, (chunk) => {
        panel.send("talking", chunk, false);
      });
    } else {
      panel.send("talking", "\u2705 Works!\n\n```text\n" + (stdout || "No output.") + "\n```");
    }
  });
}

// src/extension.ts
function activate(context) {
  context.subscriptions.push(
    vscode4.commands.registerCommand("neko-ai.open", () => {
      NekoPanel.show();
      setupPanelMessageListener();
    }),
    vscode4.commands.registerCommand("neko-ai.fix", () => handleAI("fix")),
    vscode4.commands.registerCommand("neko-ai.explain", () => handleAI("explain")),
    vscode4.commands.registerCommand("neko-ai.improve", () => handleAI("improve")),
    vscode4.commands.registerCommand("neko-ai.runPython", runPython)
  );
}
function setupPanelMessageListener() {
  if (NekoPanel.currentPanel) {
    NekoPanel.currentPanel.onMessageCallback = (msg) => {
      if (msg.command === "run") {
        runPython();
      } else {
        handleAI(msg.command);
      }
    };
  }
}
var originalShow = NekoPanel.show;
NekoPanel.show = () => {
  originalShow();
  setupPanelMessageListener();
};
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
