const STORAGE_KEY = "airBridgeHeightGame_v1";
const CANVAS_SIZE = { width: 900, height: 440 };
const DRAW_TOLERANCE_BY_STAGE = [8, 7, 7, 6, 6, 6, 5, 5, 5, 4];

const refs = {
  soundToggle: document.getElementById("soundToggle"),
  resetProgress: document.getElementById("resetProgress"),
  bridgeFill: document.getElementById("bridgeFill"),
  miniMap: document.getElementById("miniMap"),
  achievementList: document.getElementById("achievementList"),
  openMap: document.getElementById("openMap"),
  startGame: document.getElementById("startGame"),
  startSandbox: document.getElementById("startSandbox"),
  screenStart: document.getElementById("screenStart"),
  screenDiagnostic: document.getElementById("screenDiagnostic"),
  screenMap: document.getElementById("screenMap"),
  screenGame: document.getElementById("screenGame"),
  screenSummary: document.getElementById("screenSummary"),
  screenSandbox: document.getElementById("screenSandbox"),
  diagnosticCard: document.getElementById("diagnosticCard"),
  diagnosticProgress: document.getElementById("diagnosticProgress"),
  mapGrid: document.getElementById("mapGrid"),
  stageEyebrow: document.getElementById("stageEyebrow"),
  stageTitle: document.getElementById("stageTitle"),
  stageGoal: document.getElementById("stageGoal"),
  stageCounter: document.getElementById("stageCounter"),
  challengeTimer: document.getElementById("challengeTimer"),
  questionPrompt: document.getElementById("questionPrompt"),
  questionStory: document.getElementById("questionStory"),
  gameCanvas: document.getElementById("gameCanvas"),
  angleReadout: document.getElementById("angleReadout"),
  checkAnswer: document.getElementById("checkAnswer"),
  undoAction: document.getElementById("undoAction"),
  hintButton: document.getElementById("hintButton"),
  choiceArea: document.getElementById("choiceArea"),
  feedbackArea: document.getElementById("feedbackArea"),
  metricIdentify: document.getElementById("metricIdentify"),
  metricDraw: document.getElementById("metricDraw"),
  metricReason: document.getElementById("metricReason"),
  coachName: document.getElementById("coachName"),
  coachMessage: document.getElementById("coachMessage"),
  backToMap: document.getElementById("backToMap"),
  hintPulse: document.getElementById("hintPulse"),
  summaryTitle: document.getElementById("summaryTitle"),
  summaryScore: document.getElementById("summaryScore"),
  summaryBridge: document.getElementById("summaryBridge"),
  summaryIdentify: document.getElementById("summaryIdentify"),
  summaryDraw: document.getElementById("summaryDraw"),
  summaryReason: document.getElementById("summaryReason"),
  summaryWeakness: document.getElementById("summaryWeakness"),
  summaryVictory: document.getElementById("summaryVictory"),
  summaryChallenge: document.getElementById("summaryChallenge"),
  nextStage: document.getElementById("nextStage"),
  goToMapFromSummary: document.getElementById("goToMapFromSummary"),
  sandboxCanvas: document.getElementById("sandboxCanvas"),
  sandboxTriangle: document.getElementById("sandboxTriangle"),
  sandboxTriangleWide: document.getElementById("sandboxTriangleWide"),
  sandboxParallelogram: document.getElementById("sandboxParallelogram"),
  sandboxParallelogramTilted: document.getElementById("sandboxParallelogramTilted"),
  sandboxShowAltitudes: document.getElementById("sandboxShowAltitudes"),
  sandboxText: document.getElementById("sandboxText"),
  sandboxBack: document.getElementById("sandboxBack"),
};

const ctx = refs.gameCanvas.getContext("2d");
const sandboxCtx = refs.sandboxCanvas.getContext("2d");

const appState = {
  progress: loadProgress(),
  screens: ["screenStart", "screenDiagnostic", "screenMap", "screenGame", "screenSummary", "screenSandbox"],
  stageIndex: 0,
  stageQuestions: [],
  questionIndex: 0,
  currentQuestion: null,
  stageMetrics: null,
  currentRender: null,
  selectedChoice: null,
  selectedCandidate: null,
  selectedSide: null,
  reasonInput: "",
  studentLine: null,
  dragging: null,
  answered: false,
  hintTimer: null,
  hintShown: false,
  questionStartedAt: 0,
  challengeMode: false,
  challengeTime: 60,
  challengeTimerId: null,
  challengeQuestions: [],
  challengeScore: 0,
  lastAnswerCorrect: false,
  supportMode: false,
  supportCategory: null,
  supportNextStageIndex: null,
  sandbox: {
    shapeKey: "triangleSandbox",
    selectedSide: 0,
    showAltitudes: false,
  },
  audioCtx: null,
  soundOn: true,
  questionIdCounter: 1,
};

const SHAPES = {
  triangleA: makeShape("triangleA", "triangle", ["א", "ב", "ג"], [
    [0.18, 0.76],
    [0.78, 0.72],
    [0.56, 0.22],
  ]),
  triangleB: makeShape("triangleB", "triangle", ["א", "ב", "ג"], [
    [0.2, 0.68],
    [0.74, 0.78],
    [0.4, 0.18],
  ]),
  triangleRotated: makeShape("triangleRotated", "triangle", ["א", "ב", "ג"], [
    [0.14, 0.46],
    [0.7, 0.16],
    [0.8, 0.8],
  ]),
  rightTriangleA: makeShape("rightTriangleA", "triangle", ["א", "ב", "ג"], [
    [0.18, 0.78],
    [0.18, 0.26],
    [0.76, 0.78],
  ]),
  rightTriangleB: makeShape("rightTriangleB", "triangle", ["א", "ב", "ג"], [
    [0.26, 0.76],
    [0.76, 0.76],
    [0.76, 0.28],
  ]),
  obtuseTriangleA: makeShape("obtuseTriangleA", "triangle", ["א", "ב", "ג"], [
    [0.18, 0.44],
    [0.84, 0.74],
    [0.48, 0.2],
  ]),
  obtuseTriangleB: makeShape("obtuseTriangleB", "triangle", ["א", "ב", "ג"], [
    [0.12, 0.7],
    [0.84, 0.6],
    [0.4, 0.24],
  ]),
  paraA: makeShape("paraA", "parallelogram", ["א", "ב", "ג", "ד"], [
    [0.22, 0.76],
    [0.68, 0.76],
    [0.82, 0.42],
    [0.36, 0.42],
  ]),
  paraB: makeShape("paraB", "parallelogram", ["א", "ב", "ג", "ד"], [
    [0.28, 0.8],
    [0.72, 0.72],
    [0.64, 0.26],
    [0.2, 0.34],
  ]),
  paraC: makeShape("paraC", "parallelogram", ["א", "ב", "ג", "ד"], [
    [0.16, 0.7],
    [0.6, 0.8],
    [0.84, 0.42],
    [0.4, 0.32],
  ]),
  triangleSandbox: makeShape("triangleSandbox", "triangle", ["א", "ב", "ג"], [
    [0.18, 0.76],
    [0.78, 0.72],
    [0.52, 0.2],
  ]),
  triangleSandboxWide: makeShape("triangleSandboxWide", "triangle", ["א", "ב", "ג"], [
    [0.12, 0.76],
    [0.86, 0.68],
    [0.62, 0.18],
  ]),
  parallelogramSandbox: makeShape("parallelogramSandbox", "parallelogram", ["א", "ב", "ג", "ד"], [
    [0.22, 0.78],
    [0.72, 0.78],
    [0.82, 0.38],
    [0.32, 0.38],
  ]),
  parallelogramSandboxTilted: makeShape("parallelogramSandboxTilted", "parallelogram", ["א", "ב", "ג", "ד"], [
    [0.18, 0.68],
    [0.58, 0.8],
    [0.84, 0.42],
    [0.44, 0.3],
  ]),
};

const DIAGNOSTIC = [
  {
    prompt: "איזו נקודה היא קודקוד?",
    options: ["נקודה בקצה הצורה", "הקו האמצעי", "הבסיס המסומן"],
    correctIndex: 0,
    explanation: "קודקוד הוא נקודת מפגש של שתי צלעות.",
  },
  {
    prompt: "מה מסמן ציור קטן של ריבוע בפינה?",
    options: ["זווית ישרה", "בסיס", "גובה"],
    correctIndex: 0,
    explanation: "הריבוע הקטן מסמן זווית של 90 מעלות.",
  },
  {
    prompt: "איזה משפט מתאר נכון גובה במשולש?",
    options: ["קטע שיוצא מקודקוד ומאונך לבסיס", "כל קו בתוך משולש", "הצלע הכי ארוכה במשולש"],
    correctIndex: 0,
    explanation: "גובה הוא קטע שיוצא מקודקוד ופוגש את הבסיס בזווית ישרה.",
  },
  {
    prompt: "מה חשוב לבדוק ראשון לפני שמשרטטים גובה?",
    options: ["איזו צלע נבחרה כבסיס", "מה הצלע הארוכה ביותר", "איפה מרכז הצורה"],
    correctIndex: 0,
    explanation: "גובה תמיד שייך לבסיס מסוים, לכן קודם מזהים את הבסיס.",
  },
];

const ACHIEVEMENTS = [
  {
    id: "fixer",
    title: "תיקן 5 טעויות של דני",
    description: "פתר 5 שאלות מסוג תקן את הטעות",
    isUnlocked: (stats) => stats.fixMistakesCorrect >= 5,
  },
  {
    id: "external",
    title: "שרטט 10 גבהים מחוץ לצורה",
    description: "שליטה בגבהים חיצוניים",
    isUnlocked: (stats) => stats.externalAltitudes >= 10,
  },
  {
    id: "fast",
    title: "לחש בזק",
    description: "3 תשובות נכונות מתחת ל־5 שניות",
    isUnlocked: (stats) => stats.fastCorrect >= 3,
  },
  {
    id: "steady",
    title: "שלב בלי לחש עזרה",
    description: "סיים שלב שלם ללא שימוש ברמזים",
    isUnlocked: (stats) => stats.noHintStages >= 1,
  },
];

const STAGES = buildStages();

initialize();

function initialize() {
  resizeStaticCanvases();
  bindEvents();
  updateSoundButton();
  renderAchievements();
  updateBridge();
  renderMiniMap();
  showScreen("screenStart");
  renderSandbox();
}

function bindEvents() {
  refs.startGame.addEventListener("click", startFlow);
  refs.startSandbox.addEventListener("click", () => {
    showScreen("screenSandbox");
    renderSandbox();
  });
  refs.openMap.addEventListener("click", () => showMap());
  refs.soundToggle.addEventListener("click", toggleSound);
  refs.resetProgress.addEventListener("click", resetProgress);
  refs.backToMap.addEventListener("click", showMap);
  refs.goToMapFromSummary.addEventListener("click", showMap);
  refs.nextStage.addEventListener("click", advanceFromSummary);
  refs.checkAnswer.addEventListener("click", checkCurrentAnswer);
  refs.undoAction.addEventListener("click", undoAction);
  refs.hintButton.addEventListener("click", () => revealHint(true));

  // Back to start button on map screen
  const backToStartFromMap = document.getElementById("backToStartFromMap");
  if (backToStartFromMap) {
    backToStartFromMap.addEventListener("click", () => showScreen("screenStart"));
  }
  refs.sandboxTriangle.addEventListener("click", () => {
    appState.sandbox.shapeKey = "triangleSandbox";
    appState.sandbox.selectedSide = 0;
    appState.sandbox.showAltitudes = false;
    renderSandbox();
  });
  refs.sandboxTriangleWide.addEventListener("click", () => {
    appState.sandbox.shapeKey = "triangleSandboxWide";
    appState.sandbox.selectedSide = 0;
    appState.sandbox.showAltitudes = false;
    renderSandbox();
  });
  refs.sandboxParallelogram.addEventListener("click", () => {
    appState.sandbox.shapeKey = "parallelogramSandbox";
    appState.sandbox.selectedSide = 0;
    appState.sandbox.showAltitudes = false;
    renderSandbox();
  });
  refs.sandboxParallelogramTilted.addEventListener("click", () => {
    appState.sandbox.shapeKey = "parallelogramSandboxTilted";
    appState.sandbox.selectedSide = 0;
    appState.sandbox.showAltitudes = false;
    renderSandbox();
  });
  refs.sandboxShowAltitudes.addEventListener("click", () => {
    appState.sandbox.showAltitudes = !appState.sandbox.showAltitudes;
    renderSandbox();
  });
  refs.sandboxBack.addEventListener("click", () => showScreen("screenStart"));

  refs.gameCanvas.addEventListener("pointerdown", handleCanvasPointerDown);
  refs.gameCanvas.addEventListener("pointermove", handleCanvasPointerMove);
  refs.gameCanvas.addEventListener("pointerup", handleCanvasPointerUp);
  refs.gameCanvas.addEventListener("pointercancel", handleCanvasPointerCancel);
  refs.gameCanvas.addEventListener("pointerleave", handleCanvasPointerCancel);
  refs.sandboxCanvas.addEventListener("pointerdown", handleSandboxPointerUp);
  refs.sandboxCanvas.addEventListener("pointerup", handleSandboxPointerUp);
}

function startFlow() {
  if (!appState.progress.diagnosticCompleted) {
    showDiagnostic();
    return;
  }
  showMap();
}

function showDiagnostic() {
  appState.progress.diagnosticAnswers = [];
  renderDiagnosticQuestion(0);
  showScreen("screenDiagnostic");
}

function renderDiagnosticQuestion(index) {
  refs.diagnosticProgress.textContent = `${index} / ${DIAGNOSTIC.length}`;
  const q = DIAGNOSTIC[index];
  if (!q) {
    finishDiagnostic();
    return;
  }
  refs.diagnosticProgress.textContent = `${index + 1} / ${DIAGNOSTIC.length}`;
  refs.diagnosticCard.innerHTML = `
    <div class="panel" style="padding: 24px;">
      <p class="panel-kicker">שאלה ${index + 1}</p>
      <h2 style="margin: 0 0 10px;">${q.prompt}</h2>
      <div class="choice-area" id="diagnosticChoices"></div>
      <div id="diagnosticFeedback" class="feedback-area"></div>
    </div>
  `;
  const container = document.getElementById("diagnosticChoices");
  q.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.textContent = option;
    button.addEventListener("click", () => {
      const correct = optionIndex === q.correctIndex;
      appState.progress.diagnosticAnswers.push(correct);
      playTone(correct ? "success" : "error");
      document.getElementById("diagnosticFeedback").innerHTML = `
        <div class="feedback-card ${correct ? "success" : "error"}">
          <p><strong>${correct ? "נכון." : "כמעט."}</strong></p>
          <p>${q.explanation}</p>
          <button class="primary-button" id="nextDiagnosticButton">ממשיכים</button>
        </div>
      `;
      document.getElementById("nextDiagnosticButton").addEventListener("click", () => {
        renderDiagnosticQuestion(index + 1);
      });
    });
    container.appendChild(button);
  });
}

function finishDiagnostic() {
  const allCorrect = appState.progress.diagnosticAnswers.every(Boolean);
  appState.progress.diagnosticCompleted = true;
  appState.progress.skipWarmup = allCorrect;
  saveProgress();
  showMap();
}

function showMap() {
  renderMap();
  showScreen("screenMap");
}

function renderMap() {
  refs.mapGrid.innerHTML = "";
  const HP_ICONS = ["⚡","🧙","🪄","📚","🦉","🏰","🌟","✨","🔮","🏆"];
  STAGES.forEach((stage, index) => {
    const complete = appState.progress.completedStages.includes(index);
    const isCurrent = index === appState.progress.currentStage;
    const isLocked = index > appState.progress.unlockedStage;
    const icon = HP_ICONS[index] || (stage.family === "parallelogram" ? "▱" : "△");
    // All stages are CLICKABLE - locked ones show as dimmed but still work
    const status = complete ? "✅ הושלם" : isCurrent ? "▶ ממשיכים כאן" : isLocked ? "🔓 פתוח לדילוג" : "⭕ פתוח";
    const node = document.createElement("button");
    node.className = `stage-node ${isLocked ? "locked" : ""} ${complete ? "complete" : ""} ${isCurrent ? "current" : ""}`;
    // NO disabled attribute - all stages are accessible
    node.innerHTML = `
      <span class="stage-node-icon" aria-hidden="true">${icon}</span>
      <strong>שיעור ${index + 1}</strong>
      <span>${stage.title}</span>
      <small>${stage.goal}</small>
      <span class="stage-node-status">${status}</span>
    `;
    node.addEventListener("click", () => startStage(index));
    refs.mapGrid.appendChild(node);
  });
}

function renderMiniMap() {
  refs.miniMap.innerHTML = "";
  STAGES.forEach((stage, index) => {
    const div = document.createElement("div");
    div.className = `mini-node ${appState.progress.completedStages.includes(index) ? "complete" : ""} ${appState.progress.currentStage === index ? "current" : ""}`;
    div.textContent = index + 1;
    refs.miniMap.appendChild(div);
  });
}

function startStage(index) {
  stopChallengeTimer();
  appState.challengeMode = false;
  appState.stageIndex = index;
  appState.progress.currentStage = index;
  const stage = STAGES[index];
  appState.stageQuestions = buildStageQuestionSet(stage, index, appState.progress.skipWarmup && index === 0);
  appState.questionIndex = 0;
  appState.stageMetrics = createMetricState();
  appState.progress.skipWarmup = false;
  saveProgress();
  loadQuestion();
  showScreen("screenGame");
}

function formatHPLore(text, q) {
  if (!text || !q) return text;
  const labels = ['A', 'B', 'C', 'D'];
  const shapeLen = q.shape?.points?.length || 3;
  
  // Fallbacks if shape structure doesn't match
  if (q.baseSide === undefined || q.vertexIndex === undefined) return text;
  
  const base = q.baseSide;
  const vtx = q.vertexIndex;
  const baseText = `${labels[base]}-${labels[(base + 1) % shapeLen]}`;
  const vtxText = labels[vtx];
  
  let formatted = text.replace(/\[VTX\]/g, vtxText).replace(/\[BASE\]/g, baseText);
  
  // Force injection for older static prompts
  if (!text.includes("[VTX]") && !text.includes(vtxText)) {
      formatted += ` (קודקוד ${vtxText} ← בסיס ${baseText})`;
  }
  
  return formatted;
}

function loadQuestion() {
  clearHintTimer();
  appState.currentQuestion = appState.stageQuestions[appState.questionIndex];
  appState.currentRender = null;
  appState.selectedChoice = null;
  appState.selectedCandidate = null;
  appState.selectedSide = null;
  appState.reasonInput = "";
  appState.studentLine = null;
  appState.dragging = null;
  appState.answered = false;
  appState.hintShown = false;
  appState.feedbackRendered = false;
  appState.questionStartedAt = Date.now();
  refs.feedbackArea.innerHTML = "";
  refs.choiceArea.innerHTML = "";
  refs.hintPulse.classList.add("hidden");
  refs.angleReadout.textContent = "זווית מול הבסיס: --";

  const stage = STAGES[appState.stageIndex];
  const q = appState.currentQuestion;
  refs.stageEyebrow.textContent = appState.challengeMode ? `⚡ מנוסה לסוהרסנים · שיעור ${appState.stageIndex + 1}` : `⚡ שיעור ${appState.stageIndex + 1}`;
  refs.stageTitle.textContent = appState.challengeMode ? `הגעה לרכבת הוגוורטס אקספרס` : stage.title;
  refs.stageGoal.textContent = stage.goal;
  refs.stageCounter.textContent = `שאלה ${appState.questionIndex + 1} / ${appState.stageQuestions.length}`;
  
  refs.questionPrompt.textContent = formatHPLore(q.prompt, q);
  refs.questionStory.innerHTML = formatHPLore(q.story || stage.story, q);
  refs.coachName.textContent = q.coachName || "פרופ׳ דמבלדור";
  refs.coachMessage.textContent = formatHPLore(q.coach || stage.coach, q);

  // Voldemort Boss logic injection Point
  if (typeof updateVoldemortPanel === "function") {
    updateVoldemortPanel(q);
  }

  renderQuestionControls();
  updateMetrics();
  renderQuestionCanvas();
  appState.hintTimer = window.setTimeout(() => revealHint(false), 8000);
}

function renderQuestionControls() {
  const q = appState.currentQuestion;
  refs.choiceArea.innerHTML = "";
  refs.checkAnswer.disabled = false;
  refs.undoAction.disabled = q.kind !== "draw-altitude";

  if (q.kind === "choice" || q.kind === "fix-mistake" || q.kind === "true-false") {
    q.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "choice-button";
      button.textContent = option;
      button.addEventListener("click", () => {
        if (appState.answered) return;
        appState.selectedChoice = index;
        renderQuestionControls();
      });
      if (appState.selectedChoice === index) {
        button.classList.add("selected");
      }
      refs.choiceArea.appendChild(button);
    });
  } else if (q.kind === "reason-text") {
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.innerHTML = `
      <label style="display:block; font-weight:700; margin-bottom:8px;">כתוב הסבר קצר:</label>
      <textarea id="reasonInput" rows="3" style="width:100%; border-radius:16px; border:1px solid rgba(25,89,181,0.14); padding:12px 14px; font:inherit; resize:vertical;" placeholder="${q.placeholder || "למשל: כי הקטע יוצא מהקודקוד ומאונך לבסיס"}">${appState.reasonInput}</textarea>
      <div style="margin-top:8px; color:#5a7088;">מילים שכדאי לחשוב עליהן: ${q.keywords.join(" · ")}</div>
    `;
    refs.choiceArea.appendChild(wrapper);
    const input = document.getElementById("reasonInput");
    input.addEventListener("input", (event) => {
      appState.reasonInput = event.target.value;
    });
  } else if (q.kind === "draw-altitude") {
    const helper = document.createElement("div");
    helper.className = "feedback-card";
    helper.innerHTML = `
      <p><strong>איך עובדים כאן?</strong></p>
      <p>גוררים מהקודקוד הנכון אל הבסיס הכחול או אל המשכו. אם הזווית קרובה ל־90° יופיע סימון זווית ישרה.</p>
    `;
    if (appState.stageIndex === 0 && appState.questionIndex <= 5) {
      refs.choiceArea.appendChild(helper);
    }
  }
}

function handleCanvasPointerDown(event) {
  if (appState.answered || !appState.currentQuestion) return;
  const q = appState.currentQuestion;
  if (q.kind !== "draw-altitude") return;
  const point = getCanvasPoint(refs.gameCanvas, event);
  const render = appState.currentRender;
  const snappedVertex = hitTestVertices(point, render.scaledPoints);
  const targetVertex = snappedVertex === -1 ? nearestVertexIndex(point, render.scaledPoints) : snappedVertex;
  if (targetVertex === -1 || distance(point, render.scaledPoints[targetVertex]) > 28) return;
  refs.gameCanvas.setPointerCapture?.(event.pointerId);
  appState.dragging = { vertexIndex: targetVertex };
  updateStudentLine(point);
}

function handleCanvasPointerMove(event) {
  if (!appState.dragging || appState.currentQuestion?.kind !== "draw-altitude") return;
  const point = getCanvasPoint(refs.gameCanvas, event);
  updateStudentLine(point);
}

function handleCanvasPointerUp(event) {
  if (appState.answered || !appState.currentQuestion) return;
  const q = appState.currentQuestion;
  const point = getCanvasPoint(refs.gameCanvas, event);
  if (!appState.currentRender) return;

  if (q.kind === "draw-altitude") {
    if (appState.dragging) {
      updateStudentLine(point);
    }
    appState.dragging = null;
    return;
  }

  if (q.kind === "select-altitude") {
    appState.selectedCandidate = hitTestSegments(point, appState.currentRender.candidateLines);
    renderQuestionCanvas();
    return;
  }

  if (q.kind === "reverse-base") {
    appState.selectedSide = hitTestSegments(point, appState.currentRender.sideSegments);
    renderQuestionCanvas();
  }
}

function handleCanvasPointerCancel() {
  appState.dragging = null;
}

function updateStudentLine(point) {
  const q = appState.currentQuestion;
  const render = appState.currentRender;
  if (!render) return;
  const baseSegment = render.baseLine;
  const target = projectPointOntoLine(point, baseSegment.p1, baseSegment.p2);
  const clampedTarget = q.allowExtension ? target : clampToSegment(target, baseSegment.p1, baseSegment.p2);
  appState.studentLine = {
    fromIndex: appState.dragging.vertexIndex,
    to: clampedTarget,
  };
  renderQuestionCanvas();
}

function undoAction() {
  if (appState.currentQuestion?.kind !== "draw-altitude" || appState.answered) return;
  appState.studentLine = null;
  refs.angleReadout.textContent = "זווית מול הבסיס: --";
  renderQuestionCanvas();
}

function renderQuestionCanvas() {
  ctx.clearRect(0, 0, refs.gameCanvas.width, refs.gameCanvas.height);
  const q = appState.currentQuestion;
  if (!q) return;

  drawCanvasBackground(ctx, refs.gameCanvas.width, refs.gameCanvas.height);
  const render = buildRenderModel(q);
  appState.currentRender = render;
  const shapeColor = "#a78bfa";

  drawShape(ctx, render, shapeColor);
  drawBase(ctx, render);
  if (q.allowExtension) {
    drawExtension(ctx, render.baseLine);
  }

  if (q.kind === "select-altitude") {
    render.candidateLines.forEach((line, index) => {
      drawCandidateLine(ctx, line, index === appState.selectedCandidate, index === q.correctIndex && appState.answered);
    });
  }

  if (q.kind === "reverse-base") {
    drawLine(ctx, render.shownLine, "#e14d6f", 5);
    drawRightAngleMarker(ctx, render.shownLine, render.baseLine, "#ff9f43");
    render.sideSegments.forEach((side, index) => {
      if (index === appState.selectedSide) {
        drawSideHighlight(ctx, side);
      }
    });
  }

  if (q.kind === "choice" || q.kind === "fix-mistake" || q.kind === "reason-text") {
    if (render.shownLine) {
      drawLine(ctx, render.shownLine, q.kind === "fix-mistake" ? "#c1677b" : "#e14d6f", 5, q.kind === "fix-mistake");
    }
    if (q.showRightAngle) {
      drawRightAngleMarker(ctx, render.shownLine, render.baseLine, "#ff9f43");
    }
  }

  if (q.kind === "draw-altitude") {
    if (appState.studentLine) {
      const line = {
        p1: render.scaledPoints[appState.studentLine.fromIndex],
        p2: appState.studentLine.to,
      };
      drawLine(ctx, line, "#f59e0b", 5);
      const angle = perpendicularDifference(render.baseLine, line);
      refs.angleReadout.textContent = `זווית מול הבסיס: ${Math.round(90 - angle)}°`;
      if (angle <= DRAW_TOLERANCE_BY_STAGE[appState.stageIndex]) {
        drawRightAngleMarker(ctx, line, render.baseLine, "#00c878");
      }
    }
  }

  if (q.kind === "choice" || q.kind === "fix-mistake" || q.kind === "reason-text" || q.kind === "draw-altitude") {
    if (q.baseSide !== undefined) {
      drawSideLabels(ctx, render);
    }
  }

  drawVertexLabels(ctx, render.scaledPoints, q.shape.labels);
}

function checkCurrentAnswer() {
  if (!appState.currentQuestion || appState.answered) return;
  const q = appState.currentQuestion;
  let correct = false;

  if (q.kind === "select-altitude") {
    if (appState.selectedCandidate === null) {
      setCoach("הכבשה מהספרייה", "בחר קודם קטע אחד שנראה לך כמו גובה.");
      return;
    }
    correct = appState.selectedCandidate === q.correctIndex;
  } else if (q.kind === "reverse-base") {
    if (appState.selectedSide === null) {
      setCoach("התיקן השובב", "הקו האדום כבר מסומן. עכשיו צריך לבחור לאיזו צלע הוא שייך.");
      return;
    }
    correct = appState.selectedSide === q.correctSide;
  } else if (q.kind === "choice" || q.kind === "fix-mistake" || q.kind === "true-false") {
    if (appState.selectedChoice === null) {
      setCoach("הכבשה מהספרייה", "בחר תשובה אחת לפני שבודקים.");
      return;
    }
    correct = appState.selectedChoice === q.correctIndex;
  } else if (q.kind === "reason-text") {
    if (!appState.reasonInput.trim()) {
      setCoach("הכבשה מהספרייה", "כתוב הסבר קצר לפני שבודקים.");
      return;
    }
    correct = evaluateReasonInput(q, appState.reasonInput);
  } else if (q.kind === "draw-altitude") {
    if (!appState.studentLine) {
      setCoach("הנמלה המכשפת", "צייר קודם קו מהקודקוד אל הבסיס או אל המשכו.");
      return;
    }
    correct = evaluateStudentLine(q, appState.currentRender, appState.studentLine);
  }

  finalizeAnswer(correct);
}

function finalizeAnswer(correct) {
  appState.answered = true;
  appState.lastAnswerCorrect = correct;
  clearHintTimer();
  const q = appState.currentQuestion;
  const elapsed = Date.now() - appState.questionStartedAt;
  const category = q.category;
  appState.stageMetrics[category].total += 1;
  if (correct) {
    appState.stageMetrics[category].correct += 1;
  }
  if (appState.hintShown) {
    appState.stageMetrics.hintsUsed += 1;
  }
  appState.stageMetrics.totalScore += correct ? 1 : 0;
  if (correct && elapsed <= 5000) {
    appState.progress.stats.fastCorrect += 1;
  }
  if (correct && q.kind === "fix-mistake") {
    appState.progress.stats.fixMistakesCorrect += 1;
  }
  if (correct && q.allowExtension) {
    appState.progress.stats.externalAltitudes += 1;
  }
  if (!correct) {
    registerMistakePattern(detectMistakePattern(q));
  }
  updateMetrics();
  renderFeedback(correct, q);
  
  if (appState.inBossBattle && typeof triggerVoldemortDefeat === "function") {
    triggerVoldemortDefeat(correct);
  }

  playTone(correct ? "success" : "error");
  renderAchievements();
  saveProgress();
}

function renderFeedback(correct, q) {
  const adaptiveTip = correct ? "" : getAdaptiveCoachMessage(detectMistakePattern(q));
  const card = document.createElement("div");
  card.className = `feedback-card ${correct ? "success" : "error"}`;
  card.innerHTML = `
    <p><strong>${correct ? "✅ " : "❌ "}${correct ? "נכון! לחש הצליח!" : "לא מדויק. נסה שוב."}</strong></p>
    <p>${correct ? q.successText : q.errorText}</p>
    <p><strong>📜 הכלל:</strong> ${q.ruleText}</p>
    ${adaptiveTip ? `<p><strong>💡 מה לבדוק עכשיו:</strong> ${adaptiveTip}</p>` : ""}
    <button class="primary-button" id="nextQuestionButton">⚡ לשאלה הבאה</button>
  `;
  refs.feedbackArea.innerHTML = "";
  refs.feedbackArea.appendChild(card);
  if (!correct && adaptiveTip) {
    setCoach("פרופ׳ מקגונאגל", adaptiveTip);
  }
  document.getElementById("nextQuestionButton").addEventListener("click", advanceQuestion);
  // Auto-scroll so feedback + next button are always visible
  setTimeout(() => {
    refs.feedbackArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 80);
}

function advanceQuestion() {
  if (appState.challengeMode) {
    appState.challengeScore += appState.lastAnswerCorrect ? 1 : 0;
  }

  if (appState.questionIndex < appState.stageQuestions.length - 1) {
    appState.questionIndex += 1;
    loadQuestion();
    return;
  }

  if (appState.challengeMode) {
    finishChallenge();
    return;
  }

  finishStage();
}

function finishStage() {
  const score = appState.stageMetrics.totalScore;
  const stageNumber = appState.stageIndex + 1;
  const weakest = weakestMetricEntry(appState.stageMetrics);
  const isFinalStage = appState.stageIndex === STAGES.length - 1;
  if (appState.stageMetrics.hintsUsed === 0) {
    appState.progress.stats.noHintStages += 1;
  }

  if (!appState.progress.completedStages.includes(appState.stageIndex)) {
    appState.progress.completedStages.push(appState.stageIndex);
  }
  appState.progress.unlockedStage = Math.max(appState.progress.unlockedStage, Math.min(STAGES.length - 1, appState.stageIndex + 1));
  if (appState.stageIndex < STAGES.length - 1 && weakest && weakest.ratio < 0.6) {
    appState.progress.pendingBooster = {
      stageIndex: appState.stageIndex + 1,
      category: weakest.key,
    };
  } else if (appState.progress.pendingBooster?.stageIndex === appState.stageIndex + 1) {
    appState.progress.pendingBooster = null;
  }
  updateBridge();
  renderMiniMap();
  renderAchievements();
  saveProgress();

  refs.summaryTitle.textContent = `🏰 שיעור ${stageNumber} הושלם!`;
  refs.summaryScore.textContent = `${score} / ${appState.stageQuestions.length}`;
  refs.summaryBridge.textContent = score >= 8 ? "🌟 הגשר מתחזק!" : "⚡ עוד קצת חיזוק";
  refs.summaryIdentify.textContent = `${appState.stageMetrics.identify.correct} / ${appState.stageMetrics.identify.total}`;
  refs.summaryDraw.textContent = `${appState.stageMetrics.draw.correct} / ${appState.stageMetrics.draw.total}`;
  refs.summaryReason.textContent = `${appState.stageMetrics.reason.correct} / ${appState.stageMetrics.reason.total}`;
  refs.summaryWeakness.textContent = weakest?.label || "עדיין אין נתונים";
  refs.summaryVictory.classList.add("hidden");
  refs.summaryVictory.innerHTML = "";
  refs.nextStage.textContent = isFinalStage ? "🗺️ חזרה למפה" : "⚡ לשיעור הבא";

  // Boss / Wand logic integration
  if (typeof showBossDefeatCardInSummary === "function") {
    // Score criteria: totalScore out of stageQuestions.length
    showBossDefeatCardInSummary(score, appState.stageQuestions.length);
  }

  if (isFinalStage) {
    refs.summaryChallenge.classList.add("hidden");
    refs.summaryChallenge.innerHTML = "";
    refs.summaryVictory.classList.remove("hidden");
    refs.summaryVictory.innerHTML = `
      <p><strong>הגשר הושלם.</strong></p>
      <p>אורי סיים מסלול מלא של גבהים בכיתה ה׳: זיהוי, שרטוט, בסיס, המשך צלע ומקבילית.</p>
      <p>כדי להמשיך להתחזק אפשר לחזור לתחנות, לפתוח שוב שלבים חלשים, או לעבוד בחדר הניסויים.</p>
    `;
  } else if (appState.stageIndex >= 6 && score >= 8) {
    refs.summaryChallenge.classList.remove("hidden");
    refs.summaryChallenge.innerHTML = `
      <p><strong>⚡ מצב אתגר נפתח!</strong></p>
      <p>3 שאלות ב־60 שניות. לא חובה, כן כיף. יאלה, קוסם!</p>
      <button id="startChallenge" class="primary-button">🏆 להתחיל אתגר</button>
    `;
    document.getElementById("startChallenge").addEventListener("click", startChallenge);
  } else {
    refs.summaryChallenge.classList.add("hidden");
    refs.summaryChallenge.innerHTML = "";
  }

  showScreen("screenSummary");
}

function startChallenge() {
  appState.challengeMode = true;
  appState.challengeScore = 0;
  appState.challengeQuestions = buildChallengeQuestions(appState.stageIndex);
  appState.stageQuestions = appState.challengeQuestions;
  appState.questionIndex = 0;
  appState.challengeTime = 180; // 3 minutes for the Hogwarts Express escape
  
  refs.challengeTimer.classList.remove("hidden");
  refs.challengeTimer.textContent = "⏱️ 03:00";
  
  appState.challengeTimerId = window.setInterval(() => {
    appState.challengeTime -= 1;
    let m = Math.floor(appState.challengeTime / 60);
    let s = appState.challengeTime % 60;
    refs.challengeTimer.textContent = `⏱️ 0${m}:${s < 10 ? '0'+s : s}`;
    
    if (appState.challengeTime <= 0) {
      finishChallenge(false);
    }
  }, 1000);
  
  loadQuestion();
  showScreen("screenGame");
}

function finishChallenge(won = false) {
  stopChallengeTimer();
  appState.challengeMode = false;
  refs.summaryChallenge.classList.remove("hidden");
  
  if (won || appState.challengeScore >= 10) {
    refs.summaryChallenge.innerHTML = `
      <h3 style="color:var(--gold)">⚡ הארי הגיע לרכבת!</h3>
      <p>"הגעת להוגוורטס אקספרס בדיוק בזמן! הסוהרסנים נשארו מאחור."</p>
      <img src="assets/img_train_1776107742896.png" style="width:120px" />
      <p>ציון סופי במנוסה: ${appState.challengeScore}</p>
    `;
  } else {
    refs.summaryChallenge.innerHTML = `
      <h3 style="color:#ef4444">🧊 הסוהרסנים השיגו אותך</h3>
      <p>"הקפאון מתפשט. דמבלדור ממתין שתנסה שוב, הארי. אל תאבד תקווה."</p>
      <img src="assets/bg_hogwarts_dark_1776107671192.png" style="width:100%; border-radius:8px"/>
      <p>ציון סופי במנוסה: ${appState.challengeScore}</p>
    `;
  }
  showScreen("screenSummary");
}

function stopChallengeTimer() {
  if (appState.challengeTimerId) {
    window.clearInterval(appState.challengeTimerId);
    appState.challengeTimerId = null;
  }
  refs.challengeTimer.classList.add("hidden");
}

function advanceFromSummary() {
  const nextStageIndex = Math.min(STAGES.length - 1, appState.stageIndex + 1);
  if (nextStageIndex === appState.stageIndex && appState.progress.completedStages.length === STAGES.length) {
    showMap();
    return;
  }
  startStage(nextStageIndex);
}

function revealHint(fromButton) {
  if (!appState.currentQuestion || appState.answered || appState.hintShown) return;
  appState.hintShown = true;
  appState.currentQuestion.hintUsed = true;
  const q = appState.currentQuestion;

  // Vague hint: just pulse the center of the canvas — no pinpointing
  refs.hintPulse.style.setProperty("--hint-x", "50%");
  refs.hintPulse.style.setProperty("--hint-y", "50%");
  refs.hintPulse.classList.remove("hidden");

  // Give a vague coach message — no direct answer
  const vagueHints = {
    "draw-altitude": "זכור: גובה חייב לצאת מקודקוד ולפגוש את הבסיס בזווית של 90°.",
    "select-altitude": "בדוק כל קו: האם הוא יוצא מהקודקוד? האם הוא מאונך לבסיס הכחול?",
    "reverse-base": "הקו האדום מאונך לאחת הצלעות. לאיזו?",
    "choice": "קרא את הכלל בספר הלחשים: גובה = קודקוד + מאונך + בסיס.",
    "fix-mistake": "מצא איזה תנאי מהשלושה לא מתקיים: קודקוד, מאונך, בסיס.",
    "reason-text": "הסבר טוב חייב להזכיר לפחות שניים מ: קודקוד, בסיס, מאונך, המשך.",
  };
  const msg = vagueHints[q.kind] || "חשוב לאט על ההגדרה המלאה של גובה.";
  setCoach("פרופ׳ מקגונאגל", fromButton ? msg : "💡 ");
}

function setCoach(name, message) {
  refs.coachName.textContent = name;
  refs.coachMessage.textContent = message;
}

function updateMetrics() {
  refs.metricIdentify.textContent = `${appState.stageMetrics?.identify.correct || 0} / ${appState.stageMetrics?.identify.total || 0}`;
  refs.metricDraw.textContent = `${appState.stageMetrics?.draw.correct || 0} / ${appState.stageMetrics?.draw.total || 0}`;
  refs.metricReason.textContent = `${appState.stageMetrics?.reason.correct || 0} / ${appState.stageMetrics?.reason.total || 0}`;
}

function buildRenderModel(q) {
  const scaledPoints = q.shape.points.map(([x, y]) => ({
    x: 90 + x * (refs.gameCanvas.width - 180),
    y: 60 + y * (refs.gameCanvas.height - 120),
  }));
  const sideSegments = q.shape.sides.map(([from, to]) => ({
    p1: scaledPoints[from],
    p2: scaledPoints[to],
  }));
  const baseLine = q.baseSide !== undefined ? sideSegments[q.baseSide] : null;

  const render = { scaledPoints, sideSegments, baseLine };

  if (q.kind === "select-altitude") {
    render.candidateLines = q.candidates.map((candidate) => resolveCandidate(candidate, scaledPoints, sideSegments));
  }
  if (q.kind === "reverse-base" || q.kind === "choice" || q.kind === "fix-mistake" || q.kind === "reason-text") {
    if (q.shownLine) {
      render.shownLine = resolveCandidate(q.shownLine, scaledPoints, sideSegments);
    }
  }

  return render;
}

function resolveCandidate(candidate, scaledPoints, sideSegments) {
  const p1 = candidate.fromPoint || scaledPoints[candidate.fromIndex];
  let p2 = candidate.toPoint;
  if (!p2 && candidate.toIndex !== undefined) {
    p2 = scaledPoints[candidate.toIndex];
  }
  if (!p2 && candidate.toSide !== undefined) {
    const segment = sideSegments[candidate.toSide];
    p2 = lerpPoint(segment.p1, segment.p2, candidate.sideT ?? 0.5);
  }
  if (!p2 && candidate.toProjection !== undefined) {
    const segment = sideSegments[candidate.toProjection.side];
    p2 = projectPointFromVertex(scaledPoints[candidate.fromIndex], segment.p1, segment.p2);
  }
  return { p1, p2 };
}

function evaluateStudentLine(q, render, studentLine) {
  const fromPoint = render.scaledPoints[studentLine.fromIndex];
  const line = { p1: fromPoint, p2: studentLine.to };
  const angleDiff = perpendicularDifference(render.baseLine, line);
  const tolerance = DRAW_TOLERANCE_BY_STAGE[appState.stageIndex];
  const correctVertex = studentLine.fromIndex === q.vertexIndex;
  const projected = projectPointOntoLine(studentLine.to, render.baseLine.p1, render.baseLine.p2);
  const distanceToLine = distance(studentLine.to, projected);
  const onSegment = pointOnSegment(projected, render.baseLine.p1, render.baseLine.p2);

  if (!q.allowExtension && !onSegment) return false;
  if (distanceToLine > 4) return false;
  return correctVertex && angleDiff <= tolerance;
}

function renderSandbox() {
  drawCanvasBackground(sandboxCtx, refs.sandboxCanvas.width, refs.sandboxCanvas.height);
  const shape = SHAPES[appState.sandbox.shapeKey];
  const render = {
    scaledPoints: shape.points.map(([x, y]) => ({
      x: 90 + x * (refs.sandboxCanvas.width - 180),
      y: 60 + y * (refs.sandboxCanvas.height - 120),
    })),
  };
  render.sideSegments = shape.sides.map(([from, to]) => ({
    p1: render.scaledPoints[from],
    p2: render.scaledPoints[to],
  }));
  drawShape(sandboxCtx, render, "#a78bfa");
  drawVertexLabels(sandboxCtx, render.scaledPoints, shape.labels);
  render.sideSegments.forEach((side, index) => {
    if (index === appState.sandbox.selectedSide) {
      sandboxCtx.save();
      sandboxCtx.strokeStyle = "#2c7be5";
      sandboxCtx.lineWidth = 6;
      sandboxCtx.beginPath();
      sandboxCtx.moveTo(side.p1.x, side.p1.y);
      sandboxCtx.lineTo(side.p2.x, side.p2.y);
      sandboxCtx.stroke();
      sandboxCtx.restore();
    }
  });

  if (appState.sandbox.showAltitudes) {
    if (shape.kind === "triangle") {
      shape.sides.forEach(([from, to], sideIndex) => {
        const opposite = [0, 1, 2].find((index) => index !== from && index !== to);
        const foot = projectPointFromVertex(render.scaledPoints[opposite], render.sideSegments[sideIndex].p1, render.sideSegments[sideIndex].p2);
        drawLine(sandboxCtx, { p1: render.scaledPoints[opposite], p2: foot }, "#e14d6f", 4);
      });
      refs.sandboxText.textContent = "במשולש מוצגים שלושת הגבהים. חלקם מופיעים כמו קווי קסם בתוך הצורה וחלקם מחוצה לה.";
    } else {
      const base = render.sideSegments[appState.sandbox.selectedSide];
      const oppositeVertices = oppositeVerticesForParallelogram(appState.sandbox.selectedSide);
      oppositeVertices.forEach((vertexIndex) => {
        const foot = projectPointFromVertex(render.scaledPoints[vertexIndex], base.p1, base.p2);
        drawLine(sandboxCtx, { p1: render.scaledPoints[vertexIndex], p2: foot }, "#e14d6f", 4);
      });
      refs.sandboxText.textContent = "במקבילית מוצגים שני גבהים מייצגים ביחס לבסיס שבחרת, כמו קווי יציבות שמחזיקים את הגשר.";
    }
  } else {
    refs.sandboxText.textContent = "בחר צורה, לחץ על בסיס, ואז לחץ על 'הראה גבהים' כדי לראות את קווי היציבות.";
  }
}

function handleSandboxPointerUp(event) {
  const point = getCanvasPoint(refs.sandboxCanvas, event);
  const shape = SHAPES[appState.sandbox.shapeKey];
  const scaledPoints = shape.points.map(([x, y]) => ({
    x: 90 + x * (refs.sandboxCanvas.width - 180),
    y: 60 + y * (refs.sandboxCanvas.height - 120),
  }));
  const sideSegments = shape.sides.map(([from, to]) => ({
    p1: scaledPoints[from],
    p2: scaledPoints[to],
  }));
  const sideIndex = hitTestSegments(point, sideSegments);
  if (sideIndex !== -1) {
    appState.sandbox.selectedSide = sideIndex;
    renderSandbox();
  }
}

function renderAchievements() {
  refs.achievementList.innerHTML = "";
  ACHIEVEMENTS.forEach((achievement) => {
    const unlocked = achievement.isUnlocked(appState.progress.stats);
    const div = document.createElement("div");
    div.className = `achievement-item ${unlocked ? "" : "locked"}`;
    div.innerHTML = `
      <div>
        <strong>${achievement.title}</strong>
        <span>${achievement.description}</span>
      </div>
      <div>${unlocked ? "✅" : "🔒"}</div>
    `;
    refs.achievementList.appendChild(div);
  });
}

function updateBridge() {
  const percent = ((appState.progress.completedStages.length || 0) / STAGES.length) * 100;
  refs.bridgeFill.style.width = `${percent}%`;
}

function toggleSound() {
  appState.soundOn = !appState.soundOn;
  updateSoundButton();
}

function updateSoundButton() {
  refs.soundToggle.textContent = `${appState.soundOn ? "🔊" : "🔇"} קסם קולי`;
}

function playTone(type) {
  if (!appState.soundOn) return;
  if (!appState.audioCtx) {
    appState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const ctxAudio = appState.audioCtx;
  const oscillator = ctxAudio.createOscillator();
  const gain = ctxAudio.createGain();
  oscillator.type = type === "success" ? "triangle" : "sine";
  oscillator.frequency.value = type === "success" ? 660 : 280;
  gain.gain.value = 0.0001;
  oscillator.connect(gain);
  gain.connect(ctxAudio.destination);
  oscillator.start();
  const now = ctxAudio.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === "success" ? 0.18 : 0.22));
  oscillator.frequency.exponentialRampToValueAtTime(type === "success" ? 990 : 220, now + 0.15);
  oscillator.stop(now + 0.23);
}

function resetProgress() {
  if (!window.confirm("לאפס את ההתקדמות וההישגים?")) return;
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

function showScreen(id) {
  appState.screens.forEach((screenId) => {
    document.getElementById(screenId).classList.toggle("active", screenId === id);
  });
}

function clearHintTimer() {
  if (appState.hintTimer) {
    window.clearTimeout(appState.hintTimer);
    appState.hintTimer = null;
  }
}

function resizeStaticCanvases() {
  refs.gameCanvas.width = CANVAS_SIZE.width;
  refs.gameCanvas.height = CANVAS_SIZE.height;
  refs.sandboxCanvas.width = CANVAS_SIZE.width;
  refs.sandboxCanvas.height = CANVAS_SIZE.height;
}

function loadProgress() {
  const fallback = {
    diagnosticCompleted: false,
    diagnosticAnswers: [],
    skipWarmup: false,
    currentStage: 0,
    unlockedStage: 0,
    completedStages: [],
    pendingBooster: null,
    stats: {
      fixMistakesCorrect: 0,
      externalAltitudes: 0,
      fastCorrect: 0,
      noHintStages: 0,
      mistakePatterns: {
        vertex: 0,
        perpendicular: 0,
        base: 0,
        extension: 0,
        explanation: 0,
      },
    },
  };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;
    return {
      ...fallback,
      ...parsed,
      completedStages: Array.isArray(parsed.completedStages) ? parsed.completedStages : fallback.completedStages,
      pendingBooster: parsed.pendingBooster ?? null,
      stats: {
        ...fallback.stats,
        ...(parsed.stats || {}),
        mistakePatterns: {
          ...fallback.stats.mistakePatterns,
          ...((parsed.stats && parsed.stats.mistakePatterns) || {}),
        },
      },
    };
  } catch {
    return fallback;
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.progress));
}

function createMetricState() {
  return {
    identify: { correct: 0, total: 0 },
    draw: { correct: 0, total: 0 },
    reason: { correct: 0, total: 0 },
    totalScore: 0,
    hintsUsed: 0,
  };
}

function weakestMetricLabel(metrics) {
  const weakest = weakestMetricEntry(metrics);
  return weakest?.label || "עדיין אין נתונים";
}

function weakestMetricEntry(metrics) {
  const entries = [
    { key: "identify", label: "זיהוי", metric: metrics.identify },
    { key: "draw", label: "שרטוט", metric: metrics.draw },
    { key: "reason", label: "נימוק", metric: metrics.reason },
  ];
  entries.sort((a, b) => ratio(a.metric) - ratio(b.metric));
  const weakest = entries[0];
  if (!weakest.metric.total) return null;
  return {
    ...weakest,
    ratio: ratio(weakest.metric),
  };
}

function ratio(metric) {
  if (!metric.total) return 1;
  return metric.correct / metric.total;
}

function drawCanvasBackground(targetCtx, width, height) {
  targetCtx.clearRect(0, 0, width, height);
  // Dark magical background
  const gradient = targetCtx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(16, 12, 36, 0.97)");
  gradient.addColorStop(1, "rgba(10, 8, 25, 0.95)");
  targetCtx.fillStyle = gradient;
  targetCtx.fillRect(0, 0, width, height);

  // Subtle star grid - one single path for performance
  targetCtx.save();
  targetCtx.strokeStyle = "rgba(100, 70, 180, 0.08)";
  targetCtx.lineWidth = 1;
  targetCtx.beginPath();
  for (let x = 0; x <= width; x += 50) {
    targetCtx.moveTo(x, 0);
    targetCtx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += 50) {
    targetCtx.moveTo(0, y);
    targetCtx.lineTo(width, y);
  }
  targetCtx.stroke();
  targetCtx.restore();
}

function drawShape(targetCtx, render, strokeStyle) {
  const points = render.scaledPoints;
  targetCtx.save();
  targetCtx.strokeStyle = strokeStyle;
  targetCtx.lineWidth = 4;
  // Glow effect for the shape
  targetCtx.shadowColor = "rgba(168, 85, 247, 0.4)";
  targetCtx.shadowBlur = 8;
  targetCtx.beginPath();
  targetCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    targetCtx.lineTo(points[i].x, points[i].y);
  }
  targetCtx.closePath();
  targetCtx.stroke();
  targetCtx.shadowBlur = 0;

  // Fill with semi-transparent color
  targetCtx.fillStyle = "rgba(80, 50, 150, 0.08)";
  targetCtx.fill();

  const labels = ['A', 'B', 'C', 'D'];
  points.forEach((point, i) => {
    targetCtx.beginPath();
    targetCtx.fillStyle = "rgba(200, 180, 255, 0.9)";
    targetCtx.strokeStyle = strokeStyle;
    targetCtx.lineWidth = 2;
    targetCtx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Draw vertex label
    targetCtx.font = "bold 22px 'Cinzel', serif";
    targetCtx.fillStyle = "#fbbf24";
    targetCtx.textAlign = "center";
    targetCtx.textBaseline = "middle";
    targetCtx.shadowBlur = 4;
    targetCtx.shadowColor = "#000";
    
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    let dx = point.x - cx;
    let dy = point.y - cy;
    let dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = 26;
    targetCtx.fillText(labels[i], point.x + (dx / dist) * offset, point.y + (dy / dist) * offset);
    targetCtx.shadowBlur = 0;
  });
  targetCtx.restore();
}

function drawBase(targetCtx, render) {
  if (!render.baseLine) return;
  targetCtx.save();
  targetCtx.strokeStyle = "#7c6aff";
  targetCtx.lineWidth = 7;
  targetCtx.shadowColor = "rgba(100, 80, 255, 0.5)";
  targetCtx.shadowBlur = 10;
  targetCtx.beginPath();
  targetCtx.moveTo(render.baseLine.p1.x, render.baseLine.p1.y);
  targetCtx.lineTo(render.baseLine.p2.x, render.baseLine.p2.y);
  targetCtx.stroke();
  targetCtx.restore();
}

function drawExtension(targetCtx, baseLine) {
  const vector = normalize(subtract(baseLine.p2, baseLine.p1));
  const extensionLength = 160;
  const before = add(baseLine.p1, scale(vector, -extensionLength));
  const after = add(baseLine.p2, scale(vector, extensionLength));
  targetCtx.save();
  targetCtx.setLineDash([10, 8]);
  targetCtx.strokeStyle = "rgba(44, 123, 229, 0.45)";
  targetCtx.lineWidth = 2;
  targetCtx.beginPath();
  targetCtx.moveTo(before.x, before.y);
  targetCtx.lineTo(after.x, after.y);
  targetCtx.stroke();
  targetCtx.restore();
}

function drawCandidateLine(targetCtx, line, selected, revealCorrect) {
  targetCtx.save();
  targetCtx.strokeStyle = revealCorrect ? "#00c878" : selected ? "#f59e0b" : "rgba(168, 100, 255, 0.45)";
  targetCtx.lineWidth = revealCorrect || selected ? 5 : 3;
  if (selected || revealCorrect) {
    targetCtx.shadowColor = revealCorrect ? "rgba(0,200,120,0.5)" : "rgba(245,180,60,0.5)";
    targetCtx.shadowBlur = 10;
  }
  targetCtx.beginPath();
  targetCtx.moveTo(line.p1.x, line.p1.y);
  targetCtx.lineTo(line.p2.x, line.p2.y);
  targetCtx.stroke();
  targetCtx.restore();
}

function drawLine(targetCtx, line, color, width = 4, dashed = false) {
  targetCtx.save();
  if (dashed) {
    targetCtx.setLineDash([12, 8]);
  }
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = width;
  targetCtx.beginPath();
  targetCtx.moveTo(line.p1.x, line.p1.y);
  targetCtx.lineTo(line.p2.x, line.p2.y);
  targetCtx.stroke();
  targetCtx.restore();
}

function drawVertexLabels(targetCtx, points, labels) {
  targetCtx.save();
  targetCtx.fillStyle = "rgba(220, 200, 255, 0.9)";
  targetCtx.font = '700 20px "Alef", sans-serif';
  targetCtx.shadowColor = "rgba(168, 85, 247, 0.5)";
  targetCtx.shadowBlur = 6;
  points.forEach((point, index) => {
    targetCtx.fillText(labels[index], point.x + 12, point.y - 10);
  });
  targetCtx.restore();
}

function drawSideLabels(targetCtx, render) {
  targetCtx.save();
  targetCtx.fillStyle = "rgba(200, 180, 255, 0.75)";
  targetCtx.font = '700 15px "Alef", sans-serif';
  render.sideSegments.forEach((side, index) => {
    const mid = midpoint(side.p1, side.p2);
    targetCtx.fillText(`צלע ${index + 1}`, mid.x + 6, mid.y - 8);
  });
  targetCtx.restore();
}

function drawRightAngleMarker(targetCtx, line, baseLine, color) {
  const intersection = projectPointOntoLine(line.p1, baseLine.p1, baseLine.p2);
  const baseDir = normalize(subtract(baseLine.p2, baseLine.p1));
  const lineDir = normalize(subtract(line.p1, line.p2));
  const size = 18;
  const p1 = intersection;
  const p2 = add(p1, scale(baseDir, size));
  const p3 = add(p2, scale(lineDir, size));
  const p4 = add(p1, scale(lineDir, size));
  targetCtx.save();
  targetCtx.strokeStyle = color;
  targetCtx.lineWidth = 3;
  targetCtx.beginPath();
  targetCtx.moveTo(p1.x, p1.y);
  targetCtx.lineTo(p2.x, p2.y);
  targetCtx.lineTo(p3.x, p3.y);
  targetCtx.lineTo(p4.x, p4.y);
  targetCtx.stroke();
  targetCtx.restore();
}

function drawSideHighlight(targetCtx, side) {
  targetCtx.save();
  targetCtx.strokeStyle = "#ff9f43";
  targetCtx.lineWidth = 7;
  targetCtx.beginPath();
  targetCtx.moveTo(side.p1.x, side.p1.y);
  targetCtx.lineTo(side.p2.x, side.p2.y);
  targetCtx.stroke();
  targetCtx.restore();
}

function getCanvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function nearestVertexIndex(point, scaledPoints) {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  scaledPoints.forEach((vertex, index) => {
    const currentDistance = distance(point, vertex);
    if (currentDistance < bestDistance) {
      bestDistance = currentDistance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function hitTestVertices(point, scaledPoints) {
  return scaledPoints.findIndex((vertex) => distance(point, vertex) <= 18);
}

function hitTestSegments(point, segments) {
  let found = -1;
  segments.forEach((segment, index) => {
    if (distancePointToSegment(point, segment.p1, segment.p2) <= 16 && found === -1) {
      found = index;
    }
  });
  return found;
}

function pointOnSegment(point, a, b) {
  const minX = Math.min(a.x, b.x) - 0.1;
  const maxX = Math.max(a.x, b.x) + 0.1;
  const minY = Math.min(a.y, b.y) - 0.1;
  const maxY = Math.max(a.y, b.y) + 0.1;
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

function projectPointOntoLine(point, a, b) {
  const ab = subtract(b, a);
  const ap = subtract(point, a);
  const t = dot(ap, ab) / dot(ab, ab);
  return add(a, scale(ab, t));
}

function clampToSegment(point, a, b) {
  const ab = subtract(b, a);
  const ap = subtract(point, a);
  const t = Math.max(0, Math.min(1, dot(ap, ab) / dot(ab, ab)));
  return add(a, scale(ab, t));
}

function projectPointFromVertex(vertex, a, b) {
  return projectPointOntoLine(vertex, a, b);
}

function distancePointToSegment(point, a, b) {
  return distance(point, clampToSegment(point, a, b));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function evaluateReasonInput(question, value) {
  const normalized = value.trim().toLowerCase();
  const matches = question.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
  return matches.length >= (question.minKeywordMatches || 2);
}

function detectMistakePattern(question) {
  if (!question) return null;

  if (question.kind === "draw-altitude" && appState.studentLine && appState.currentRender) {
    const render = appState.currentRender;
    const projected = projectPointOntoLine(appState.studentLine.to, render.baseLine.p1, render.baseLine.p2);
    const angleDiff = perpendicularDifference(render.baseLine, {
      p1: render.scaledPoints[appState.studentLine.fromIndex],
      p2: appState.studentLine.to,
    });
    if (appState.studentLine.fromIndex !== question.vertexIndex) return "vertex";
    if (!question.allowExtension && !pointOnSegment(projected, render.baseLine.p1, render.baseLine.p2)) return "extension";
    if (angleDiff > DRAW_TOLERANCE_BY_STAGE[appState.stageIndex]) return "perpendicular";
    return "base";
  }

  if (question.kind === "select-altitude" && appState.selectedCandidate !== null) {
    const candidate = question.candidates[appState.selectedCandidate];
    return candidate?.mistakeType || "base";
  }

  if (question.kind === "reverse-base") return "base";
  if (question.kind === "reason-text") return "explanation";
  if (question.kind === "fix-mistake" || question.kind === "choice") {
    const text = question.options?.[appState.selectedChoice] || "";
    if (text.includes("קודקוד")) return "vertex";
    if (text.includes("מאונ")) return "perpendicular";
    if (text.includes("בסיס")) return "base";
    if (text.includes("המשך")) return "extension";
    return "explanation";
  }

  return null;
}

function registerMistakePattern(pattern) {
  if (!pattern) return;
  if (!appState.progress.stats.mistakePatterns[pattern] && appState.progress.stats.mistakePatterns[pattern] !== 0) return;
  appState.progress.stats.mistakePatterns[pattern] += 1;
}

function getAdaptiveCoachMessage(pattern) {
  const patterns = appState.progress.stats.mistakePatterns || {};
  const repeated = pattern && patterns[pattern] >= 2;

  if (pattern === "vertex") {
    return repeated
      ? "זו כבר טעות חוזרת: קודם מסמנים את הבסיס, ואז מחפשים רק את הקודקוד שמולו."
      : "בדוק שוב מאיזה קודקוד צריך לצאת. גובה לא מתחיל על הבסיס עצמו.";
  }
  if (pattern === "perpendicular") {
    return repeated
      ? "זו טעות שחוזרת: אל תבדוק אם הקו ישר למסך. בדוק אם הוא יוצר 90° עם הבסיס הכחול."
      : "הקו צריך להיות מאונך לבסיס הכחול, לא רק להיראות נכון.";
  }
  if (pattern === "extension") {
    return repeated
      ? "כאן שוב צריך לזכור את המשך הצלע. במשולש קהה לפעמים הגובה פוגש את ההמשך ולא את הצלע עצמה."
      : "נסה לבדוק אם צריך להמשיך את הצלע הכחולה כדי לפגוש את הגובה.";
  }
  if (pattern === "base") {
    return repeated
      ? "זו כבר הפעם השנייה שהבסיס מתבלבל. לפני כל תשובה אמור לעצמך: מהו הבסיס בשאלה הזאת?"
      : "התחל מהשאלה: לאיזה בסיס שייך הגובה?";
  }
  if (pattern === "explanation") {
    return repeated
      ? "בהסבר שלך חסר עדיין כלל מתמטי. נסה להזכיר במפורש שניים מהמילים: בסיס, קודקוד, מאונך, המשך."
      : "בהסבר טוב כדאי להזכיר לפחות שני תנאים: בסיס, קודקוד, מאונך או המשך צלע.";
  }

  return "";
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function scale(vector, factor) {
  return { x: vector.x * factor, y: vector.y * factor };
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function normalize(vector) {
  const len = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / len, y: vector.y / len };
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function lerpPoint(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function perpendicularDifference(baseLine, studentLine) {
  const base = subtract(baseLine.p2, baseLine.p1);
  const line = subtract(studentLine.p2, studentLine.p1);
  const angle = angleBetween(base, line);
  return Math.abs(90 - angle);
}

function angleBetween(a, b) {
  const denominator = Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y) || 1;
  const cosine = Math.max(-1, Math.min(1, dot(a, b) / denominator));
  return (Math.acos(cosine) * 180) / Math.PI;
}

function oppositeVerticesForParallelogram(baseSide) {
  const mapping = {
    0: [3, 2],
    1: [0, 3],
    2: [1, 0],
    3: [2, 1],
  };
  return mapping[baseSide];
}


function trueFalseQ(config) {
  return {
    id: nextId(),
    kind: 'true-false',
    category: 'reason',
    options: ['✨ אמת (מגן פטרונוס)', '☠️ שקר (אבדה קדברה)'],
    successText: 'הלחש עבד! זיהית את האמת מתחת לקונספירציות.',
    errorText: 'הקסם האפל הכשיל אותך. קרא את המשפט שוב.',
    ...config,
  };
}

function makeShape(id, kind, labels, points) {
  const sides = kind === "triangle" ? [[0, 1], [1, 2], [2, 0]] : [[0, 1], [1, 2], [2, 3], [3, 0]];
  return { id, kind, labels, points, sides };
}

function nextId() {
  return appState.questionIdCounter++;
}

function selectQ(config) {
  const { shape, baseSide, vertexIndex, allowExtension = false, prompt, story, coach, hintText, category = "identify", distractors } = config;
  const candidates = buildAltitudeCandidates(shape, baseSide, vertexIndex, distractors);
  return {
    id: nextId(),
    kind: "select-altitude",
    category,
    shape,
    baseSide,
    vertexIndex,
    allowExtension,
    prompt,
    story,
    coach,
    hintText,
    candidates: candidates.lines,
    correctIndex: candidates.correctIndex,
    successText: "זיהית את הגובה הנכון. הוא יוצא מהקודקוד המתאים ופוגש את הבסיס בזווית ישרה.",
    errorText: "הקטע שנבחר דומה לגובה, אבל חסר בו תנאי חשוב של קודקוד או של מאונך.",
    ruleText: "גובה יוצא מקודקוד ומאונך לבסיס או להמשך שלו.",
  };
}

function drawQ(config) {
  return {
    id: nextId(),
    kind: "draw-altitude",
    category: "draw",
    successText: "הגובה שורטט נכון. יצאת מהקודקוד המתאים והגעת לבסיס בזווית ישרה.",
    errorText: "השרטוט עדיין לא מדויק. בדוק מאיזה קודקוד צריך לצאת, והאם הקו באמת מאונך לבסיס.",
    ruleText: "בשרטוט גובה בודקים גם קודקוד נכון וגם זווית ישרה לבסיס.",
    ...config,
  };
}

function reverseQ(config) {
  const shownLine = { fromIndex: config.vertexIndex, toProjection: { side: config.baseSide } };
  return {
    id: nextId(),
    kind: "reverse-base",
    category: "reason",
    shownLine,
    correctSide: config.baseSide,
    successText: "נכון. הגובה האדום שייך בדיוק לצלע שבחרת.",
    errorText: "הגובה נראה נכון, אבל הוא שייך לבסיס אחר. צריך לבדוק לאיזו צלע הוא מאונך.",
    ruleText: "גובה תמיד מוגדר ביחס לבסיס מסוים.",
    ...config,
  };
}

function choiceQ(config) {
  return {
    id: nextId(),
    kind: "choice",
    category: config.category || "reason",
    successText: config.successText || "נכון. בחרת את ההסבר המדויק.",
    errorText: config.errorText || "לא זה ההסבר המדויק ביותר. הסתכל שוב על הקודקוד, הבסיס והמאונך.",
    ruleText: config.ruleText || "כדי לקבוע אם זה גובה בודקים קודקוד, בסיס ומאונך.",
    ...config,
  };
}

function reasonTextQ(config) {
  return {
    id: nextId(),
    kind: "reason-text",
    category: "reason",
    successText: config.successText || "ההסבר שלך כולל את הרעיונות החשובים.",
    errorText: config.errorText || "בהסבר עדיין חסר תנאי מרכזי. נסה להזכיר קודקוד, בסיס או מאונך.",
    ruleText: config.ruleText || "בהסבר טוב על גובה מזכירים לפחות שני תנאים חשובים: קודקוד, בסיס, מאונך, המשך צלע.",
    minKeywordMatches: config.minKeywordMatches || 2,
    ...config,
  };
}

function fixQ(config) {
  return {
    id: nextId(),
    kind: "fix-mistake",
    category: "reason",
    successText: "נכון. זיהית בדיוק מה הטעות של דני.",
    errorText: "זו לא הטעות המרכזית. חפש מה תנאי הגובה שלא מתקיים.",
    ruleText: "בשאלות תיקון טעות מחפשים איזה תנאי של גובה נשבר.",
    ...config,
  };
}

function buildAltitudeCandidates(shape, baseSide, vertexIndex, distractors = ["notPerp", "wrongVertex", "wrongBase"]) {
  const correct = { fromIndex: vertexIndex, toProjection: { side: baseSide }, mistakeType: "correct" };
  const others = distractors.map((type) => buildDistractor(shape, baseSide, vertexIndex, type));
  const lines = [correct, ...others];
  const shuffled = shuffleWithIndex(lines);
  return { lines: shuffled.items, correctIndex: shuffled.correctIndex };
}

function buildDistractor(shape, baseSide, vertexIndex, type) {
  const sides = shape.sides;
  const base = sides[baseSide];
  const otherVertex = shape.kind === "triangle"
    ? [0, 1, 2].find((index) => index !== base[0] && index !== base[1] && index !== vertexIndex) ?? ((vertexIndex + 1) % shape.points.length)
    : (vertexIndex + 1) % shape.points.length;

  if (type === "wrongVertex") {
    return { fromIndex: otherVertex, toProjection: { side: baseSide }, mistakeType: "vertex" };
  }
  if (type === "wrongBase") {
    const alternativeSide = sides.findIndex((_, index) => index !== baseSide);
    return { fromIndex: vertexIndex, toProjection: { side: alternativeSide }, mistakeType: "base" };
  }
  if (type === "toEndpoint") {
    return { fromIndex: vertexIndex, toIndex: base[0], mistakeType: "base" };
  }
  const sideT = 0.32;
  return { fromIndex: vertexIndex, toSide: baseSide, sideT, mistakeType: "perpendicular" };
}

function shuffleWithIndex(items) {
  const wrapped = items.map((item, index) => ({ item, index }));
  for (let i = wrapped.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrapped[i], wrapped[j]] = [wrapped[j], wrapped[i]];
  }
  return {
    items: wrapped.map((entry) => entry.item),
    correctIndex: wrapped.findIndex((entry) => entry.index === 0),
  };
}

function buildChallengeQuestions(stageIndex) {
  const stage = STAGES[stageIndex];
  return stage.buildQuestions(false).filter((question) => question.kind !== "draw-altitude").slice(0, 3);
}

function buildStageQuestionSet(stage, stageIndex, skipWarmup) {
  const baseQuestions = stage.buildQuestions(skipWarmup);
  const booster = appState.progress.pendingBooster?.stageIndex === stageIndex
    ? buildBoosterQuestions(appState.progress.pendingBooster.category, stageIndex)
    : [];

  if (!booster.length) {
    return baseQuestions;
  }

  appState.progress.pendingBooster = null;
  return [...booster, ...baseQuestions.slice(booster.length)];
}

function buildBoosterQuestions(category, stageIndex) {
  const isParallelogramStage = stageIndex >= 6;
  if (category === "draw") {
    return isParallelogramStage
      ? [
          drawQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "חיזוק מהיר: שרטט גובה לבסיס הכחול.", story: "לפני השלב הבא מחזקים שרטוט אחד מדויק.", coach: "במקבילית בודקים מאונך לבסיס, לא למסך." }),
          drawQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "חיזוק מהיר: שרטט גובה נוסף לבסיס הכחול.", story: "עוד שרטוט אחד כדי לייצב את היד." }),
        ]
      : [
          drawQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "חיזוק מהיר: שרטט גובה לבסיס הכחול.", story: "לפני השלב הבא מחזקים שרטוט אחד מדויק." }),
          drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "חיזוק מהיר: שרטט גובה גם אם צריך המשך צלע.", story: "עוד שרטוט אחד עם תשומת לב להמשך הצלע." }),
        ];
  }

  if (category === "reason") {
    return isParallelogramStage
      ? [
          reasonTextQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "חיזוק מהיר: כתוב בקצרה למה הקטע האדום הוא גובה.", story: "לפני שממשיכים, מנסחים את הכלל במילים.", shownLine: { fromIndex: 3, toProjection: { side: 0 } }, showRightAngle: true, keywords: ["מאונך", "בסיס", "מקביל"], minKeywordMatches: 2 }),
          fixQ({ shape: SHAPES.paraC, baseSide: 0, vertexIndex: 3, prompt: "חיזוק מהיר: דני בחר צלע נטויה. מה הטעות?", shownLine: { fromIndex: 3, toIndex: 2 }, options: ["היא לא מאונכת לבסיס", "היא קצרה מדי", "אין טעות"], correctIndex: 0 }),
        ]
      : [
          reasonTextQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "חיזוק מהיר: כתוב בקצרה למה הקטע האדום הוא גובה.", story: "לפני שממשיכים, מנסחים את הכלל במילים.", shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, keywords: ["קודקוד", "מאונך", "בסיס"], minKeywordMatches: 2 }),
          fixQ({ shape: SHAPES.triangleB, baseSide: 1, vertexIndex: 0, prompt: "חיזוק מהיר: דני יצא מהקודקוד הלא נכון. מה הטעות?", shownLine: { fromIndex: 2, toProjection: { side: 1 } }, options: ["הוא יצא מהקודקוד הלא נכון", "הקו קצר מדי", "אין טעות"], correctIndex: 0 }),
        ];
  }

  return isParallelogramStage
    ? [
        selectQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "חיזוק מהיר: בחר את הגובה במקבילית.", story: "בודקים מחדש את זיהוי הגובה." }),
        reverseQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "חיזוק מהיר: לאיזו צלע שייך הגובה האדום?" }),
      ]
    : [
        selectQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "חיזוק מהיר: בחר את הגובה במשולש.", story: "בודקים מחדש את זיהוי הגובה." }),
        reverseQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "חיזוק מהיר: לאיזו צלע שייך הגובה האדום?" }),
      ];
}

function buildStages() {
  return [
    // ─────────────────────────────────────────────
    // שלב 1: מהו גובה – הגדרה מדויקת
    // ─────────────────────────────────────────────
    {
      title: "מהו גובה – הגדרה מדויקת",
      family: "triangle",
      icon: "⚡",
      goal: "לזהות גובה לפי שלושת התנאים המלאים שלו.",
      story: "דמבלדור מסר: 'רק מי שמכיר את שלושת תנאיו של הגובה יוכל לתקן את הגשר.'",
      coach: "שלושה תנאים: קודקוד, מאונך, בסיס – כולם יחד!",
      buildQuestions: (skipWarmup) => {
        const warmup = [
          selectQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "ארבעה קטעים מצוירים – שניים כמעט ניצבים. רק אחד עומד בשלושת התנאים. זהה אותו.", distractors: ["notPerp", "notPerp", "wrongVertex"] }),
          selectQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "המשולש מסובב. הבסיס הכחול לא בתחתית. בחר את הגובה הנכון.", distractors: ["notPerp", "wrongVertex", "toEndpoint"] }),
        ];
        const main = [
          choiceQ({ shape: SHAPES.triangleB, baseSide: 1, vertexIndex: 0, prompt: "הקו יוצא מהקודקוד הנכון, נראה ישר ומגיע לבסיס. דני טוען שזה גובה. מה דעתך?", options: ["לא גובה – הוא לא מאונך לבסיס בדיוק 90°", "כן גובה – הוא יוצא מהקודקוד ונוגע בבסיס", "כן גובה – הוא הקצר מבין כל הקווים מאותו קודקוד"], correctIndex: 0, shownLine: { fromIndex: 0, toSide: 1, sideT: 0.18 }, ruleText: "גובה חייב לקיים שני תנאים יחד: לצאת מהקודקוד וגם ליצור 90° עם הבסיס." }),
          reasonTextQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "כתוב את שלושת התנאים שצריכים להתקיים כדי שקטע יהיה גובה במשולש.", keywords: ["קודקוד", "מאונך", "בסיס"], minKeywordMatches: 3, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "תנאי 1: יוצא מ... | תנאי 2: מאונך ל... | תנאי 3: בסיס הוא..." }),
          selectQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "שלושה קטעים יוצאים מהקודקוד אל הבסיס – שניים נראים כמעט ניצבים. איזה הוא ניצב בדיוק?", distractors: ["notPerp", "notPerp", "wrongVertex"] }),
          drawQ({ shape: SHAPES.triangleB, baseSide: 1, vertexIndex: 0, prompt: "שרטט גובה לצלע הכחולה. הטולרנס הוא 7° בלבד!", coach: "זווית של 90° בדיוק. אם הסימן הירוק לא מופיע – הזווית עדיין לא מדויקת." }),
          reverseQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "הגובה האדום מסומן. לאיזו צלע הוא שייך? (המשולש מסובב – הבסיס לא למטה!)" }),
          fixQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "הקו יוצא מהקודקוד הנכון, נוגע בבסיס ויוצר זווית של 82°. דני: 'זה גובה בערך'. מה הטעות המדויקת?", shownLine: { fromIndex: 2, toSide: 0, sideT: 0.35 }, options: ["82° לא מספיק – נדרש בדיוק 90°", "הוא היה צריך לצאת מקודקוד אחר", "הוא היה צריך לפגוש בדיוק את קצה הבסיס"], correctIndex: 0, ruleText: "מאונך = בדיוק 90°. כל סטייה פוסלת את הגובה." }),
          selectQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "במשולש ישר זווית: הצלע הניצבת יכולה להיות גובה – אבל רק לאיזה בסיס? בחר נכון.", distractors: ["notPerp", "wrongBase", "wrongVertex"] }),
          drawQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "המשולש מסובב – שרטט גובה. אל תסמוך על עיניך: בדוק את הזווית מול הבסיס הכחול!", coach: "הבסיס הכחול הוא הקנה מידה, לא המסך." }),
          reasonTextQ({ shape: SHAPES.triangleRotated, baseSide: 1, vertexIndex: 0, prompt: "הקטע האדום יוצא מהקודקוד הנכון ונוגע בבסיס – אבל הוא לא גובה. ציין בדיוק איזה תנאי חסר.", keywords: ["לא", "מאונך", "90"], minKeywordMatches: 2, shownLine: { fromIndex: 0, toSide: 1, sideT: 0.22 }, placeholder: "חסר תנאי: ..." }),
          reverseQ({ shape: SHAPES.triangleB, baseSide: 2, vertexIndex: 1, prompt: "לאיזו צלע שייך הגובה האדום? (שלוש צלעות – בחר את הנכונה בלבד)" }),
        ];
        return skipWarmup ? main : [...warmup, ...main.slice(0, 8)];
      },
    },

    // ─────────────────────────────────────────────
    // שלב 2: גובה מול קווים מבלבלים
    // ─────────────────────────────────────────────
    {
      title: "גובה מול קווים מבלבלים",
      family: "triangle",
      icon: "🧙",
      goal: "להבדיל בין גובה לבין קו שנראה דומה אך לא עומד בכלל.",
      story: "פרופ' מקגונאגל מציגה ארבעה קווים – רק אחד הוא גובה אמיתי. שגיאה = נקודה לסלית'רין!",
      coach: "אל תסמוך על מראה עיניין – בדוק 90° מול הבסיס.",
      buildQuestions: () => [
        selectQ({ shape: SHAPES.triangleRotated, baseSide: 1, vertexIndex: 0, prompt: "שלושה קטעים מובאים – שניים נראים כמעט ניצבים לבסיס הכחול. רק אחד הוא 90° בדיוק. בחר אותו.", distractors: ["notPerp", "notPerp", "wrongVertex"] }),
        choiceQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "הקו יוצא מהקודקוד ונראה 'כמעט אנכי'. לכן דני בחר אותו כגובה. מה הבעיה בהיגיון של דני?", options: ["הוא הסתמך על מראה ולא בדק זווית מול הבסיס", "הוא לא מדד את אורך הקו", "הוא בחר את הקו הלא-ישיר ביותר"], correctIndex: 0, shownLine: { fromIndex: 2, toSide: 0, sideT: 0.12 }, ruleText: "הקו הקצר ביותר מנקודה לישר הוא המאונך – וזה בדיוק הגובה." }),
        selectQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "⚠️ משולש קהה: הגובה פוגע ב-המשך הצלע, לא בצלע עצמה. בחר נכון.", story: "במשולש קהה הגובה נחתך מחוץ לצורה.", distractors: ["wrongVertex", "notPerp", "toEndpoint"] }),
        reasonTextQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "הקו האדום יוצא מהקודקוד ונוגע בבסיס – חסר בו תנאי אחד. כתוב: (1) מה חסר (2) מדוע זה חשוב.", keywords: ["מאונך", "90", "ניצב"], minKeywordMatches: 2, shownLine: { fromIndex: 1, toSide: 2, sideT: 0.15 }, placeholder: "חסר: ... | חשוב כי: ..." }),
        drawQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה. אזהרה: הבסיס מוטה – אל תשרטט אנכי לפי המסך!", coach: "הצלע הכחולה היא הבסיס. בדוק 90° מולה, לא מול הרצפה." }),
        reverseQ({ shape: SHAPES.triangleA, baseSide: 2, vertexIndex: 1, prompt: "הגובה האדום – לאיזו צלע שייך? שים לב: לא תמיד הצלע שנראית 'אופקית'!" }),
        fixQ({ shape: SHAPES.triangleB, baseSide: 1, vertexIndex: 0, prompt: "דני שרטט קו שאכן מאונך לבסיס בדיוק. עדיין יש טעות בסיסית. מה היא?", shownLine: { fromIndex: 2, toProjection: { side: 1 } }, options: ["הוא יצא מהקודקוד הלא נכון – לא מהקודקוד שמול הבסיס", "הקו לא מאונך לבסיס", "הגובה צריך להיות קצר יותר"], correctIndex: 0, ruleText: "גובה חייב לצאת מהקודקוד שמול הבסיס הנתון. קו מאונך ממקום אחר אינו גובה!" }),
        choiceQ({ shape: SHAPES.triangleA, baseSide: 1, vertexIndex: 0, prompt: "מדוע הגובה הוא דווקא הקו המאונך ולא כל קו אחר מהקודקוד לבסיס?", options: ["כי הקו המאונך הוא הקצר ביותר מהקודקוד לישר הבסיס", "כי הקו המאונך תמיד עובר דרך מרכז הבסיס", "כי כך הוגדר בלי סיבה מתמטית"], correctIndex: 0, shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true, ruleText: "הגובה = הקצר ביותר = המאונך. שלושה שמות לאותו הדבר!" }),
        selectQ({ shape: SHAPES.rightTriangleB, baseSide: 1, vertexIndex: 0, prompt: "במשולש ישר זווית – בחר את הגובה לבסיס הכחול.", distractors: ["notPerp", "wrongBase", "toEndpoint"] }),
        drawQ({ shape: SHAPES.obtuseTriangleB, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "⚠️ משולש קהה! שרטט גובה – ייתכן שתצטרך להמשיך את הצלע מחוץ למשולש.", coach: "אם הגובה יוצא מחוץ למשולש – זה נורמלי. שרטט עד שתגיע ל-90°." }),
      ],
    },

    // ─────────────────────────────────────────────
    // שלב 3: שרטוט מדויק
    // ─────────────────────────────────────────────
    {
      title: "שרטוט מדויק – 90° בדיוק",
      family: "triangle",
      icon: "🪄",
      goal: "לצייר גובה מדויק בצורות שונות ובכיוונים שונים.",
      story: "קסם נכון מחייב דיוק פרפקט. שגיאה של 6° = הגשר קורס שוב.",
      coach: "צא מהקודקוד הנכון והישאר נאמן ל-90° מול הבסיס הכחול.",
      buildQuestions: () => [
        drawQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה לבסיס הכחול. הטולרנס הוא 7° בלבד.", coach: "צא מהקודקוד הקיצוני. מאונך = 90°." }),
        drawQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "המשולש מסובב – שרטט גובה מדויק. אל תבדוק מול אנכי המסך!", coach: "אל תתבלבל עם כיוון המסך. בדוק מול הבסיס הכחול בלבד." }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "⚠️ משולש קהה! שרטט גובה – הגובה עשוי לנחות מחוץ לצלע עצמה.", coach: "המשך את הצלע הכחולה בדמיונך. הגובה פוגש את הישר הזה." }),
        selectQ({ shape: SHAPES.obtuseTriangleB, baseSide: 1, vertexIndex: 0, allowExtension: true, prompt: "⚠️ משולש קהה – הגובה יוצא מחוץ לצורה. בחר נכון.", distractors: ["notPerp", "notPerp", "wrongVertex"] }),
        reverseQ({ shape: SHAPES.triangleB, baseSide: 2, vertexIndex: 1, prompt: "לאיזו צלע שייך הגובה האדום? (משולש לא רגיל – בחן כל צלע)" }),
        reasonTextQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "הקו האדום יוצא מהקודקוד הנכון אך לא נחשב גובה. כתוב: (1) מה חסר (2) איך לתקן.", keywords: ["מאונך", "לא", "90"], minKeywordMatches: 2, shownLine: { fromIndex: 2, toSide: 0, sideT: 0.4 }, placeholder: "חסר: ... | תיקון: ..." }),
        drawQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה לבסיס הכחול. שים לב לפינה החדה.", coach: "הפינה הקטנה מסייעת להבין צירת 90°." }),
        fixQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "דני שרטט קו אנכי לפי המסך – אך המשולש מסובב. מה הבעיה המדויקת?", shownLine: { fromIndex: 2, toSide: 0, sideT: 0.18 }, options: ["הוא בדק 90° מול המסך ולא מול הבסיס הכחול", "הוא יצא מקודקוד לא נכון", "הוא היה צריך לצייר קו קצר יותר"], correctIndex: 0 }),
        selectQ({ shape: SHAPES.rightTriangleA, baseSide: 0, vertexIndex: 2, prompt: "במשולש ישר זווית – לאיזה בסיס שייך הגובה הנוכחי? בחר את הצלע הנכונה.", distractors: ["notPerp", "wrongBase", "wrongVertex"] }),
        drawQ({ shape: SHAPES.triangleRotated, baseSide: 1, vertexIndex: 0, prompt: "גובה אחרון לשלב – המשולש מסובב בכוון לא רגיל. שים לב לכיוון הבסיס הכחול!", coach: "איזו צלע כחולה? מי הקודקוד שמולה? צא ממנו." }),
      ],
    },

    // ─────────────────────────────────────────────
    // שלב 4: משולש ישר זווית – מקרים מיוחדים
    // ─────────────────────────────────────────────
    {
      title: "משולש ישר זווית – מקרים מיוחדים",
      family: "triangle",
      icon: "📚",
      goal: "להבין מתי צלע של משולש ישר זווית היא גם גובה שלו.",
      story: "בחדר הלחשים גילו: במשולש ישר זווית יש גובה שמסתתר בצלע עצמה!",
      coach: "במשולש ישר זווית, שתי הצלעות הניצבות הן גובה אחת לשנייה.",
      buildQuestions: () => [
        choiceQ({ shape: SHAPES.rightTriangleA, baseSide: 0, vertexIndex: 2, prompt: "במשולש ישר זווית – הצלע הניצבת היא גם גובה. לאיזה בסיס?", options: ["לצלע הניצבת השנייה (לא להיפוטנוזה)", "לכל בסיס שרוצים", "להיפוטנוזה בלבד"], correctIndex: 0, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "כל אחת מהצלעות הניצבות היא גובה לרעותה." }),
        selectQ({ shape: SHAPES.rightTriangleA, baseSide: 1, vertexIndex: 0, prompt: "בחר את הגובה לצלע הניצבת הכחולה. (רמז: זה קל יותר ממה שנדמה)", distractors: ["notPerp", "wrongBase", "toEndpoint"] }),
        reasonTextQ({ shape: SHAPES.rightTriangleA, baseSide: 0, vertexIndex: 2, prompt: "הסבר: במשולש ישר זווית – מדוע הצלע הניצבת יכולה לשמש כגובה?", keywords: ["מאונך", "ניצבת", "90"], minKeywordMatches: 2, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "כי הצלע הניצבת יוצרת 90° עם..." }),
        choiceQ({ shape: SHAPES.rightTriangleB, baseSide: 2, vertexIndex: 0, prompt: "כמה גבהים שונים יש לכל משולש (כולל ישר זווית)?", options: ["3 גבהים – אחד מכל קודקוד", "1 גובה בלבד – הגבוה ביותר", "2 גבהים – אחד מכל קצה"], correctIndex: 0, shownLine: { fromIndex: 0, toProjection: { side: 2 } }, showRightAngle: true, ruleText: "כל משולש בעל 3 קודקודים → 3 גבהים שונים (אחד לכל בסיס)." }),
        drawQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "שרטט את הגובה מהזווית הישרה (צמת) אל ההיפוטנוזה הכחולה.", coach: "הגובה מהזווית הישרה להיפוטנוזה הוא לא הצלע עצמה!" }),
        fixQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "דני טוען: 'במשולש ישר זווית יש רק שניים גבהים'. מה טעותו?", shownLine: { fromIndex: 1, toProjection: { side: 2 } }, options: ["יש 3 גבהים – אחד מכל קודקוד, לא רק מהזווית הישרה", "יש גובה אחד בלבד – מהזווית הישרה", "הוא צודק – שני הצלעות הניצבות"], correctIndex: 0, ruleText: "לכל משולש יש בדיוק 3 גבהים." }),
        reverseQ({ shape: SHAPES.rightTriangleB, baseSide: 1, vertexIndex: 0, prompt: "לאיזו צלע שייך הגובה האדום? (שלוש אפשרויות – בחן בזהירות)" }),
        selectQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "בחר את הגובה מהזווית הישרה אל ההיפוטנוזה. (לא הצלעות הניצבות!)", distractors: ["notPerp", "wrongBase", "wrongVertex"] }),
        reasonTextQ({ shape: SHAPES.rightTriangleB, baseSide: 0, vertexIndex: 2, prompt: "כתוב מדוע במשולש ישר זווית, גבוה אחד 'קל' לצייר ואחד 'קשה'. מה ההבדל?", keywords: ["ניצבת", "צלע", "היפוטנוזה"], minKeywordMatches: 2, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "הקל: הצלע הניצבת עצמה... | הקשה: מהזווית הישרה ל..." }),
        drawQ({ shape: SHAPES.rightTriangleB, baseSide: 0, vertexIndex: 2, prompt: "שרטט את הגובה מהקודקוד שאינו על הזווית הישרה, אל הבסיס הכחול.", coach: "בדוק: האם הגובה פוגש את הבסיס בפנים, או שהמשולש קהה?" }),
      ],
    },

    // ─────────────────────────────────────────────
    // שלב 5: משולש קהה זווית – גובה חיצוני
    // ─────────────────────────────────────────────
    {
      title: "משולש קהה – גובה חיצוני",
      family: "triangle",
      icon: "🦉",
      goal: "לזהות ולשרטט גובה שיוצא מחוץ למשולש.",
      story: "פרופ' סנייפ אומר: 'הגובה לא תמיד בתוך המשולש. ודאו שאתם יודעים מתי הוא יוצא'.",
      coach: "במשולש קהה: לפחות שניים מהגבהים יוצאים מחוץ לצורה.",
      buildQuestions: () => [
        choiceQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "הגובה מהקודקוד E יוצא מחוץ למשולש. מה הסיבה?", options: ["כי הזווית בקודקוד E קהה (גדולה מ-90°)", "כי הגובה תמיד יוצא מחוץ למשולש", "כי הבסיס קצר מדי ולכן הגובה ממשיך"], correctIndex: 0, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "כאשר זווית משולש גדולה מ-90°, הגובה המתאים יוצא מחוץ לצורה." }),
        selectQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "⚠️ גובה חיצוני: איזה קטע הוא הגובה הנכון לבסיס הכחול?", distractors: ["wrongVertex", "notPerp", "toEndpoint"] }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "שרטט גובה לבסיס הכחול. הגובה יוצא מחוץ למשולש!", coach: "המשך את הצלע הכחולה בדמיונך. שרטט 90° מולה." }),
        selectQ({ shape: SHAPES.obtuseTriangleB, baseSide: 1, vertexIndex: 0, allowExtension: true, prompt: "⚠️ משולש קהה – בחר את הגובה לבסיס הכחול. ייתכן שהוא מחוץ לצורה.", distractors: ["notPerp", "notPerp", "wrongVertex"] }),
        reasonTextQ({ shape: SHAPES.obtuseTriangleA, baseSide: 2, vertexIndex: 1, prompt: "הסבר: מתי גובה של משולש יוצא מחוץ לצורה? כתוב את הכלל.", keywords: ["קהה", "זווית", "חיצוני"], minKeywordMatches: 2, shownLine: { fromIndex: 1, toProjection: { side: 2 } }, showRightAngle: true, placeholder: "כאשר הזווית... אז הגובה..." }),
        fixQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "דני שרטט גובה שנגמר בגבול המשולש (לא המשיך החוצה). מה הבעיה?", shownLine: { fromIndex: 2, toSide: 0, sideT: 0.5 }, options: ["הגובה חייב להמשיך עד שיפגש את ישר הבסיס (גם מחוץ לצלע)", "הגובה תמיד מסתיים בתוך המשולש", "הוא יצא מקודקוד לא נכון"], correctIndex: 0, ruleText: "הגובה חייב לפגוש את ישר הבסיס – גם אם הנקודה מחוץ לצלע." }),
        drawQ({ shape: SHAPES.obtuseTriangleB, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "שרטט גובה לבסיס הכחול. שים לב: ייתכן שתצטרך להמשיך את הצלע.", coach: "אם שרטטת בתוך המשולש – בדוק שוב אם המשולש קהה." }),
        choiceQ({ shape: SHAPES.obtuseTriangleB, baseSide: 1, vertexIndex: 0, allowExtension: true, prompt: "כמה גבהים 'חיצוניים' (מחוץ לצורה) יש למשולש קהה?", options: ["שניים – מהקודקודים שמול הצלעות ה'חדות'", "אחד בלבד – מהקודקוד הקהה", "שלושה – כולם חיצוניים"], correctIndex: 0, shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true, ruleText: "במשולש קהה: 2 גבהים חיצוניים, 1 פנימי (מהקודקוד הקהה)." }),
        reverseQ({ shape: SHAPES.obtuseTriangleA, baseSide: 2, vertexIndex: 1, prompt: "הגובה האדום יוצא מחוץ למשולש. לאיזו צלע הוא שייך?" }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 2, vertexIndex: 1, allowExtension: true, prompt: "גובה אחרון: שרטט מהקודקוד הנתון לבסיס הכחול. שים לב לאיזה כיוון הגובה יוצא!", coach: "הגובה הזה אולי יוצא מחוץ למשולש – בדוק." }),
      ],
    },

    // ─────────────────────────────────────────────
    // שלב 6: כמה גבהים יש? – בחירת בסיס
    // ─────────────────────────────────────────────
    {
      title: "3 גבהים לכל משולש – בחירת בסיס",
      family: "triangle",
      icon: "🏰",
      goal: "להבין שלכל משולש 3 גבהים שונים ולדעת לשרטט כל אחד.",
      story: "המגדל האחרון דורש ידיעה שלמה: כל משולש שומר שלושה גבהים – אחד לכל בסיס.",
      coach: "שנה את הבסיס – שנה את הגובה. שלושה בסיסים → שלושה גבהים שונים.",
      buildQuestions: () => [
        choiceQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "כמה גבהים שונים יש לכל משולש?", options: ["3 גבהים – אחד מכל קודקוד לצלע שמולו", "1 גובה – הקטע המאונך הגבוה ביותר", "2 גבהים – מכל קצה של הבסיס"], correctIndex: 0, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "כל משולש בעל 3 קודקודים → 3 גבהים (אחד מכל קודקוד לצלע שמולו)." }),
        drawQ({ shape: SHAPES.triangleA, baseSide: 1, vertexIndex: 0, prompt: "עכשיו הבסיס הוא הצלע השנייה (כחולה). שרטט את הגובה המתאים.", coach: "בסיס שונה = קודקוד שונה = גובה שונה." }),
        drawQ({ shape: SHAPES.triangleA, baseSide: 2, vertexIndex: 1, prompt: "עכשיו הבסיס הוא הצלע השלישית (כחולה). שרטט את הגובה השלישי של אותו משולש.", coach: "זהו הגובה השלישי של אותו משולש – מקודקוד נפרד." }),
        reverseQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "הגובה האדום מסומן – לאיזו מהצלעות הוא שייך? (שים לב למיקום הקודקוד)" }),
        reasonTextQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "הסבר: אם נשנה את הבסיס של המשולש – מה ישתנה ומה לא ישתנה?", keywords: ["גובה", "בסיס", "קודקוד"], minKeywordMatches: 3, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "ישתנה: ... | לא ישתנה: ..." }),
        choiceQ({ shape: SHAPES.triangleB, baseSide: 2, vertexIndex: 1, prompt: "שני משולשים שונים עם אותו בסיס ואותו גובה – מה ניתן לומר על שטחיהם?", options: ["שטחיהם שווים (ב×ג÷2 זהה)", "השטחים שונים כי הצורות שונות", "אי אפשר לדעת בלי למדוד"], correctIndex: 0, shownLine: { fromIndex: 1, toProjection: { side: 2 } }, showRightAngle: true, ruleText: "שטח משולש = (בסיס × גובה) ÷ 2. אותו בסיס ואותו גובה → אותו שטח!" }),
        fixQ({ shape: SHAPES.triangleA, baseSide: 1, vertexIndex: 0, prompt: "דני אומר: 'אם אחליף בסיס, הגובה נשאר אותו קטע'. מה טעותו?", shownLine: { fromIndex: 0, toProjection: { side: 1 } }, options: ["בסיס שונה = גובה שונה מקודקוד שונה", "הגובה אכן זהה לכל בסיס", "הוא צדק – הגובה לא תלוי בבסיס"], correctIndex: 0, ruleText: "עם כל בסיס מתאים גובה ייחודי משלו." }),
        selectQ({ shape: SHAPES.triangleRotated, baseSide: 1, vertexIndex: 0, prompt: "בחר את הגובה לבסיס הכחול. (המשולש מסובב – הבסיס לא בתחתית)", distractors: ["notPerp", "notPerp", "wrongVertex"] }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 1, vertexIndex: 0, allowExtension: true, prompt: "⚠️ משולש קהה: שרטט את הגובה לבסיס הכחול. ייתכן שהגובה חיצוני!", coach: "אם הקודקוד שמחוץ לבסיס 'קהה' – הגובה יצא החוצה." }),
        choiceQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "אם נכפיל את הגובה פי 2 ונשמור אותו בסיס – מה יקרה לשטח המשולש?", options: ["השטח יוכפל פי 2", "השטח יישאר זהה", "השטח יגדל פי 4"], correctIndex: 0, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "שטח = (ב×ג)÷2. כפלנו ג → שטח מוכפל." }),
      ],
    },

    // ─────────────────────────────────────────────
    // שלב 7: גובה במקבילית – מושג חדש
    // ─────────────────────────────────────────────
    {
      title: "גובה במקבילית",
      family: "parallelogram",
      icon: "🌟",
      goal: "לזהות ולשרטט גובה במקבילית לפי הבסיס הנבחר.",
      story: "כנף דרקון שומרת את הגשר – צלעות המקבילית הן הכנפיים, הגובה הוא עמוד השדרה.",
      coach: "גובה במקבילית: מאונך מצלע אחת (או המשכה) אל הצלע המקבילה לה.",
      buildQuestions: () => [
        choiceQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "מדוע הצלע הנטויה של המקבילית אינה יכולה להיות הגובה?", options: ["כי היא לא מאונכת לבסיס – היא נוטה", "כי היא לא נוגעת בבסיס", "כי הגובה חייב לצאת מהזווית הישרה"], correctIndex: 0, shownLine: { fromIndex: 3, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "גובה מקבילית = מאונך מצלע אחת אל הצלע המקבילה." }),
        selectQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "בחר את הגובה הנכון במקבילית לבסיס הכחול.", distractors: ["notPerp", "wrongBase", "toEndpoint"] }),
        drawQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "שרטט גובה במקבילית לבסיס הכחול.", coach: "הגובה יוצא מהצלע המקבילה ומגיע לישר הבסיס בזווית 90°." }),
        reverseQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "הגובה האדום מסומן במקבילית. לאיזו צלע (בסיס) הוא שייך?" }),
        choiceQ({ shape: SHAPES.paraB, baseSide: 1, vertexIndex: 0, prompt: "אם נשנה את הבסיס במקבילית מהצלע האופקית לצלע הנטויה – מה ישתנה?", options: ["הגובה ישתנה – כי הוא מאונך לבסיס החדש", "הגובה יישאר זהה – הגובה הוא רק האורך האנכי", "לא ניתן לקיים גובה לצלע הנטויה"], correctIndex: 0, shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true, ruleText: "שינוי הבסיס = שינוי הגובה. לכל בסיס יש גובה ייחודי." }),
        reasonTextQ({ shape: SHAPES.paraA, baseSide: 2, vertexIndex: 1, prompt: "הסבר מדוע הצלע הנטויה של המקבילית אינה יכולה לשמש כגובה לשום בסיס.", keywords: ["מאונך", "לא", "נטויה"], minKeywordMatches: 2, shownLine: { fromIndex: 1, toProjection: { side: 2 } }, showRightAngle: true, placeholder: "כי הצלע הנטויה..." }),
        fixQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "דני שרטט קו מקביל לצלע הנטויה ואמר שזה הגובה. מה הטעות?", shownLine: { fromIndex: 3, toSide: 0, sideT: 0.3 }, options: ["הוא שרטט קו שאינו מאונך לבסיס – הוא מקביל לצלע", "הגובה צריך לצאת מהקצה של הבסיס", "המקבילית לא בכיוון הנכון"], correctIndex: 0, ruleText: "גובה חייב להיות מאונך לבסיס, לא מקביל לצלע." }),
        drawQ({ shape: SHAPES.paraB, baseSide: 1, vertexIndex: 0, prompt: "בחר בסיס חדש (הצלע הנטויה הכחולה) ושרטט גובה אליה.", coach: "כן, ניתן לבחור את הצלע הנטויה כבסיס! הגובה אז מאונך לה." }),
        selectQ({ shape: SHAPES.paraC, baseSide: 0, vertexIndex: 3, prompt: "מקבילית 'שטוחה' (כמעט שכובה). בחר את הגובה הנכון לבסיס הכחול.", distractors: ["notPerp", "notPerp", "wrongBase"] }),
        drawQ({ shape: SHAPES.paraC, baseSide: 2, vertexIndex: 1, prompt: "שרטט גובה למקבילית נטויה מאוד. הגובה אולי יוצא חוץ מהצלע!", coach: "גם במקבילית יכול הגובה לנחות מחוץ לצלע (על המשכה)." }),
      ],
    },

    // ─────────────────────────────────────────────
    // שלב 8: מקבילית נטויה ומשנה בסיסים
    // ─────────────────────────────────────────────
    {
      title: "מקבילית – שינוי בסיסים וגבהים",
      family: "parallelogram",
      icon: "✨",
      goal: "לשלוט בשני הגבהים של מקבילית לפי שני הבסיסים האפשריים.",
      story: "כנפי הדרקון יכולות לנטות לשני כיוונים – ולכל כיוון יש גובה שונה!",
      coach: "למקבילית שני גבהים: אחד לכל זוג של צלעות מקבילות.",
      buildQuestions: () => [
        choiceQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "כמה גבהים שונים יש למקבילית?", options: ["2 גבהים – אחד לכל זוג צלעות מקבילות", "1 גובה – תמיד האורך האנכי", "4 גבהים – אחד מכל קודקוד"], correctIndex: 0, shownLine: { fromIndex: 3, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "למקבילית 2 גבהים: אחד לכל זוג צלעות מקבילות." }),
        drawQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "שרטט את הגובה הראשון – לצלעות האופקיות (כחולות).", coach: "הגובה מאונך לצלע האופקית." }),
        drawQ({ shape: SHAPES.paraA, baseSide: 1, vertexIndex: 0, prompt: "שרטט את הגובה השני – לצלעות הנטויות (כחולות).", coach: "בסיס שונה → גובה שונה לגמרי. יוצא מהצלע המקבילה." }),
        reverseQ({ shape: SHAPES.paraB, baseSide: 1, vertexIndex: 0, prompt: "הגובה האדום שייך לאיזו צלע? (שתי אפשרויות – בחן שתיהן)" }),
        choiceQ({ shape: SHAPES.paraB, baseSide: 0, vertexIndex: 3, prompt: "אם בסיס המקבילית מוכפל פי 2 ואנחנו שומרים על אותו גובה – מה קורה לשטח?", options: ["השטח מוכפל פי 2 (שטח = ב×ג)", "השטח מוכפל פי 4", "השטח נשאר זהה"], correctIndex: 0, shownLine: { fromIndex: 3, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "שטח מקבילית = בסיס × גובה. בסיס ×2 → שטח ×2." }),
        fixQ({ shape: SHAPES.paraC, baseSide: 0, vertexIndex: 3, prompt: "דני טוען: 'גובה המקבילית = אורך הצלע הנטויה'. מה טעותו?", shownLine: { fromIndex: 3, toSide: 0, sideT: 0.3 }, options: ["הצלע הנטויה ארוכה מהגובה – הגובה הוא הקטע המאונך בלבד", "הוא צודק – הצלע הנטויה היא הגובה", "הגובה שווה לצלע הנטויה רק במקבילית ישרה"], correctIndex: 0, ruleText: "גובה (מאונך) < צלע נטויה תמיד (זה מה שמאפיין גובה)." }),
        reasonTextQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "כתוב: (1) למה הגובה קצר מהצלע הנטויה? (2) מה הגובה מייצג בנוסחת השטח?", keywords: ["מאונך", "שטח", "קצר"], minKeywordMatches: 2, shownLine: { fromIndex: 3, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "קצר כי... | בנוסחה: שטח = ..." }),
        selectQ({ shape: SHAPES.paraC, baseSide: 2, vertexIndex: 1, prompt: "⚠️ מקבילית מאוד נטויה – בחר את הגובה הנכון לבסיס הכחול.", distractors: ["notPerp", "notPerp", "wrongBase"] }),
        drawQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "שרטט גובה לצלע הכחולה (הצלע השמאלית). הגובה עשוי לנחות מחוץ לצלע.", coach: "אפשר שהגובה ינחות על המשך הצלע – זה בסדר גמור במקבילית." }),
        choiceQ({ shape: SHAPES.paraA, baseSide: 1, vertexIndex: 0, prompt: "מקבילית עם בסיס 8 וגובה 5. אם נשנה את הבסיס ל-10 ונשמור אותה מקבילית – מה יהיה הגובה החדש?", options: ["4 (כי שטח = 8×5 = 40, ובסיס חדש: 40÷10 = 4)", "5 – הגובה לא משתנה", "6.25 (כי 50÷8)"], correctIndex: 0, shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true, ruleText: "שטח = ב×ג. שמירת השטח עם בסיס אחר נותנת גובה אחר." }),
      ],
    },

    // ─────────────────────────────────────────────
    // שלב 9: ערבוב – משולש ומקבילית יחד
    // ─────────────────────────────────────────────
    {
      title: "חשיבה מעורבת – משולש ומקבילית",
      family: "triangle",
      icon: "🔮",
      goal: "לעבור במהירות בין כללי גובה במשולש וגובה במקבילית.",
      story: "הבחינה הסופית של הוגוורטס: שאלות ממשולש ומקבילית ערבוביות – בלי אזהרה!",
      coach: "שאל את עצמך: זה משולש או מקבילית? אחר כך, מהו הבסיס?",
      buildQuestions: () => [
        choiceQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "הקו האדום במשולש יוצא מהקודקוד ומגיע לבסיס. הוא מאונך. אך דני אומר שזו גם הצלע. מה נכון?", options: ["הקו הוא גובה – מאונך מהקודקוד לבסיס", "הקו הוא צלע – צלע יכולה להיות גובה", "שניהם נכונים – כל קטע הוא גם צלע וגם גובה"], correctIndex: 0, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "גובה הוא קטע מיוחד, לא בהכרח צלע (אלא בישר זווית)." }),
        choiceQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "מהו ההבדל בין גובה של משולש לגובה של מקבילית (כאשר שניהם לאותו סוג בסיס)?", options: ["גובה מקבילית יוצא מהצלע המקבילה, גובה משולש יוצא מהקודקוד שמולה", "גובה מקבילית ארוך יותר", "אין הבדל – שניהם ניצבים לבסיס"], correctIndex: 0, shownLine: { fromIndex: 3, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "במשולש – מקודקוד לצלע שמולו. במקבילית – מצלע לצלע המקבילה." }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "⚠️ משולש קהה – שרטט גובה חיצוני. זכור: הגובה יוצא מחוץ לצורה.", coach: "המשך את הצלע הכחולה בדמיונך." }),
        drawQ({ shape: SHAPES.paraC, baseSide: 0, vertexIndex: 3, prompt: "שרטט גובה במקבילית הנטויה. הגובה עשוי לנחות מחוץ לצלע!", coach: "אפשרי! במקבילית נטויה יכול הגובה לנחות על המשך הצלע." }),
        fixQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "דני שרטט גובה במקבילית מהקודקוד (כמו במשולש) ולא מהצלע. מה הבעיה?", shownLine: { fromIndex: 3, toProjection: { side: 0 } }, options: ["במקבילית הגובה יכול לצאת מכל נקודה על הצלע המקבילה, לא רק מקודקוד", "במקבילית חייבים לצאת בדיוק מהקודקוד", "אין בעיה – שתי האפשרויות נכונות"], correctIndex: 0, ruleText: "במקבילית – כל נקודה על הצלע המקבילה יכולה להיות תחילת הגובה." }),
        reverseQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "הגובה האדום במקבילית – לאיזו צלע הוא שייך?" }),
        reasonTextQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "כתוב את הנוסחה לשטח משולש ולשטח מקבילית. הסבר מה משותף להן.", keywords: ["גובה", "בסיס", "שטח"], minKeywordMatches: 3, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "שטח משולש = ... | שטח מקבילית = ... | משותף: ..." }),
        selectQ({ shape: SHAPES.triangleRotated, baseSide: 1, vertexIndex: 0, prompt: "משולש מסובב – בחר את הגובה לבסיס הכחול. (אל תתבלבל עם הכיוון)", distractors: ["notPerp", "notPerp", "wrongVertex"] }),
        choiceQ({ shape: SHAPES.paraB, baseSide: 0, vertexIndex: 3, prompt: "מקבילית ומשולש עם אותו בסיס ואותו גובה. מה יחס שטחיהם?", options: ["שטח המקבילית כפול שטח המשולש (ב×ג vs ב×ג÷2)", "שטחיהם שווים", "שטח המשולש כפול שטח המקבילית"], correctIndex: 0, shownLine: { fromIndex: 3, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "מקבילית: ב×ג | משולש: ב×ג÷2 → מקבילית = 2 × משולש." }),
        drawQ({ shape: SHAPES.paraB, baseSide: 1, vertexIndex: 0, prompt: "גובה אחרון: שרטט גובה לצלע הנטויה הכחולה של המקבילית.", coach: "הצלע הנטויה היא הבסיס. הגובה מאונך אליה." }),
      ],
    },

    // ─────────────────────────────────────────────
    // שלב 10: אתגר מסכם – רמת מבחן
    // ─────────────────────────────────────────────
    {
      title: "אתגר מסכם – שאלות מבחן",
      family: "triangle",
      icon: "🏆",
      goal: "להוכיח שליטה מלאה בכל הנושא ברמת מבחן עתידי.",
      story: "הוגוורטס קורא: 'רק מי שיענה נכון על 10 שאלות יקבל ת'ורצ' ממגדל גריפינדור!'",
      coach: "חשוב לפני שעונה. אל תסמוך על האינטואיציה בלבד.",
      buildQuestions: () => [
        reasonTextQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "שאלת מבחן: הגדר גובה במשולש בדיוק, הזכר שלושה תנאים.", keywords: ["קודקוד", "מאונך", "בסיס"], minKeywordMatches: 3, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "גובה הוא קטע היוצא מ... המאונך ל..." }),
        choiceQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "במשולש קהה: לפי איזה כלל הגובה יוצא מחוץ לצורה?", options: ["כשהזווית בקודקוד גדולה מ-90° – הרגל יוצאת מחוץ לצלע", "כשהמשולש גדול מאוד – הגובה יוצא החוצה", "כשהבסיס קצר – הגובה חייב להמשיך"], correctIndex: 0, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, ruleText: "זווית > 90° בקודקוד → הגובה מהקודקוד ההפוך יוצא חוץ." }),
        drawQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "שאלת מבחן: שרטט גובה למשולש מסובב. (הטולרנס 5° בלבד!)", coach: "בדוק 90° ישר מול הבסיס הכחול." }),
        fixQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "דני אמר: 'בכל משולש ישר זווית הגובה = אחת הצלעות הניצבות'. האם זה תמיד נכון?", shownLine: { fromIndex: 1, toProjection: { side: 2 } }, options: ["לא – רק לגובה לצלע הניצבת השנייה. לגובה להיפוטנוזה – זה לא צלע", "כן – תמיד הגובה הוא צלע ניצבת", "כן – בכל מקרה של משולש ישר זווית"], correctIndex: 0, ruleText: "גובה לניצבת השנייה = אותה ניצבת. גובה להיפוטנוזה = קטע פנימי חדש." }),
        reverseQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "שאלת מבחן: הגובה האדום במקבילית – לאיזו צלע הוא שייך? (חשוב לפני שעונה)" }),
        drawQ({ shape: SHAPES.paraC, baseSide: 0, vertexIndex: 3, prompt: "שאלת מבחן: שרטט גובה במקבילית מאוד נטויה. הגובה עשוי לנחות מחוץ לצלע!", coach: "גם במקבילית – גובה חיצוני הוא תקין לגמרי." }),
        reasonTextQ({ shape: SHAPES.obtuseTriangleB, baseSide: 1, vertexIndex: 0, prompt: "שאלת מבחן: הסבר מה 'המשך צלע' ומתי הגובה יוצא עליו. כתוב בשתי שורות.", keywords: ["המשך", "צלע", "קהה"], minKeywordMatches: 2, shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true, placeholder: "המשך צלע הוא... | הגובה יוצא עליו כאשר..." }),
        fixQ({ shape: SHAPES.paraC, baseSide: 2, vertexIndex: 1, prompt: "דני שרטט קו אנכי למסך ואמר שזה הגובה. המקבילית נטויה 45°. מה הבעיה?", shownLine: { fromPoint: { x: 470, y: 150 }, toPoint: { x: 470, y: 420 } }, options: ["הוא לא בדק מאונך לבסיס הנטוי – בדק לפי המסך", "הוא היה צריך קו קצר יותר", "במקבילית נטויה אין גובה"], correctIndex: 0, ruleText: "גובה = מאונך לבסיס הנתון, לא לאנכי כללי." }),
        selectQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "שאלת מבחן: בחר את הגובה המדויק ביותר. (שני דיסטרקטורים כמעט נכונים)", distractors: ["notPerp", "notPerp", "wrongVertex"] }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 2, vertexIndex: 1, allowExtension: true, prompt: "שאלת מבחן אחרונה: שרטט גובה למשולש קהה. ייתכן שיוצא מחוץ לצורה.", coach: "אתה יודע הכל – עכשיו הוכח את זה." }),
      ],
    },
    // ─────────────────────────────────────────────
    // שלב 11: משפטי קסם (שקר/אמת) - משולש
    // ─────────────────────────────────────────────
    {
      title: "משפטי קסם האמת – משולש",
      family: "triangle",
      icon: "✨",
      goal: "לקרוא משפטים מילוליים מורכבים ולהכריע מה נכון לפי חוקי הקסם.",
      story: "במבחן הפטרונוס של פרופ׳ לופין, רק המשפט הנכון יעורר את הלחש.",
      coach: "קרא בעיון. מילה אחת יכולה להפוך אמת לשקר.",
      buildQuestions: () => [
        trueFalseQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "הגובה חייב לפגוע בדיוק באמצע של הבסיס אחרת הוא אינו גובה מתמטי.", correctIndex: 1, ruleText: "שקר אופייני! הגובה אינו משנה למיקומו על הבסיס אלא לזווית (90°)." }),
        trueFalseQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "משולש ישר זווית מכיל בתוכו 2 גבהים שהם למעשה גם הצלעות עצמן.", correctIndex: 0, ruleText: "אמת קסומה. הניצבים מתפקדים כגבהים זה לזה." }),
        trueFalseQ({ shape: SHAPES.obtuseTriangleB, baseSide: 1, vertexIndex: 0, prompt: "במשולש קהה זווית, לעולם תנחת הצלע מחוץ לבסיס.", correctIndex: 1, ruleText: "שקר. הזווית הקהה מוציאה שני גבהים מחוץ למשולש בלבד, אך הגובה לצלע הארוכה נשאר בפנים!" }),
        trueFalseQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "הגובה מודד את המרחק הקצר ביותר מקודקוד מסוים לישר הבסיס שממולו.", correctIndex: 0, ruleText: "אמת מוחלטת. זהו היגיון בסיס הגיאומטריה של הארי פוטר!" }),
        trueFalseQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "אם גובה והבסיס נמצאים באותו זמן, למשולש יש תמיד שטח של מחצית מכפלתם.", correctIndex: 0, ruleText: "זוהי האמת ונוסחת השטח העתיקה." }),
      ],
    },
    // ─────────────────────────────────────────────
    // שלב 12: משפטי קסם (שקר/אמת) - מקבילית
    // ─────────────────────────────────────────────
    {
      title: "משפטי קסם האמת – מקבילית",
      family: "parallelogram",
      icon: "🐍",
      goal: "לשלוף מגן פטרונוס במקביליות אפלות של סלית'רין.",
      story: "הנחש מתחבא במקבילית, מזהה את הגובה במקבילית ומכניע מזימות שקר.",
      coach: "זכור: במקבילית הקסם יוצא מכל הנקודות על הצלע. אל תבלבל עם משולש.",
      buildQuestions: () => [
        trueFalseQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "במקבילית מתחייב שהגובה יצא רק מהקודקוד כדי להיחשב באמת לגובה.", correctIndex: 1, ruleText: "שקר. כל נקודה לאורך הצלע יכולה לשגר את הלחש." }),
        trueFalseQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "למקבילית נטויה ייתכן גובה שנופל מחוצה לה על המשך הצלע.", correctIndex: 0, ruleText: "אמת – מקבילית מוטה מדי פשוט קצרה על המסלול הזקוף." }),
        trueFalseQ({ shape: SHAPES.paraC, baseSide: 0, vertexIndex: 3, prompt: "גובה במקבילית תמיד יהיה בעל אורך זהה, לא משנה לאיזה מ-2 הצלעות בחרנו להוריד אותו.", correctIndex: 1, ruleText: "שקר! לשני זוגות צלעות שונים יש מקבילים באורכים שונים לחלוטין ולכן גבהים במקבילית אינם שווים." }),
        trueFalseQ({ shape: SHAPES.paraA, baseSide: 1, vertexIndex: 0, prompt: "שטח מקבילית הוא מכפלת הבסיס בגובה. אין לחלק את הנוסחה בשניים.", correctIndex: 0, ruleText: "אמת מגוננת! קללתו של וולדמורט שמחלקת הכל בשניים חושפת את טעותיו למשולש בלבד." }),
        trueFalseQ({ shape: SHAPES.paraB, baseSide: 0, vertexIndex: 3, prompt: "שתי צלעות מקבילות במקבילית המהוות בסיס מרוחקות זו מזו מרחק קבוע ששווה תמיד לאורך הגובה שלהן.", correctIndex: 0, ruleText: "אמת הנדסית צרופה." }),
      ],
    },
  ];
}
