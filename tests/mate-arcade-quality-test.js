const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const gameDir = path.join(root, "games", "mate-arcade");
const html = fs.readFileSync(path.join(gameDir, "index.html"), "utf8");
const css = fs.readFileSync(path.join(gameDir, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(gameDir, "js", "app.js"), "utf8");
const lessons = fs.readFileSync(path.join(gameDir, "js", "lessons.js"), "utf8");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.strictEqual(new Set(ids).size, ids.length, "Mate Arcade no debe tener IDs estáticos duplicados");

for (const relative of ["styles.css", "js/lessons.js", "js/app.js"]) {
  assert(fs.existsSync(path.join(gameDir, relative)), `Debe existir el recurso local ${relative}`);
  assert(html.includes(relative), `index.html debe cargar ${relative}`);
}

assert(!/<style\b/i.test(html), "El CSS debe vivir fuera del HTML");
assert(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), "La lógica debe vivir fuera del HTML");
assert(!/@import\s+url\(\s*https?:/i.test(css), "El CSS no debe requerir recursos de red");
assert(!/\b(fetch|XMLHttpRequest)\s*\(/.test(app + lessons), "El juego no debe depender de solicitudes de red");

assert(html.includes('href="../../index.html"'), "Debe conservar el regreso al portal");
assert(html.includes('id="calmSetting"'), "Debe incluir una alternativa visual sin presión");
assert(html.includes('id="studyTopicSelect"'), "La guía debe permitir elegir cualquier lección directamente");
assert(html.includes('aria-live="assertive"'), "Debe anunciar cambios importantes");
assert(html.includes('aria-modal="true"'), "Los diálogos deben ser modales para tecnologías de asistencia");
assert(app.includes("aria-controls='panel-"), "Las pestañas deben estar asociadas a sus paneles");
assert(app.includes("ArrowLeft") && app.includes("ArrowRight"), "Las pestañas deben navegarse con flechas");
assert(app.includes('$("#studyTopicSelect").value=op'), "El selector directo debe mantenerse sincronizado");
assert(app.includes("sanitizeImportedStore"), "La importación debe pasar por normalización");
assert(app.includes("recentAccuracy") && app.includes("retryQueue"), "Repaso debe usar evidencia reciente y reaparición espaciada");
assert(app.includes("Radar de errores") && app.includes("Miralo en acción"), "Las lecciones deben incluir explicación visual y contraste de errores");
assert(css.includes(".reason-compare") && css.includes(".math-scene") && css.includes(".math-result"), "Deben existir componentes visuales para contexto y razonamiento");
assert(/styles\.css\?v=\d+/.test(html) && /js\/app\.js\?v=\d+/.test(html), "Los recursos deben llevar versión para evitar mezclar cachés");

for (const op of ["add", "sub", "mul", "div", "pow", "root", "mlt", "dvs", "mcd", "mcm"]) {
  assert(lessons.includes(`${op}:`), `Debe existir contenido de estudio para ${op}`);
}

console.log("Mate Arcade quality test OK: módulos, offline, accesibilidad y estructura");
