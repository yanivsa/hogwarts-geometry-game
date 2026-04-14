// ══════════════════════════════════
// 🪄 WAND DESIGNER & VOLDEMORT BOSS
// ══════════════════════════════════

let playerWand = {
  wood: null,
  core: null,
  level: 1,
  powerName: "שרביט מתחיל"
};

const WOODS = [
  { id: "oak", icon: "🌳", name: "עץ אלון", desc: "חזק ואמין" },
  { id: "holly", icon: "🌿", name: "עץ ציפצפה", desc: "מיועד להגנה" },
  { id: "elder", icon: "🌌", name: "עץ סמבוק", desc: "עוצמה אפלה" }
];

const CORES = [
  { id: "phoenix", icon: "🦅", name: "נוצת עוף החול", desc: "נאמנות עמוקה" },
  { id: "dragon", icon: "🐉", name: "נימת לב דרקון", desc: "עוצמה קסומה רבה" },
  { id: "unicorn", icon: "🦄", name: "שערת חד קרן", desc: "טהרת קסם" }
];

function initWandDesigner() {
  const woodContainer = document.getElementById("wandWoodChoices");
  const coreContainer = document.getElementById("wandCoreChoices");
  
  if (!woodContainer || !coreContainer) return;

  WOODS.forEach(w => {
    const btn = document.createElement("div");
    btn.className = "wand-choice-btn";
    btn.innerHTML = `<span class="wand-emoji">${w.icon}</span><div><strong>${w.name}</strong><span>${w.desc}</span></div>`;
    btn.onclick = () => selectWandPart("wood", w, btn, woodContainer);
    woodContainer.appendChild(btn);
  });

  CORES.forEach(c => {
    const btn = document.createElement("div");
    btn.className = "wand-choice-btn";
    btn.innerHTML = `<span class="wand-emoji">${c.icon}</span><div><strong>${c.name}</strong><span>${c.desc}</span></div>`;
    btn.onclick = () => selectWandPart("core", c, btn, coreContainer);
    coreContainer.appendChild(btn);
  });

  document.getElementById("confirmWand").onclick = () => {
    // Show original start screen properly using global router
    if(typeof startFlow === 'function') {
      startFlow();
    } else {
      document.getElementById("screenWand").classList.remove("active");
      document.getElementById("screenStart").classList.add("active");
    }
  };
}

function selectWandPart(type, item, btnElement, container) {
  Array.from(container.children).forEach(b => b.classList.remove("selected"));
  btnElement.classList.add("selected");
  playerWand[type] = item;
  updateWandPreview();
}

function updateWandPreview() {
  if (playerWand.wood && playerWand.core) {
    document.getElementById("wandPreview").style.display = "flex";
    document.getElementById("wandName").textContent = `שרביט ${playerWand.wood.name} מרובה עוצמה`;
    document.getElementById("wandDesc").textContent = `עם הליבה המוזהבת של ${playerWand.core.name}.`;
    document.getElementById("wandPower").innerHTML = `<span class="wand-power-badge">רמת קסם: ${playerWand.level}</span>`;
    document.getElementById("confirmWand").disabled = false;
  }
}

// ---- Voldemort Boss Logic ---- //

function updateVoldemortPanel(q) {
  const volPanel = document.getElementById("voldemortPanel");
  const coachCard = document.querySelector(".coach-card");
  const volResult = document.getElementById("voldemortResult");
  
  if (!volPanel || !coachCard) return;
  volResult.classList.add("hidden");

  // Every 10th question is a Boss Battle
  const isBossBattle = appState.questionIndex === appState.stageQuestions.length - 1;
  const isTimedEscape = appState.challengeMode; // Dark mode for escape too

  if (isBossBattle || isTimedEscape) {
    volPanel.classList.remove("hidden");
    coachCard.classList.add("hidden");
    
    // Set Voldemort Quote
    const claims = [
      "אתה באמת חושב שקודקוד ב' קשור לשם? טיפש!",
      "אין שום גובה במשולש הזה! התייאש עכשיו!",
      "אבדה קדברה! הקו שלך לא יהיה ב-90 מעלות לעולם!",
      "רק אני - הלורד וולדמורט - יודע איפה המשכי צלעות נמצאים!"
    ];
    document.getElementById("voldemortClaim").textContent = claims[Math.floor(Math.random() * claims.length)];
    appState.inBossBattle = true;
  } else {
    volPanel.classList.add("hidden");
    coachCard.classList.remove("hidden");
    appState.inBossBattle = false;
  }
}

function triggerVoldemortDefeat(won) {
  const volResult = document.getElementById("voldemortResult");
  volResult.classList.remove("hidden", "vol-result-win", "vol-result-lose");
  
  if (won) {
    volResult.textContent = "⚡ לחש מוצלח! הדפת את וולדמורט!";
    volResult.classList.add("vol-result-win");
  } else {
    volResult.textContent = "💥 הלחש נשבר! וולדמורט התחזק.";
    volResult.classList.add("vol-result-lose");
  }
}

function showBossDefeatCardInSummary(score, total) {
  const bossDefeatCard = document.getElementById("bossDefeatCard");
  const wandUpgradeCard = document.getElementById("wandUpgradeCard");
  if (!bossDefeatCard) return;

  const passed = score >= (total - 2); // Pass criteria (8/10)

  bossDefeatCard.classList.remove("hidden", "victory", "defeat");
  bossDefeatCard.classList.add(passed ? "victory" : "defeat");
  
  document.getElementById("bossDefeatTitle").textContent = passed ? "וולדמורט נסוג זמנית!" : "וולדמורט התחזק!";
  document.getElementById("bossDefeatDesc").textContent = passed 
    ? "הצלחת לעבור את רוב השאלות האפלות. הוגוורטס שוב בטוחה!"
    : "נפלת במלכודות הגיאומטריות האפלות. חזור לחדר הניסויים להתאמן.";

  if (passed) {
    playerWand.level += 1;
    wandUpgradeCard.classList.remove("hidden");
    document.getElementById("wandUpgradeDesc").textContent = `הקסם שלך התחזק מעמידה מול אדון האופל. השרביט שלך עלה לרמה ${playerWand.level}!`;
  } else {
    wandUpgradeCard.classList.add("hidden");
  }
}

// Initialize wand designer when DOM rests
document.addEventListener("DOMContentLoaded", () => {
  initWandDesigner();
});
