const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

class ClassList {
  constructor() { this.values = new Set(); }
  add(...names) { names.forEach((name) => this.values.add(name)); }
  remove(...names) { names.forEach((name) => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const enabled = force === undefined ? !this.contains(name) : force;
    enabled ? this.add(name) : this.remove(name);
    return enabled;
  }
}

class Element {
  constructor(id = "") {
    this.id = id;
    this.children = [];
    this.dataset = {};
    this.style = { setProperty() {} };
    this.classList = new ClassList();
    this.attributes = {};
    this.value = "";
    this.textContent = "";
    this._innerHTML = "";
    this.checked = false;
    this.disabled = false;
  }
  set innerHTML(value) { this._innerHTML = String(value); if (value === "") this.children = []; }
  get innerHTML() { return this._innerHTML; }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener(type, handler) { this[`on${type}`] = handler; }
  querySelector() { return new Element(); }
  querySelectorAll() { return []; }
  focus() {}
  select() {}
  click() {}
  scrollIntoView() {}
  closest(selector) {
    if (selector === ".mode" && this.dataset.mode) return this;
    if (selector === ".op" && this.dataset.op) return this;
    if (selector === ".mastery-row" && this.dataset.op) return this;
    if (selector === ".study-index-btn" && this.dataset.studyOp) return this;
    if (selector === ".lesson-tab" && this.dataset.lessonTab) return this;
    if (selector === ".table-pick" && this.dataset.tableNumber) return this;
    return null;
  }
}

const html = fs.readFileSync("games/mate-arcade/index.html", "utf8");
assert(html.includes('src="js/lessons.js?v=') && html.includes('src="js/app.js?v='), "Debe cargar los módulos locales con versión");
const lessonsScript = fs.readFileSync("games/mate-arcade/js/lessons.js", "utf8");
const appScript = fs.readFileSync("games/mate-arcade/js/app.js", "utf8");
const menuMarkup = html.match(/<section class="screen active" id="menu">([\s\S]*?)<\/section>/);
assert(menuMarkup, "No se encontró la pantalla principal");
assert(!menuMarkup[1].includes('id="ops"'), "La configuración no debe sobrecargar la pantalla principal");
assert(menuMarkup[1].includes('id="customizeBtn"'), "La pantalla principal debe enlazar a Personalizar");
assert(html.includes('id="calmSetting"'), "Debe ofrecer un modo visual sin presión");
assert(html.includes('aria-hidden="true"'), "Los diálogos deben declarar su estado inicial");

const elements = new Map();
for (const id of [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])) {
  elements.set(id, new Element(id));
}

const ops = ["add", "sub", "mul", "div", "pow", "root", "mlt", "dvs", "mcd", "mcm", "frac", "dec", "simp"].map((op) => {
  const el = new Element();
  el.dataset.op = op;
  el.dataset.active = "1";
  return el;
});
const modes = ["arcade", "practice", "review"].map((mode, index) => {
  const el = new Element();
  el.dataset.mode = mode;
  el.dataset.active = index === 0 ? "1" : "0";
  return el;
});
const screens = ["menu", "customize", "game", "end", "learn", "tools", "progress"].map((id) => elements.get(id));
const credit = new Element();
const body = new Element("body");

const document = {
  body,
  hidden: false,
  activeElement: null,
  addEventListener(type, handler) { this[`on${type}`] = handler; },
  createElement: () => new Element(),
  createTextNode: (text) => ({ textContent: String(text) }),
  querySelector(selector) {
    if (selector.startsWith("#")) return elements.get(selector.slice(1));
    if (selector === ".credit") return credit;
    return new Element();
  },
  querySelectorAll(selector) {
    if (selector === ".op") return ops;
    if (selector === ".mode") return modes;
    if (selector === ".screen") return screens;
    if (selector === ".study-item" || selector === ".opt") return [];
    return [];
  },
};

const storage = new Map();
const localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
};
const window = {
  AudioContext: class {
    constructor() { this.currentTime = 0; this.destination = {}; }
    createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: {}, type: "" }; }
    createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
  },
  print() {},
};

const context = {
  window,
  document,
  localStorage,
  navigator: {},
  confirm: () => true,
  Blob: class {},
  URL: { createObjectURL: () => "blob:test", revokeObjectURL() {} },
  FileReader: class {},
  setTimeout: (fn) => { fn(); return 1; },
  clearTimeout() {},
  setInterval: () => 1,
  clearInterval() {},
  Math,
  Number,
  JSON,
  Object,
  Array,
  String,
  console,
};
vm.runInNewContext(lessonsScript, context);
const instrumentedScript = appScript.replace(
  /\}\)\(\);\s*$/,
  "window.__test = { LESSONS: LESSONS, STUDY: STUDY, quizMarkup: quizMarkup, wrongTip: wrongTip, diagnoseMistake: diagnoseMistake, masteryStatus: masteryStatus, sanitizeImportedStore: sanitizeImportedStore, makeProblem: makeProblem, makeOptions: makeOptions, activeProfile: activeProfile, evidenceFor: evidenceFor, queueRetry: queueRetry, chooseOp: chooseOp, state: state };})();",
);
vm.runInNewContext(instrumentedScript, context);

assert.strictEqual(elements.get("profileSelect").children.length, 1, "Debe crear el perfil inicial");
assert.strictEqual(elements.get("studyList").children.length, 13, "Debe renderizar las trece fichas");
assert.strictEqual(elements.get("studyIndex").children.length, 13, "Debe renderizar un índice compacto");
assert.strictEqual(elements.get("studyTopicSelect").children.length, 13, "Debe permitir saltar directamente a cualquiera de las trece lecciones");
assert.match(elements.get("studyList").children[0].innerHTML, /QUÉ VAS A APRENDER/, "Cada ficha debe incluir un objetivo");
assert.match(elements.get("studyList").children[0].innerHTML, /Miralo en acción/, "Cada ficha debe incluir una representación matemática visual");
assert.match(elements.get("studyList").children[0].innerHTML, /Radar de errores/, "Cada ficha debe contrastar errores plausibles");
assert.match(elements.get("studyList").children[0].innerHTML, /lesson-quiz/, "Cada ficha debe incluir un desafío corto");
assert.match(elements.get("studyList").children[0].innerHTML, /lesson-tabs/, "Cada lección debe dividirse en pestañas");
assert.strictEqual(Object.keys(window.__test.LESSONS).length, 13, "Deben existir trece microlecciones");
for (const [op, lesson] of Object.entries(window.__test.LESSONS)) {
  assert(lesson.goal && lesson.visual && lesson.steps.length >= 3, `${op} debe tener objetivo, visual y pasos`);
  assert(["4.º–6.º", "5.º–6.º", "6.º", "6.º–7.º"].includes(lesson.grade), `${op} debe indicar el grado sugerido`);
  assert(lesson.context && lesson.context.icon && lesson.context.math, `${op} debe conectar la idea con una situación visual`);
  assert(lesson.compare && lesson.compare.bad && lesson.compare.good, `${op} debe comparar un error plausible con el razonamiento correcto`);
  assert.strictEqual(lesson.quiz.length, 2, `${op} debe tener dos preguntas guiadas`);
  assert.match(window.__test.quizMarkup(op, 0), /quiz-option/, `${op} debe renderizar opciones de práctica`);
}
assert.strictEqual(elements.get("levelList").children.length, 13, "Debe renderizar niveles por operación");
elements.get("studyTopicSelect").value = "simp";
elements.get("studyTopicSelect").onchange();
assert.strictEqual(elements.get("lessonPosition").textContent, "13 de 13", "El selector debe saltar directamente a la última lección");

elements.get("customizeBtn").onclick();
assert.strictEqual(elements.get("customize").classList.contains("active"), true, "Debe mover la configuración a su propia pantalla");
elements.get("customizeBack").onclick();
elements.get("toolsBtn").onclick();
assert.strictEqual(elements.get("tools").classList.contains("active"), true, "Debe abrir las herramientas");
assert.strictEqual(elements.get("tablePicks").children.length, 10, "Debe crear accesos para las tablas del 1 al 10");
assert.match(elements.get("timesTable").innerHTML, /100/, "La tabla pitagórica debe llegar hasta 10 × 10");
elements.get("toolsBack").onclick();

elements.get("answerMode").value = "choice";
elements.get("answerMode").onchange();
elements.get("playBtn").onclick();
assert.strictEqual(elements.get("game").classList.contains("active"), true, "Debe abrir la pantalla de juego");
assert.strictEqual(elements.get("options").children.length, 4, "Debe generar cuatro opciones");
elements.get("pauseBtn").onclick();
assert.strictEqual(elements.get("pauseOverlay").classList.contains("show"), true, "Debe pausar la partida");
elements.get("resumeBtn").onclick();
assert.strictEqual(elements.get("pauseOverlay").classList.contains("show"), false, "Debe reanudar la partida");
elements.get("studyErrorBtn").onclick();
assert.strictEqual(elements.get("learn").classList.contains("active"), true, "Debe abrir la lección desde una corrección");
elements.get("learnBack").onclick();
assert.strictEqual(elements.get("game").classList.contains("active"), true, "Debe volver a la partida desde la lección");
assert.strictEqual(elements.get("teach").classList.contains("show"), true, "Debe recuperar la explicación del error");
elements.get("teachBtn").onclick();

elements.get("quitBtn").onclick();
modes[1].onclick = null;
elements.get("modes").onclick({ target: modes[1] });
elements.get("playBtn").onclick();
assert.strictEqual(elements.get("timerBar").style.display, "none", "Práctica no debe mostrar cronómetro");
assert.match(elements.get("roundProgress").textContent, /Pregunta 1 de 10/, "Práctica debe mostrar progreso");

elements.get("quitBtn").onclick();
elements.get("modes").onclick({ target: modes[2] });
elements.get("playBtn").onclick();
assert.strictEqual(elements.get("gameModeTag").textContent, "REPASO PERSONALIZADO", "Debe activar Repaso");
assert.strictEqual(elements.get("timerBar").style.display, "none", "Repaso no debe usar cronómetro");
elements.get("options").children[0].onclick();
const savedAfterAnswer = JSON.parse(storage.get("mateArcadeDataV2"));
assert.strictEqual(savedAfterAnswer.profiles.Jugador.total, 1, "Debe guardar cada respuesta");

elements.get("quitBtn").onclick();
elements.get("manageProfileBtn").onclick();
elements.get("profileNameInput").value = "Ana";
elements.get("createProfileBtn").onclick();
assert.strictEqual(elements.get("profileSelect").children.length, 2, "Debe crear perfiles independientes");
assert.match(elements.get("profileProgress").textContent, /Ana/, "Debe activar el perfil nuevo");
assert(storage.has("mateArcadeDataV2"), "Debe persistir datos versionados");
elements.get("manageProfileBtn").onclick();
elements.get("profileNameInput").value = "Anita";
elements.get("renameProfileBtn").onclick();
assert.match(elements.get("profileProgress").textContent, /Anita/, "Debe renombrar el perfil activo");

elements.get("progressBtn").onclick();
assert.strictEqual(elements.get("progress").classList.contains("active"), true, "Debe abrir el panel de progreso");
assert.strictEqual(elements.get("masteryList").children.length, 13, "Debe mostrar dominio de los trece temas");
assert.strictEqual(elements.get("achievementList").children.length, 10, "Debe mostrar todos los logros");
elements.get("exportBtn").onclick();

elements.get("progressBack").onclick();
ops.forEach((op) => { op.dataset.active = "0"; });
ops[0].dataset.active = "0";
elements.get("ops").onclick({ target: ops[0] });
elements.get("modes").onclick({ target: modes[0] });
elements.get("answerMode").value = "write";
elements.get("answerMode").onchange();
elements.get("playBtn").onclick();
assert.strictEqual(elements.get("typeAnswer").classList.contains("show"), true, "Debe habilitar respuestas escritas");
const beforeBlank = JSON.parse(storage.get("mateArcadeDataV2")).profiles.Anita.total;
elements.get("answerInput").value = "";
elements.get("typeAnswer").onsubmit({ preventDefault() {} });
const afterBlank = JSON.parse(storage.get("mateArcadeDataV2")).profiles.Anita.total;
assert.strictEqual(afterBlank, beforeBlank, "Una respuesta vacía no debe contarse");

elements.get("quitBtn").onclick();
const originalRandom = Math.random;
Math.random = () => 0.9;
elements.get("modes").onclick({ target: modes[1] });
elements.get("roundSetting").value = "5";
elements.get("roundSetting").onchange();
elements.get("playBtn").onclick();
for (let i = 0; i < 5; i += 1) {
  const match = elements.get("equation").innerHTML.match(/(\d+) \+ (\d+)/);
  assert(match, "La prueba debe generar una suma escrita");
  elements.get("answerInput").value = String(Number(match[1]) + Number(match[2]));
  elements.get("typeAnswer").onsubmit({ preventDefault() {} });
}
Math.random = originalRandom;
assert.strictEqual(elements.get("end").classList.contains("active"), true, "Debe completar una sesión de cinco preguntas");
const completedProfile = JSON.parse(storage.get("mateArcadeDataV2")).profiles.Anita;
assert.strictEqual(completedProfile.practiceSessions, 1, "Debe guardar la sesión de práctica");

elements.get("menuBtn").onclick();
elements.get("manageProfileBtn").onclick();
elements.get("profileNameInput").value = "Beto";
elements.get("createProfileBtn").onclick();
elements.get("manageProfileBtn").onclick();
elements.get("deleteProfileBtn").onclick();
assert.strictEqual(elements.get("profileSelect").children.length, 2, "Debe eliminar un perfil sin borrar los demás");

const malicious = window.__test.sanitizeImportedStore({
  active: "<img src=x>",
  profiles: {
    "<img src=x>": {
      total: 9,
      correct: 99,
      ops: ["add", "add", "hack"],
      preferences: { mode: "hack", rounds: 999, sound: false, calm: true },
      byOp: { add: { ok: 3, fail: 2, recent: [{ ok: true, difficulty: "imposible", errorType: "<b>x</b>", at: Infinity }] } },
    },
  },
});
assert(malicious, "Debe aceptar y normalizar una estructura recuperable");
assert(!/[<>]/.test(malicious.active), "Debe quitar marcas HTML de nombres importados");
assert.strictEqual(malicious.profiles[malicious.active].correct, 9, "Los aciertos no pueden superar el total");
assert.deepStrictEqual(Array.from(malicious.profiles[malicious.active].ops), ["add"], "Debe filtrar operaciones desconocidas y repetidas");
assert.strictEqual(malicious.profiles[malicious.active].preferences.mode, "arcade", "Debe restaurar modos inválidos");
assert.strictEqual(malicious.profiles[malicious.active].preferences.rounds, 10, "Debe restaurar cantidades inválidas");
assert.strictEqual(malicious.profiles[malicious.active].preferences.calm, true, "Debe conservar preferencias booleanas válidas");

const mulDiagnosis = window.__test.diagnoseMistake({ op: "mul", ans: 24, meta: { a: 4, b: 6 } }, 10);
assert.strictEqual(mulDiagnosis.type, "suma-en-vez-de-producto", "Debe reconocer suma en lugar de multiplicación");
assert.match(mulDiagnosis.message, /grupos/, "La corrección debe explicar el razonamiento");

window.__test.state.mode = "review";
window.__test.state.ops = ["mul"];
window.__test.state.curDiff = "normal";
window.__test.state.answered = 0;
window.__test.state.retryQueue = [];
window.__test.queueRetry("mul", "suma-en-vez-de-producto");
assert.strictEqual(window.__test.state.retryQueue.length, 1, "Repaso debe programar el error una sola vez");
window.__test.queueRetry("mul", "suma-en-vez-de-producto");
assert.strictEqual(window.__test.state.retryQueue.length, 1, "Repaso no debe duplicar el mismo error pendiente");
window.__test.state.answered = 10;
assert.strictEqual(window.__test.chooseOp(), "mul", "Repaso debe reintroducir el tema cuando vence el intervalo");
assert.strictEqual(window.__test.state.retryContext.errorType, "suma-en-vez-de-producto", "Repaso debe conservar el tipo de error");

function gcd(a, b) { while (b) [a, b] = [b, a % b]; return Math.abs(a); }
const testState = window.__test.state;
testState.mode = "arcade";
testState.level = 1;
for (const difficulty of ["easy", "normal", "hard"]) {
  for (const op of ["add", "sub", "mul", "div", "pow", "root", "mlt", "dvs", "mcd", "mcm"]) {
    testState.ops = [op];
    testState.diffByOp[op] = difficulty;
    for (let i = 0; i < 120; i += 1) {
      const problem = window.__test.makeProblem();
      assert(Number.isFinite(problem.ans), `${op}/${difficulty} debe producir una respuesta finita`);
      assert(problem.hint && problem.solve, `${op}/${difficulty} debe explicar pista y resolución`);
      const a = Number(problem.meta && problem.meta.a);
      const b = Number(problem.meta && problem.meta.b);
      if (op === "add") assert.strictEqual(problem.ans, a + b);
      if (op === "sub") assert.strictEqual(problem.ans, a - b);
      if (op === "mul") assert.strictEqual(problem.ans, a * b);
      if (op === "div") assert.strictEqual(problem.ans, a / b);
      if (op === "pow") assert.strictEqual(problem.ans, a ** b);
      if (op === "root") assert.strictEqual(problem.ans ** 2, a);
      if (op === "mlt") assert.strictEqual(problem.ans % a, 0);
      if (op === "dvs") assert.strictEqual(a % problem.ans, 0);
      if (op === "mcd") assert.strictEqual(problem.ans, gcd(a, b));
      if (op === "mcm") assert.strictEqual(problem.ans, a * b / gcd(a, b));
      const options = problem.options || window.__test.makeOptions(problem.ans, problem.distractors);
      const values = options.map((option) => Number(typeof option === "object" ? option.value : option));
      assert.strictEqual(new Set(values).size, values.length, `${op}/${difficulty} no debe repetir opciones`);
      assert(values.includes(problem.ans), `${op}/${difficulty} debe incluir la respuesta correcta`);
    }
  }
}
assert.match(window.__test.LESSONS.root.visual, /measured-square/, "La medida de la raíz debe estar anclada a la cuadrícula");
assert.match(window.__test.LESSONS.dvs.visual, /Pareja 1[\s\S]*Pareja 2[\s\S]*Pareja 3/, "Los divisores deben mostrar tres parejas claramente separadas");

const profileForMastery = window.__test.activeProfile();
profileForMastery.byOp.add = {
  ok: 9,
  fail: 1,
  lastAttemptAt: Date.now(),
  errors: {},
  recent: Array.from({ length: 10 }, () => ({ ok: true, difficulty: "hard", at: Date.now() })),
};
assert.strictEqual(window.__test.masteryStatus("add").label, "Lo tenés bastante claro", "El avance debe exigir práctica reciente y difícil");

console.log("Smoke test OK: inicio, teoría, Arcade, Práctica, Repaso y perfiles");
