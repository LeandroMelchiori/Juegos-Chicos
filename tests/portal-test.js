const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

class Element {
  constructor(id = "") {
    this.id = id;
    this.children = [];
    this.style = { setProperty() {} };
    this.textContent = "";
    this._innerHTML = "";
  }
  set innerHTML(value) { this._innerHTML = String(value); }
  get innerHTML() { return this._innerHTML; }
  appendChild(child) { this.children.push(child); return child; }
}

const html = fs.readFileSync("index.html", "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/);
assert(script, "La portada debe incluir el catálogo");
assert(html.includes('href="games/mate-arcade/index.html"') || script[1].includes('games/mate-arcade/index.html'),
  "La portada debe enlazar a Mate Arcade");

const elements = new Map([
  ["gameCatalog", new Element("gameCatalog")],
  ["gameCount", new Element("gameCount")],
]);
const document = {
  getElementById(id) { return elements.get(id); },
  createElement() { return new Element(); },
};

vm.runInNewContext(script[1], { document });

assert.strictEqual(elements.get("gameCatalog").children.length, 2,
  "El catálogo debe mostrar el juego disponible y el espacio futuro");
assert.match(elements.get("gameCatalog").children[0].innerHTML, /Mate Arcade/);
assert.match(elements.get("gameCount").textContent, /1 juego disponible/);
assert(fs.existsSync("games/mate-arcade/index.html"), "Debe existir la entrada del juego");

console.log("Portal test OK: catálogo y ruta de Mate Arcade");
