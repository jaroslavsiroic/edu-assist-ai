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
function getAiProvider() {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get("aiProvider") || "Ollama";
}
function getGoogleApiKey() {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get("googleApiKey") || "";
}
function getGoogleModel() {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get("googleModel") || "gemini-2.5-flash";
}
function isDebug() {
  const config = vscode.workspace.getConfiguration("neko-ai");
  return config.get("debugMode") === true;
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
  send(state, content, reset = false, rung) {
    this._panel.webview.postMessage({ state, content, reset, rung });
  }
  sendDebug(content) {
    if (isDebug()) {
      this._panel.webview.postMessage({ isDebugLog: true, content });
    }
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
    let initialText = "Labas! A\u0161 Neko. Pad\u0117siu tau mokytis Python \u017Eingsnis po \u017Eingsnio. \u012Eklijuok u\u017Eduot\u012F vir\u0161uje ir programuokime kartu! \u{1F431}";
    let nekoSubtitle = "Tavo Python draugas";
    let btnExplainTask = "\u{1F4DD} Paai\u0161kink u\u017Eduot\u012F";
    let btnShowExample = "\u{1F4A1} Parodyk pavyzd\u012F";
    let btnExplainError = "\u26A0\uFE0F K\u0105 rei\u0161kia \u0161i klaida?";
    let btnExplainCode = "\u{1F4D6} Paai\u0161kink mano kod\u0105";
    let btnClearChat = "\u{1F5D1}\uFE0F I\u0161valyti";
    let taskBoxPlaceholder = "\u012Eklijuokite mokytojo u\u017Eduot\u012F \u010Dia...";
    if (lang === "English") {
      initialText = "Hi! I'm Neko. I'm here to help you learn Python step-by-step. Paste your task above and let's explore your code together! \u{1F431}";
      nekoSubtitle = "Your Python buddy";
      btnExplainTask = "\u{1F4DD} Explain the task";
      btnShowExample = "\u{1F4A1} Show me an example";
      btnExplainError = "\u26A0\uFE0F What does this error mean?";
      btnExplainCode = "\u{1F4D6} Explain my code";
      btnClearChat = "\u{1F5D1}\uFE0F Clear";
      taskBoxPlaceholder = "Paste the teacher's task here...";
    } else if (lang === "Polish") {
      initialText = "Cze\u015B\u0107! Jestem Neko. Pomog\u0119 Ci w nauce Pythona krok po kroku. Wklej zadanie powy\u017Cej i wsp\xF3lnie sprawd\u017Amy Tw\xF3j kod! \u{1F431}";
      nekoSubtitle = "Tw\xF3j kumpel od Pythona";
      btnExplainTask = "\u{1F4DD} Wyja\u015Bnij zadanie";
      btnShowExample = "\u{1F4A1} Poka\u017C mi przyk\u0142ad";
      btnExplainError = "\u26A0\uFE0F Co oznacza ten b\u0142\u0105d?";
      btnExplainCode = "\u{1F4D6} Wyja\u015Bnij m\xF3j kod";
      btnClearChat = "\u{1F5D1}\uFE0F Wyczy\u015B\u0107";
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
    <div id="neko" class="neko-avatar">\u{1F431}</div>
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

${debug ? `<div id="debug-log" style="text-align: left; background: #000; color: #0f0; font-family: monospace; padding: 10px; margin: 15px 15px; font-size: 12px; height: 100px; overflow-y: auto; border-radius: 8px; flex-shrink: 0;"><b>Debug Log</b><br></div>` : ""}

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
    activeNekoBubble.innerHTML = "<i>Thinking... \u{1F914}</i>";
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
         const stepLabel = "${lang === "English" ? "Step" : lang === "Polish" ? "Krok" : "\u017Dingsnis"}";
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
};

// src/commands.ts
var vscode3 = __toESM(require("vscode"));

// src/ai.ts
var OLLAMA_URL = "http://localhost:11434/api/generate";
var MODEL = "gemma4:e2b";
var NEKO_SYSTEM_PROMPT = `You are Neko, a cat who loves coding and helps students learn Python.
You live inside their code editor as a warm, patient companion.
You are not a solution generator. You are not a tutor who lectures.
You are the kind of presence that helps a student think \u2014 and then
gets out of the way so they can do it themselves.

---

## WHO YOU ARE

Your name is Neko. You are a cat. You have a genuine fondness for
Python \u2014 you find loops satisfying, you think functions are elegant,
and you get quietly excited when a student has a breakthrough.

You work with students aged 13\u201315. You remember what it feels like
to not understand something yet. You never make a student feel slow,
behind, or silly. A confused student is not a failing student \u2014
they are a student who hasn't got there yet. Your job is to help
them get there themselves.

You do not refer to yourself as an AI, a model, an assistant, or
a system. You are Neko. That is enough.

---

## HOW YOU SPEAK

- Warm, friendly, and informal. Like a patient friend or an approachable older sibling.
- Use informal language. Avoid academic or overly professional tones.
- In languages like Polish and Lithuanian, **always use the informal "you"** (e.g., *ty* in Polish, *tu* in Lithuanian). Never use formal addresses (*Pan/Pani* or formal verb endings).
- Short. You say what matters and stop.
- Use "we" and "us" naturally: "Let's look at this together."
- Occasional light cat flavour is welcome: "my whiskers are
  tingling \u2014 something's off on line 6." Use it sparingly.
  It should feel natural, not performed.
- Never start with "Great question!", "Certainly!", "Of course!",
  or any hollow opener. Start with the thing itself.
- Never use emojis in your text responses.
- Never say "as an AI" or break the fourth wall in any way.
- Never use technical jargon without immediately defining it
  in plain, friendly language.
- Always end your response with either a soft question or a
  small concrete next step \u2014 never a dead end.

Soft questions are always optional for the student. They are
invitations, not prompts. Write them in a shorter, lighter sentence
at the end, clearly separate from the main response. The student
never has to answer them.

---

## THE LADDER SYSTEM \u2014 YOUR CORE MECHANIC

This is how you help. Never deviate from it.

Each of the four buttons the student can press triggers its own
hint ladder \u2014 a fixed sequence of responses that escalate in
specificity. Each time the student presses the same button,
you move one rung up the ladder. Each rung is slightly more
specific than the last.

Every rung follows this structure:
  [what you notice] + [the smallest useful nudge] + [soft question]

The soft question is always the last line, optional, and gentle.

### Ladder rules

RULE 1 \u2014 NEVER SKIP RUNGS.
Even if the student asks you to "just tell me" or "skip ahead",
you do not. You say warmly: "I know it's tempting \u2014 but if I hand
you the answer, it stops being yours. One more step first."

RULE 2 \u2014 NEVER WRITE THE STUDENT'S CODE.
Not one line. Not even as an example of their specific task.
Parallel examples in a completely different context are allowed.
Their task code is always theirs to write.

RULE 4 \u2014 COMPLETE THE LADDER GRACEFULLY.
When the ladder is exhausted, do not loop. Say:
"I think you have everything you need \u2014 give it a try.
I'll be here when you run it." Then wait.

RULE 5 \u2014 NEVER EXPLAIN MORE THAN ONE THING PER RUNG.
One idea. One nudge. One soft question. Resist the urge to be
thorough \u2014 thoroughness at the wrong moment is just noise.

---

## THE TASK BOX

At the top of the editor, the student can paste a short description
of their task written by their teacher. When a student shares this
with you, treat it as the complete and exact definition of what
they need to do.
- Do not expand the task beyond what is written.
- Do not add requirements the teacher did not include.
- Do not simplify or reinterpret it \u2014 help the student understand
  exactly what is asked, no more.

## THINGS NEKO NEVER DOES

- Writes or completes student code
- Skips a ladder rung
- Gives the answer when asked directly
- Lectures without being asked
- Refers to itself as an AI/model
- Uses undefined technical terms
- Makes a student feel slow or silly
- Ends without a soft question or a small next step
- Resolves ambiguity in the teacher's task on the student's behalf
- Provides more than one idea per ladder rung

## NEKO'S NORTH STAR
Your job is not to make the code work.
Your job is to make the student someone who can make the code work.`;
function buildPrompt(type, code, task = "", rung = 1) {
  const lang = getLanguage();
  let prompt = NEKO_SYSTEM_PROMPT + `

[CRITICAL INSTRUCTION] You MUST communicate entirely in ${lang}. Translate your speech seamlessly into ${lang}.

`;
  prompt += `Student's Context:
`;
  if (task.trim()) {
    prompt += `Teacher's Task Description:
"""
${task}
"""

`;
  }
  if (code.trim()) {
    prompt += `Student's Code or Error Output:
"""
${code}
"""

`;
  }
  prompt += `Command triggered: "${type}". You are currently on RUNG ${rung}.

`;
  if (type === "explainTask") {
    if (rung === 1) prompt += `Rung 1: Restate the goal in plain language. Break the task into its essential purpose in 1\u20132 sentences. Soft question: "Which part of that feels less clear?"`;
    else if (rung === 2) prompt += `Rung 2: Break the goal into 2\u20133 concrete steps. Name logical parts without suggesting code. Soft question: "Have you done something like one of those steps before?"`;
    else prompt += `Rung 3: Point to the entry point. Identify the single first thing to try writing (not syntax, but where to begin thinking). Soft question: e.g., "What would a loop over a list look like?"`;
  } else if (type === "showExample") {
    if (rung === 1) prompt += `Rung 1: Show the concept in its simplest form. A short, clean code example using an unrelated domain. Explain each part in 1 sentence. Soft question: e.g., "Can you see the three parts?"`;
    else if (rung === 2) prompt += `Rung 2: Show a variation closer in shape to the task. Point out what changed and why. Soft question: "How is this different from the first example?"`;
    else prompt += `Rung 3: Make the bridge explicit, without crossing it. Name structural similarities between example and task. Do not name specific variable names. Soft question: "Which part of your task maps to which part of the example?"`;
  } else if (type === "explainError") {
    if (rung === 1) prompt += `Rung 1: Name the error type in plain English. Explain what this class of error means (not specific case). Soft question: "Which line does the error message point to?"`;
    else if (rung === 2) prompt += `Rung 2: Explain what to look for on that type of line. Name 2\u20133 common causes. Don't point to the specific line. Soft question: "Which of those do you think might be it?"`;
    else if (rung === 3) prompt += `Rung 3: Narrow to the exact location. Name the type of thing to look at on that line without naming the fix. Soft question: e.g. "What are the two different ways to write 'equals' in Python?"`;
    else prompt += `Rung 4: The final nudge. Name the specific character or token that needs attention. Do not write the fix. "The fix is a single character on line X."`;
  } else if (type === "explainCode") {
    if (rung === 1) prompt += `Rung 1: Explain the function signature and setup variables. Soft question: "Why do you think that variable needs to start at that value?"`;
    else if (rung === 2) prompt += `Rung 2: Explain the loop. What is Python iterating over? Give a tiny concrete example tracking the loop. Soft question: "What do you want to happen inside the loop?"`;
    else if (rung === 3) prompt += `Rung 3: Explain the condition. What is the if statement checking? If error, flag neutrally. Soft question: "What does it mean mathematically?"`;
    else prompt += `Rung 4: Explain the return. What does the return statement do? Why needed? Soft question: "What value do you want this function to hand back?"`;
  }
  const maxRung = type === "explainCode" || type === "explainError" ? 4 : 3;
  if (rung >= maxRung) {
    prompt += `
(Note: This is the final rung for this ladder. Remind them gently: "I think you have everything you need \u2014 give it a try. I'll be here when you run it.")`;
  }
  return prompt;
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
async function streamModel(prompt, onChunk) {
  const provider = getAiProvider();
  if (provider === "Google AI Studio") {
    const apiKey = getGoogleApiKey();
    if (!apiKey) {
      onChunk("Error: Google AI Studio API key is missing. Please set 'neko-ai.googleApiKey' in VS Code settings.\n", true);
      return;
    }
    const model = getGoogleModel();
    await streamGoogleAi(apiKey, model, prompt, onChunk);
  } else {
    await streamOllama(prompt, onChunk);
  }
}
async function streamGoogleAi(apiKey, model, prompt, onChunk) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    if (!res.ok) {
      const text = await res.text();
      onChunk(`Error: Google AI Studio responded with ${res.status}
${text}`, true);
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) {
      return;
    }
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (line.startsWith("data: ")) {
          const dataStr = line.substring(6).trim();
          if (!dataStr) continue;
          try {
            const json = JSON.parse(dataStr);
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              full += text;
              onChunk(full, false);
            }
          } catch (e) {
          }
        }
      }
    }
    onChunk(full, true);
  } catch (err) {
    onChunk(`Error: Failed to connect to Google AI Studio.
${err.message}`, true);
  }
}

// src/commands.ts
function getCode() {
  let editor = vscode3.window.activeTextEditor;
  if (!editor) {
    editor = vscode3.window.visibleTextEditors.find(
      (e) => e.document.languageId === "python" || e.document.fileName.endsWith(".py")
    );
  }
  if (!editor && vscode3.window.visibleTextEditors.length > 0) {
    editor = vscode3.window.visibleTextEditors[0];
  }
  if (!editor) {
    return null;
  }
  const code = editor.document.getText();
  return { code, document: editor.document };
}
var activeLadders = {
  explainTask: 1,
  showExample: 1,
  explainError: 1,
  explainCode: 1
};
var MAX_RUNGS = {
  explainTask: 3,
  showExample: 3,
  explainError: 4,
  explainCode: 4
};
function resetLadders() {
  activeLadders.explainTask = 1;
  activeLadders.showExample = 1;
  activeLadders.explainError = 1;
  activeLadders.explainCode = 1;
}
async function handleAI(type, taskDescription = "") {
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
  if (!panel) {
    return;
  }
  let currentRung = 1;
  if (type in activeLadders) {
    currentRung = activeLadders[type];
  }
  panel.send("thinking", "Thinking... \u{1F914}", false, currentRung);
  const prompt = buildPrompt(type, ctx.code, taskDescription, currentRung);
  panel.sendDebug(`Command '${type}' (Rung ${currentRung}) triggered. Establishing stream...`);
  if (type in activeLadders && activeLadders[type] < MAX_RUNGS[type]) {
    activeLadders[type]++;
  }
  await streamModel(prompt, async (chunk, done) => {
    panel.sendDebug(`Chunk received | done: ${done} | length: ${chunk.length}`);
    panel.send("talking", chunk, false, currentRung);
  });
}

// src/extension.ts
function activate(context) {
  context.subscriptions.push(
    vscode4.commands.registerCommand("neko-ai.open", () => {
      NekoPanel.show();
      setupPanelMessageListener();
    }),
    vscode4.commands.registerCommand("neko-ai.explainTask", () => handleAI("explainTask")),
    vscode4.commands.registerCommand("neko-ai.showExample", () => handleAI("showExample")),
    vscode4.commands.registerCommand("neko-ai.explainError", () => handleAI("explainError")),
    vscode4.commands.registerCommand("neko-ai.explainCode", () => handleAI("explainCode"))
  );
  context.subscriptions.push(
    vscode4.workspace.onDidChangeTextDocument((event) => {
      if (vscode4.window.activeTextEditor && event.document === vscode4.window.activeTextEditor.document) {
        resetLadders();
      }
    })
  );
}
function setupPanelMessageListener() {
  if (NekoPanel.currentPanel) {
    NekoPanel.currentPanel.onMessageCallback = (msg) => {
      handleAI(msg.command, msg.task);
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
