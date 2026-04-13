const STORAGE_KEY = "airBridgeHeightGame_v1";
const CANVAS_SIZE = { width: 900, height: 580 };
const DRAW_TOLERANCE_BY_STAGE = [10, 10, 10, 10, 10, 10, 9, 8, 8, 8];

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
  STAGES.forEach((stage, index) => {
    const locked = index > appState.progress.unlockedStage;
    const complete = appState.progress.completedStages.includes(index);
    const icon = stage.icon || (stage.family === "parallelogram" ? "▱" : "△");
    const status = locked ? "נעול" : complete ? "הושלם" : index === appState.progress.currentStage ? "כאן ממשיכים" : "פתוח";
    const node = document.createElement("button");
    node.className = `stage-node ${locked ? "locked" : ""} ${complete ? "complete" : ""} ${index === appState.progress.currentStage ? "current" : ""}`;
    node.disabled = locked;
    node.innerHTML = `
      <span class="stage-node-icon" aria-hidden="true">${icon}</span>
      <strong>תחנה ${index + 1}</strong>
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
  refs.stageEyebrow.textContent = appState.challengeMode ? `מצב אתגר · שלב ${appState.stageIndex + 1}` : `שלב ${appState.stageIndex + 1}`;
  refs.stageTitle.textContent = appState.challengeMode ? `${stage.title} · טורבו` : stage.title;
  refs.stageGoal.textContent = stage.goal;
  refs.stageCounter.textContent = `שאלה ${appState.questionIndex + 1} / ${appState.stageQuestions.length}`;
  refs.questionPrompt.textContent = appState.currentQuestion.prompt;
  refs.questionStory.textContent = appState.currentQuestion.story || stage.story;
  refs.coachName.textContent = appState.currentQuestion.coachName || "הכבשה מהספרייה";
  refs.coachMessage.textContent = appState.currentQuestion.coach || stage.coach;

  renderQuestionControls();
  updateMetrics();
  renderQuestionCanvas();
  appState.hintTimer = window.setTimeout(() => revealHint(false), 15000);
}

function renderQuestionControls() {
  const q = appState.currentQuestion;
  refs.choiceArea.innerHTML = "";
  refs.checkAnswer.disabled = false;
  refs.undoAction.disabled = q.kind !== "draw-altitude";

  if (q.kind === "choice" || q.kind === "fix-mistake") {
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
  const shapeColor = "#1d3f67";

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
      drawLine(ctx, line, "#e14d6f", 5);
      const angle = perpendicularDifference(render.baseLine, line);
      refs.angleReadout.textContent = `זווית מול הבסיס: ${Math.round(90 - angle)}°`;
      if (angle <= DRAW_TOLERANCE_BY_STAGE[appState.stageIndex]) {
        drawRightAngleMarker(ctx, line, render.baseLine, "#ff9f43");
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
  } else if (q.kind === "choice" || q.kind === "fix-mistake") {
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
  playTone(correct ? "success" : "error");
  renderAchievements();
  saveProgress();
}

function renderFeedback(correct, q) {
  const adaptiveTip = correct ? "" : getAdaptiveCoachMessage(detectMistakePattern(q));
  const card = document.createElement("div");
  card.className = `feedback-card ${correct ? "success" : "error"}`;
  card.innerHTML = `
    <p><strong>${correct ? "נכון." : "לא מדויק."}</strong></p>
    <p>${correct ? q.successText : q.errorText}</p>
    <p><strong>הכלל:</strong> ${q.ruleText}</p>
    ${adaptiveTip ? `<p><strong>מה לבדוק עכשיו:</strong> ${adaptiveTip}</p>` : ""}
    <button class="primary-button" id="nextQuestionButton">לשאלה הבאה</button>
  `;
  refs.feedbackArea.innerHTML = "";
  refs.feedbackArea.appendChild(card);
  if (!correct && adaptiveTip) {
    setCoach("הכבשה מהספרייה", adaptiveTip);
  }
  document.getElementById("nextQuestionButton").addEventListener("click", advanceQuestion);
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

  refs.summaryTitle.textContent = `קטע ${stageNumber} בגשר הושלם`;
  refs.summaryScore.textContent = `${score} / ${appState.stageQuestions.length}`;
  refs.summaryBridge.textContent = score >= 8 ? "המבנה יציב" : "צריך עוד חיזוק";
  refs.summaryIdentify.textContent = `${appState.stageMetrics.identify.correct} / ${appState.stageMetrics.identify.total}`;
  refs.summaryDraw.textContent = `${appState.stageMetrics.draw.correct} / ${appState.stageMetrics.draw.total}`;
  refs.summaryReason.textContent = `${appState.stageMetrics.reason.correct} / ${appState.stageMetrics.reason.total}`;
  refs.summaryWeakness.textContent = weakest?.label || "עדיין אין נתונים";
  refs.summaryVictory.classList.add("hidden");
  refs.summaryVictory.innerHTML = "";
  refs.nextStage.textContent = isFinalStage ? "חזרה למפת הכשפים" : "לשלב הבא";

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
      <p><strong>מצב אתגר נפתח.</strong></p>
      <p>3 שאלות ב־60 שניות. לא חובה, כן כיף.</p>
      <button id="startChallenge" class="primary-button">להתחיל אתגר</button>
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
  appState.challengeTime = 60;
  refs.challengeTimer.classList.remove("hidden");
  refs.challengeTimer.textContent = "60";
  appState.challengeTimerId = window.setInterval(() => {
    appState.challengeTime -= 1;
    refs.challengeTimer.textContent = String(appState.challengeTime);
    if (appState.challengeTime <= 0) {
      finishChallenge();
    }
  }, 1000);
  loadQuestion();
  showScreen("screenGame");
}

function finishChallenge() {
  stopChallengeTimer();
  appState.challengeMode = false;
  refs.summaryChallenge.classList.add("hidden");
  refs.summaryChallenge.innerHTML = `
    <p><strong>סיום מצב אתגר:</strong> ${appState.challengeScore} / ${appState.challengeQuestions.length}</p>
  `;
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
  let hintPoint = null;

  if (q.kind === "draw-altitude" || q.kind === "select-altitude") {
    const p = appState.currentRender.scaledPoints[q.vertexIndex];
    hintPoint = p;
  } else if (q.kind === "reverse-base") {
    const side = appState.currentRender.sideSegments[q.correctSide];
    hintPoint = midpoint(side.p1, side.p2);
  } else {
    const p = appState.currentRender.scaledPoints[q.vertexIndex || 0];
    hintPoint = p;
  }

  if (hintPoint) {
    refs.hintPulse.style.setProperty("--hint-x", `${(hintPoint.x / refs.gameCanvas.width) * 100}%`);
    refs.hintPulse.style.setProperty("--hint-y", `${(hintPoint.y / refs.gameCanvas.height) * 100}%`);
    refs.hintPulse.classList.remove("hidden");
  }
  if (fromButton) {
    setCoach("הכבשה מהספרייה", q.hintText || "הסתכל קודם על הקודקוד שממנו צריך לצאת.");
  }
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
  drawShape(sandboxCtx, render, "#1d3f67");
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
  refs.soundToggle.textContent = `צליל: ${appState.soundOn ? "פועל" : "כבוי"}`;
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
  const gradient = targetCtx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(236, 245, 255, 0.95)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0.9)");
  targetCtx.fillStyle = gradient;
  targetCtx.fillRect(0, 0, width, height);

  targetCtx.save();
  targetCtx.strokeStyle = "rgba(33, 91, 158, 0.05)";
  targetCtx.lineWidth = 1;
  for (let x = 0; x <= width; x += 40) {
    targetCtx.beginPath();
    targetCtx.moveTo(x, 0);
    targetCtx.lineTo(x, height);
    targetCtx.stroke();
  }
  for (let y = 0; y <= height; y += 40) {
    targetCtx.beginPath();
    targetCtx.moveTo(0, y);
    targetCtx.lineTo(width, y);
    targetCtx.stroke();
  }
  targetCtx.restore();
}

function drawShape(targetCtx, render, strokeStyle) {
  const points = render.scaledPoints;
  targetCtx.save();
  targetCtx.strokeStyle = strokeStyle;
  targetCtx.lineWidth = 4;
  targetCtx.beginPath();
  targetCtx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    targetCtx.lineTo(points[i].x, points[i].y);
  }
  targetCtx.closePath();
  targetCtx.stroke();

  points.forEach((point) => {
    targetCtx.beginPath();
    targetCtx.fillStyle = "#ffffff";
    targetCtx.strokeStyle = strokeStyle;
    targetCtx.lineWidth = 3;
    targetCtx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();
  });
  targetCtx.restore();
}

function drawBase(targetCtx, render) {
  if (!render.baseLine) return;
  targetCtx.save();
  targetCtx.strokeStyle = "#2c7be5";
  targetCtx.lineWidth = 7;
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
  targetCtx.strokeStyle = revealCorrect ? "#21a37a" : selected ? "#e14d6f" : "rgba(24, 89, 181, 0.35)";
  targetCtx.lineWidth = revealCorrect || selected ? 5 : 3;
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
  targetCtx.fillStyle = "#15304c";
  targetCtx.font = '700 20px "Alef"';
  points.forEach((point, index) => {
    targetCtx.fillText(labels[index], point.x + 12, point.y - 10);
  });
  targetCtx.restore();
}

function drawSideLabels(targetCtx, render) {
  targetCtx.save();
  targetCtx.fillStyle = "rgba(21, 48, 76, 0.72)";
  targetCtx.font = '700 15px "Alef"';
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
    {
      title: "מהו גובה",
      family: "triangle",
      icon: "△",
      goal: "זיהוי מדויק של קודקוד, בסיס ומאונך.",
      story: "אבן היסוד של הגשר צריכה גובה מדויק כדי לעמוד.",
      coach: "קודם בסיס, אחר כך קודקוד, ואז מאונך.",
      buildQuestions: (skipWarmup) => {
        const warmup = [
          selectQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "איזה קטע הוא הגובה במשולש?", story: "מקטע היסוד הראשון חייב להיות יציב.", coach: "חפש קטע שיוצא מהקודקוד אל הבסיס.", hintText: "התחל מהקודקוד שמול הבסיס.", distractors: ["notPerp", "wrongVertex", "toEndpoint"] }),
          selectQ({ shape: SHAPES.triangleB, baseSide: 1, vertexIndex: 0, prompt: "בחר את הגובה הנכון.", story: "הקורה השנייה מחכה לגובה מדויק.", coach: "הבסיס כבר מודגש בכחול." }),
        ];
        const main = [
          choiceQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "מאיזה קודקוד צריך לצאת הגובה לבסיס הכחול?", story: "כאן כבר צריך לנמק.", options: ["מהקודקוד שמול הבסיס", "מאחד מקצות הבסיס", "מכל קודקוד שרוצים"], correctIndex: 0, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, hintText: "הגובה לא מתחיל על הבסיס עצמו." }),
          reasonTextQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "כתוב בקצרה למה הקטע האדום הוא גובה.", story: "הגשר מחזיק רק אם ההסבר מדויק.", keywords: ["קודקוד", "מאונך", "בסיס"], shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "למשל: הוא יוצא מהקודקוד ומאונך לבסיס" }),
          selectQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "המשולש מסובב. איזה קטע עדיין נחשב גובה?", story: "הכיוון השתנה, הכלל לא." }),
          drawQ({ shape: SHAPES.triangleA, baseSide: 1, vertexIndex: 0, prompt: "שרטט גובה לצלע הכחולה.", story: "עכשיו אתה מצייר את הכבל הראשון.", coach: "התחל מהקודקוד שמול הבסיס.", hintText: "הבסיס כחול. צא מהקודקוד שלא שייך לו." }),
          reverseQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "הגובה האדום כבר מסומן. לאיזו צלע הוא שייך?", story: "בדיקת חשיבה הפוכה מוקדמת." }),
          fixQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "דני צייר קו מהקודקוד, אבל הוא לא נחשב גובה. מה הטעות?", story: "דני הקדים אותך והסתבך.", shownLine: { fromIndex: 2, toSide: 0, sideT: 0.25 }, options: ["הקו לא מאונך לבסיס", "הקו לא אדום", "המשולש קטן מדי"], correctIndex: 0 }),
          selectQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "בחר את הגובה הנכון במשולש ישר זווית.", story: "הקטע הבא בגשר נשען על משולש ישר.", distractors: ["toEndpoint", "wrongBase", "wrongVertex"] }),
          drawQ({ shape: SHAPES.triangleB, baseSide: 2, vertexIndex: 1, prompt: "שרטט גובה לבסיס הכחול.", story: "עוד חיזוק לפני שהיסוד ננעל." }),
          reasonTextQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "כתוב בקצרה למה הקטע המסומן אינו גובה.", story: "למי שדילג על החימום יש כאן כבר דקויות.", keywords: ["קודקוד", "לא", "נכון"], shownLine: { fromIndex: 0, toProjection: { side: 2 } }, showRightAngle: true, placeholder: "למשל: הוא לא יוצא מהקודקוד הנכון" }),
          reverseQ({ shape: SHAPES.triangleA, baseSide: 1, vertexIndex: 0, prompt: "לאיזו צלע שייך הגובה האדום?", story: "עוד שאלה הפוכה במקום שתי שאלות חימום." }),
        ];
        return skipWarmup ? main : [...warmup, ...main.slice(0, 8)];
      },
    },
    {
      title: "גובה מול קווים מבלבלים",
      family: "triangle",
      icon: "◬",
      goal: "להבדיל בין גובה לבין קו דומה.",
      story: "מקטע הגשר הבא דורש עין חדה למסיחים.",
      coach: "אל תתבלבל בין קו שנראה יפה לבין קו שעומד בכלל.",
      buildQuestions: () => [
        selectQ({ shape: SHAPES.triangleRotated, baseSide: 1, vertexIndex: 0, prompt: "איזה קטע הוא גובה למרות שהמשולש מסובב?", story: "המסך מסובב, הכלל לא מסובב.", distractors: ["notPerp", "wrongVertex", "toEndpoint"] }),
        choiceQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "למה הקטע האדום אינו גובה?", story: "דמיון חזותי לא מספיק.", options: ["כי הוא לא מאונך לבסיס", "כי הוא קצר מדי", "כי הוא מחוץ למשולש"], correctIndex: 0, shownLine: { fromIndex: 2, toSide: 0, sideT: 0.12 } }),
        selectQ({ shape: SHAPES.triangleA, baseSide: 2, vertexIndex: 1, prompt: "בחר את הגובה הנכון.", story: "רק אחד עומד בכלל המלא." }),
        reasonTextQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "כתוב בקצרה למה הקו עדיין לא גובה.", story: "בדיקה של שני תנאים יחד.", keywords: ["מאונך", "לא", "בסיס"], shownLine: { fromIndex: 1, toSide: 2, sideT: 0.15 }, placeholder: "למשל: הוא לא מאונך לבסיס" }),
        drawQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה במשולש המסובב.", story: "עכשיו אתה מצייר במקום לזהות." }),
        reverseQ({ shape: SHAPES.triangleA, baseSide: 2, vertexIndex: 1, prompt: "לאיזו צלע שייך הקו האדום?", story: "חשיבה הפוכה מחזקת שליטה." }),
        fixQ({ shape: SHAPES.triangleB, baseSide: 1, vertexIndex: 0, prompt: "דני בחר קטע מאונך, אבל עדיין טעה. מה הבעיה?", story: "הפעם הטעות היא לא בזווית.", shownLine: { fromIndex: 2, toProjection: { side: 1 } }, options: ["הוא יצא מהקודקוד הלא נכון", "הוא היה צריך לצייר קו קצר יותר", "הבסיס תמיד בתחתית"], correctIndex: 0 }),
        selectQ({ shape: SHAPES.rightTriangleB, baseSide: 1, vertexIndex: 0, prompt: "איזה קטע הוא גובה לבסיס הכחול?", story: "גם במשולש ישר צריך לבחור נכון." }),
        choiceQ({ shape: SHAPES.triangleA, baseSide: 1, vertexIndex: 0, prompt: "מה חייבים לבדוק קודם?", story: "לפני כל שרטוט יש סדר עבודה.", options: ["מהו הבסיס", "איזו צלע ארוכה יותר", "איפה אמצע המשולש"], correctIndex: 0, shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true }),
        drawQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה לבסיס הכחול.", story: "סגירת המקטע השני." }),
      ],
    },
    {
      title: "שרטוט במשולש חד",
      family: "triangle",
      icon: "△",
      goal: "לצייר גובה מדויק לבסיס נתון.",
      story: "מקטע דק וארוך דורש שרטוט מדויק.",
      coach: "צא מהקודקוד הנכון והישאר נאמן ל־90 מעלות.",
      buildQuestions: () => [
        drawQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה לבסיס הכחול.", story: "בונים קורה ישרה ראשונה." }),
        drawQ({ shape: SHAPES.triangleB, baseSide: 1, vertexIndex: 0, prompt: "שרטט גובה לבסיס הכחול." }),
        drawQ({ shape: SHAPES.triangleRotated, baseSide: 2, vertexIndex: 1, prompt: "המשולש מסובב. שרטט גובה נכון." }),
        selectQ({ shape: SHAPES.triangleA, baseSide: 1, vertexIndex: 0, prompt: "איזה קטע תואם לשרטוט נכון?" }),
        reverseQ({ shape: SHAPES.triangleB, baseSide: 2, vertexIndex: 1, prompt: "לאיזו צלע שייך הגובה האדום?" }),
        reasonTextQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "כתוב בקצרה למה הקטע צריך לצאת דווקא מהקודקוד הזה.", keywords: ["קודקוד", "מול", "בסיס"], shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "למשל: זה הקודקוד שמול הבסיס" }),
        drawQ({ shape: SHAPES.triangleB, baseSide: 2, vertexIndex: 1, prompt: "שרטט גובה נוסף.", story: "עוד קורה לפני נעילה." }),
        fixQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "דני שרטט גובה לאותו בסיס. מה חסר בשרטוט?", shownLine: { fromIndex: 2, toSide: 0, sideT: 0.18 }, options: ["אין זווית ישרה לבסיס", "המשולש קטן מדי", "הקו היה צריך להיות כחול"], correctIndex: 0 }),
        selectQ({ shape: SHAPES.triangleA, baseSide: 2, vertexIndex: 1, prompt: "בחר את השרטוט המדויק ביותר." }),
        drawQ({ shape: SHAPES.triangleRotated, baseSide: 1, vertexIndex: 0, prompt: "שרטט את הגובה האחרון לשלב הזה." }),
      ],
    },
    {
      title: "משולש ישר זווית",
      family: "triangle",
      icon: "⟂",
      goal: "להבין גובה במשולש ישר ולתקן טעויות של אחרים.",
      story: "הגשר עולה בזווית חדה, וצריך להבין צלעות וניצבים.",
      coach: "במשולש ישר גם צלע יכולה להיות גובה, תלוי בבסיס שנבחר.",
      buildQuestions: () => [
        selectQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "איזה קטע הוא הגובה לבסיס הכחול?", story: "החלק הזה של הגשר נשען על משולש ישר." }),
        reasonTextQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "כתוב בקצרה למה אחת הצלעות כאן יכולה להיות גובה.", keywords: ["מאונך", "בסיס", "צלע"], shownLine: { fromIndex: 1, toProjection: { side: 2 } }, showRightAngle: true, placeholder: "למשל: הצלע מאונכת לבסיס" }),
        drawQ({ shape: SHAPES.rightTriangleB, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה לבסיס הכחול." }),
        fixQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "דני בחר את האלכסון. מה הטעות?", shownLine: { fromIndex: 1, toIndex: 2 }, options: ["האלכסון לא מאונך לבסיס", "האלכסון תמיד גובה", "הבעיה היא רק האורך"], correctIndex: 0 }),
        fixQ({ shape: SHAPES.rightTriangleB, baseSide: 1, vertexIndex: 0, prompt: "דני בחר קטע נכון לזווית, אבל טעה בבסיס. מה הטעות?", shownLine: { fromIndex: 0, toProjection: { side: 0 } }, options: ["הוא עבד ביחס לבסיס אחר", "הקו קצר מדי", "צריך לבחור תמיד בסיס תחתון"], correctIndex: 0 }),
        reverseQ({ shape: SHAPES.rightTriangleA, baseSide: 1, vertexIndex: 0, prompt: "לאיזו צלע שייך הגובה האדום?" }),
        drawQ({ shape: SHAPES.rightTriangleA, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה לבסיס הכחול." }),
        reasonTextQ({ shape: SHAPES.rightTriangleB, baseSide: 0, vertexIndex: 2, prompt: "כתוב מאיזה קודקוד צריך לצאת הגובה.", keywords: ["קודקוד", "מול", "בסיס"], shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "למשל: מהקודקוד שמול הבסיס" }),
        selectQ({ shape: SHAPES.rightTriangleB, baseSide: 0, vertexIndex: 2, prompt: "בחר את הגובה המתאים." }),
        drawQ({ shape: SHAPES.rightTriangleB, baseSide: 1, vertexIndex: 0, prompt: "שרטט את הגובה האחרון לשלב." }),
      ],
    },
    {
      title: "משולש קהה זווית",
      family: "triangle",
      icon: "◭",
      goal: "להבין גובה חיצוני והמשך צלע.",
      story: "כאן הגשר כמעט גולש החוצה. צריך לדעת לעבוד עם המשך צלע.",
      coach: "אם הגובה לא פוגש את הצלע עצמה, בודקים את ההמשך שלה.",
      buildQuestions: () => [
        selectQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "איזה קטע הוא גובה במשולש הקהה?", story: "כאן הגובה יוצא מחוץ למשולש.", distractors: ["notPerp", "wrongVertex", "toEndpoint"] }),
        reasonTextQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "כתוב בקצרה למה הגובה יוצא מחוץ למשולש.", keywords: ["המשך", "בסיס", "מאונך"], shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "למשל: כי צריך לפגוש את המשך הבסיס" }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "שרטט גובה לבסיס הכחול או להמשכו." }),
        fixQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, prompt: "דני עצר את הקו בתוך המשולש. מה הטעות?", shownLine: { fromIndex: 2, toSide: 0, sideT: 0.82 }, options: ["הוא לא המשיך אל המשך הבסיס", "הקו ארוך מדי", "המשולש מסובב"], correctIndex: 0 }),
        fixQ({ shape: SHAPES.obtuseTriangleB, baseSide: 1, vertexIndex: 0, prompt: "דני יצא מהקודקוד הנכון, אבל בחר נקודת מפגש לא נכונה. מה הבעיה?", shownLine: { fromIndex: 0, toSide: 1, sideT: 0.18 }, options: ["הקו לא מאונך להמשך הבסיס", "הוא היה צריך לבחור קו קצר יותר", "הבסיס חייב להיות בתחתית"], correctIndex: 0 }),
        drawQ({ shape: SHAPES.obtuseTriangleB, baseSide: 1, vertexIndex: 0, allowExtension: true, prompt: "שרטט גובה לבסיס הכחול." }),
        reverseQ({ shape: SHAPES.obtuseTriangleB, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "לאיזו צלע שייך הגובה האדום?" }),
        selectQ({ shape: SHAPES.obtuseTriangleB, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "בחר את הגובה הנכון." }),
        choiceQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "מה צריך לזכור במשולש קהה זווית?", options: ["לפעמים צריך להמשיך צלע", "תמיד בוחרים את הקו הארוך ביותר", "הגובה תמיד בתוך המשולש"], correctIndex: 0, shownLine: { fromIndex: 2, toProjection: { side: 0 } }, showRightAngle: true }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 2, vertexIndex: 1, allowExtension: true, prompt: "שרטט גובה נוסף לסיום השלב." }),
      ],
    },
    {
      title: "בחירת בסיס",
      family: "triangle",
      icon: "⟍",
      goal: "להבין שלאותו משולש יש גבהים שונים לפי הבסיס.",
      story: "הגשר מתרחב, והפעם אותה צורה מקבלת כמה תפקידי בסיס.",
      coach: "הגובה לא עומד לבד. הוא תמיד שייך לבסיס מסוים.",
      buildQuestions: () => [
        reverseQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "לאיזו צלע שייך הגובה האדום?", story: "הפעם הבסיס הוא המטרה." }),
        reverseQ({ shape: SHAPES.triangleA, baseSide: 1, vertexIndex: 0, prompt: "אותו משולש, בסיס אחר. לאיזו צלע שייך הגובה?" }),
        drawQ({ shape: SHAPES.triangleA, baseSide: 2, vertexIndex: 1, prompt: "שרטט גובה לבסיס החדש." }),
        reasonTextQ({ shape: SHAPES.triangleB, baseSide: 1, vertexIndex: 0, prompt: "כתוב בקצרה מה קורה לגובה כשמחליפים בסיס.", keywords: ["גובה", "משתנה", "בסיס"], shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true, placeholder: "למשל: הגובה משתנה כי הבסיס משתנה" }),
        fixQ({ shape: SHAPES.triangleB, baseSide: 2, vertexIndex: 1, prompt: "דני השתמש בגובה נכון לבסיס אחר. מה הטעות?", shownLine: { fromIndex: 2, toProjection: { side: 0 } }, options: ["הגובה שייך לבסיס אחר", "הבעיה היא רק הצבע", "אין שום טעות"], correctIndex: 0 }),
        selectQ({ shape: SHAPES.triangleRotated, baseSide: 1, vertexIndex: 0, prompt: "בחר את הגובה ביחס לבסיס הכחול." }),
        drawQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה לבסיס הכחול." }),
        reverseQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "הגובה האדום שייך לאיזו צלע?" }),
        choiceQ({ shape: SHAPES.triangleA, baseSide: 2, vertexIndex: 1, prompt: "מאיזה קודקוד ייצא הגובה לבסיס הכחול?", options: ["מהקודקוד שמול הבסיס", "מהאמצע", "מכל קודקוד"], correctIndex: 0, shownLine: { fromIndex: 1, toProjection: { side: 2 } }, showRightAngle: true }),
        drawQ({ shape: SHAPES.triangleB, baseSide: 1, vertexIndex: 0, prompt: "שרטט גובה מסכם לשלב." }),
      ],
    },
    {
      title: "גובה במקבילית",
      family: "parallelogram",
      icon: "▱",
      goal: "להבין גובה במקבילית כמרחק בין צלעות מקבילות.",
      story: "הגשר מקבל עכשיו משטחים רחבים של מקביליות.",
      coach: "במקבילית הגובה קשור לבסיס הנבחר ולצלע המקבילה לו.",
      buildQuestions: () => [
        selectQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "איזה קטע הוא גובה במקבילית?", story: "כאן כבר לא מדובר במשולש.", distractors: ["notPerp", "wrongBase", "wrongVertex"] }),
        reasonTextQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "כתוב בקצרה למה הקטע האדום נחשב גובה כאן.", keywords: ["מאונך", "בסיס", "מקבילות"], shownLine: { fromIndex: 3, toProjection: { side: 0 } }, showRightAngle: true, placeholder: "למשל: הוא מאונך לבסיס ומגיע לצלע המקבילה" }),
        drawQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "שרטט גובה לבסיס הכחול.", coach: "הגובה הוא מרחק בין מקבילים." }),
        selectQ({ shape: SHAPES.paraB, baseSide: 1, vertexIndex: 0, prompt: "בחר את הגובה לבסיס הכחול." }),
        fixQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "דני בחר את הצלע הנטויה. מה הטעות?", shownLine: { fromIndex: 3, toIndex: 2 }, options: ["הצלע הנטויה לא מאונכת לבסיס", "היא ארוכה מדי", "במקבילית אין גובה"], correctIndex: 0 }),
        reverseQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "לאיזו צלע שייך הגובה האדום?" }),
        drawQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "שרטט גובה לבסיס הכחול." }),
        choiceQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "מה ההבדל המרכזי בין גובה במשולש לגובה במקבילית?", options: ["במקבילית הוא מודד מרחק בין צלעות מקבילות", "במקבילית אין בסיס", "במשולש אין זווית ישרה"], correctIndex: 0, shownLine: { fromIndex: 3, toProjection: { side: 0 } }, showRightAngle: true }),
        selectQ({ shape: SHAPES.paraC, baseSide: 2, vertexIndex: 1, prompt: "בחר את הגובה הנכון.", distractors: ["wrongBase", "notPerp", "toEndpoint"] }),
        drawQ({ shape: SHAPES.paraC, baseSide: 2, vertexIndex: 1, prompt: "שרטט גובה מסכם לשלב." }),
      ],
    },
    {
      title: "מקבילית נטויה",
      family: "parallelogram",
      icon: "▰",
      goal: "לשרטט גובה גם כשהוא לא נראה אנכי למסך.",
      story: "המשטחים נוטים ברוח, אבל הגובה עדיין שייך לבסיס.",
      coach: "אל תבדוק מול המסך. בדוק מול הבסיס הכחול.",
      buildQuestions: () => [
        drawQ({ shape: SHAPES.paraB, baseSide: 0, vertexIndex: 3, prompt: "שרטט גובה לבסיס הכחול." }),
        selectQ({ shape: SHAPES.paraB, baseSide: 0, vertexIndex: 3, prompt: "איזה קטע הוא גובה למרות שהוא לא אנכי למסך?" }),
        reasonTextQ({ shape: SHAPES.paraC, baseSide: 1, vertexIndex: 0, prompt: "כתוב בקצרה למה הקו האדום כן גובה למרות שהוא נראה 'עקום'.", keywords: ["מאונך", "בסיס", "לא למסך"], shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true, placeholder: "למשל: הוא מאונך לבסיס, לא למסך" }),
        drawQ({ shape: SHAPES.paraC, baseSide: 1, vertexIndex: 0, prompt: "שרטט גובה לבסיס הכחול." }),
        reverseQ({ shape: SHAPES.paraB, baseSide: 2, vertexIndex: 1, prompt: "הגובה האדום שייך לאיזו צלע?" }),
        fixQ({ shape: SHAPES.paraC, baseSide: 1, vertexIndex: 0, prompt: "דני שרטט קו אנכי למסך. מה הטעות?", shownLine: { fromPoint: { x: 510, y: 170 }, toPoint: { x: 510, y: 420 } }, options: ["הוא בדק מול המסך, לא מול הבסיס", "הוא היה צריך קו קצר יותר", "במקבילית אין גובה"], correctIndex: 0 }),
        drawQ({ shape: SHAPES.paraA, baseSide: 3, vertexIndex: 2, prompt: "שרטט גובה נוסף." }),
        selectQ({ shape: SHAPES.paraC, baseSide: 0, vertexIndex: 3, prompt: "בחר את הגובה הנכון." }),
        choiceQ({ shape: SHAPES.paraB, baseSide: 2, vertexIndex: 1, prompt: "מה צריך לבדוק קודם במקבילית נטויה?", options: ["איזו צלע נבחרה כבסיס", "מה הכי נראה אנכי למסך", "איזה קו עובר באמצע"], correctIndex: 0, shownLine: { fromIndex: 1, toProjection: { side: 2 } }, showRightAngle: true }),
        drawQ({ shape: SHAPES.paraB, baseSide: 2, vertexIndex: 1, prompt: "שרטט גובה מסכם לשלב." }),
      ],
    },
    {
      title: "ערבוב חכם",
      family: "mixed",
      icon: "✦",
      goal: "לעבור מהר בין משולש למקבילית בלי להתבלבל.",
      story: "הגשר כבר מחבר בין כמה איים. עכשיו צריך שליטה מהירה.",
      coach: "בכל שאלה שאל: מהי הצורה? מהו הבסיס? מאיפה יוצא הגובה?",
      buildQuestions: () => [
        selectQ({ shape: SHAPES.triangleA, baseSide: 0, vertexIndex: 2, prompt: "בחר את הגובה במשולש." }),
        selectQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "בחר את הגובה במקבילית." }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "שרטט גובה במשולש הקהה." }),
        drawQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "שרטט גובה במקבילית." }),
        reverseQ({ shape: SHAPES.triangleRotated, baseSide: 1, vertexIndex: 0, prompt: "לאיזו צלע שייך הגובה?" }),
        reverseQ({ shape: SHAPES.paraC, baseSide: 2, vertexIndex: 1, prompt: "לאיזו צלע שייך הגובה במקבילית?" }),
        fixQ({ shape: SHAPES.obtuseTriangleB, baseSide: 1, vertexIndex: 0, prompt: "דני שכח להמשיך צלע. מה הטעות?", shownLine: { fromIndex: 0, toSide: 1, sideT: 0.1 }, options: ["הוא לא השתמש בהמשך הצלע", "הוא יצא מהקודקוד הלא נכון", "הוא בחר קו קצר"], correctIndex: 0 }),
        fixQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "דני בחר צלע נטויה כגובה. מה הטעות?", shownLine: { fromIndex: 3, toIndex: 2 }, options: ["היא לא מאונכת לבסיס", "היא לא עוברת במרכז", "היא קצרה מדי"], correctIndex: 0 }),
        reasonTextQ({ shape: SHAPES.triangleB, baseSide: 2, vertexIndex: 1, prompt: "כתוב מה תמיד נשאר קבוע בהגדרת גובה.", keywords: ["מאונך", "בסיס"], shownLine: { fromIndex: 1, toProjection: { side: 2 } }, showRightAngle: true, placeholder: "למשל: שהגובה מאונך לבסיס" }),
        drawQ({ shape: SHAPES.paraC, baseSide: 1, vertexIndex: 0, prompt: "שרטט גובה מסכם לשלב." }),
      ],
    },
    {
      title: "אתגר מסכם",
      family: "mixed",
      icon: "★",
      goal: "לשלב זיהוי, שרטוט, בסיס, נימוק ותיקון טעויות.",
      story: "המקטע האחרון של הגשר דורש שליטה מלאה.",
      coach: "הכל כבר בידיים שלך. חשוב מסודר, לא מהר מדי.",
      buildQuestions: () => [
        reasonTextQ({ shape: SHAPES.triangleA, baseSide: 1, vertexIndex: 0, prompt: "כתוב מהי הבדיקה הראשונה לפני שרטוט גובה.", keywords: ["בסיס", "תחילה"], shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true, placeholder: "למשל: קודם מזהים בסיס" }),
        selectQ({ shape: SHAPES.obtuseTriangleA, baseSide: 0, vertexIndex: 2, allowExtension: true, prompt: "בחר את הגובה הנכון במשולש הקהה." }),
        drawQ({ shape: SHAPES.triangleRotated, baseSide: 0, vertexIndex: 2, prompt: "שרטט גובה במשולש המסובב." }),
        fixQ({ shape: SHAPES.rightTriangleA, baseSide: 2, vertexIndex: 1, prompt: "דני בחר אלכסון. מה הטעות?", shownLine: { fromIndex: 1, toIndex: 2 }, options: ["האלכסון לא מאונך לבסיס", "הבסיס לא כחול", "המשולש קטן"], correctIndex: 0 }),
        reverseQ({ shape: SHAPES.paraB, baseSide: 3, vertexIndex: 2, prompt: "הגובה האדום שייך לאיזו צלע במקבילית?" }),
        drawQ({ shape: SHAPES.paraA, baseSide: 0, vertexIndex: 3, prompt: "שרטט גובה במקבילית." }),
        reasonTextQ({ shape: SHAPES.obtuseTriangleB, baseSide: 1, vertexIndex: 0, prompt: "כתוב מה צריך לזכור כאן לפני שרטוט.", keywords: ["המשך", "צלע", "בסיס"], shownLine: { fromIndex: 0, toProjection: { side: 1 } }, showRightAngle: true, placeholder: "למשל: שאולי צריך להמשיך את הצלע" }),
        fixQ({ shape: SHAPES.paraC, baseSide: 2, vertexIndex: 1, prompt: "דני צייר קו שנראה אנכי למסך. מה הטעות?", shownLine: { fromPoint: { x: 470, y: 150 }, toPoint: { x: 470, y: 420 } }, options: ["הוא לא בדק מאונך לבסיס", "הוא היה צריך קו קצר יותר", "במקבילית אין גובה"], correctIndex: 0 }),
        selectQ({ shape: SHAPES.triangleB, baseSide: 0, vertexIndex: 2, prompt: "בחר את הגובה המדויק ביותר." }),
        drawQ({ shape: SHAPES.obtuseTriangleA, baseSide: 2, vertexIndex: 1, allowExtension: true, prompt: "שרטט את הגובה האחרון. אם צריך, השתמש בהמשך צלע." }),
      ],
    },
  ];
}
