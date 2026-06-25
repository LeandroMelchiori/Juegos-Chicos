# Juegos Chicos — guía para Claude

## Qué es esto

Colección de juegos educativos para chicos. El `index.html` raíz es el portal/catálogo. Cada juego vive en `games/<slug>/` y es completamente autocontenido.

## Comandos y herramientas

Requisito único: **Node.js**. No hay `package.json`, ni `npm install`, ni paso de build ni dependencias externas — todo es HTML/CSS/JS vanilla y los tests usan solo módulos nativos de Node (`vm`, `assert`, `fs`, `http`).

```powershell
# Correr toda la validación (portal + calidad + smoke)
node tests\run-all.js

# Servidor local de desarrollo en http://127.0.0.1:8765
node tests\dev-server.js
```

### Tests individuales

Cada test es ejecutable por separado con `node tests\<archivo>.js`:

| Archivo | Qué valida |
|---|---|
| `tests\run-all.js` | Orquesta los tres tests en orden e imprime `Validación completa OK`. |
| `tests\portal-test.js` | El `index.html` raíz: que exista el catálogo, que enlace a Mate Arcade, que el arreglo `GAMES` renderice las tarjetas y el conteo correcto, y que exista la ruta del juego. Ejecuta el script del portal en un DOM simulado con `vm`. |
| `tests\mate-arcade-quality-test.js` | Chequeos estáticos sobre los archivos de Mate Arcade: sin IDs duplicados, CSS y JS fuera del HTML, sin `fetch`/`XMLHttpRequest` ni `@import` de red (offline real), enlace de regreso al portal, accesibilidad (`aria-live`, `aria-modal`, pestañas con `aria-controls` y flechas), recursos versionados con `?v=`, y vocabulario apropiado para chicos (prohíbe términos como "dominio", "precisión", "adaptativo"). |
| `tests\smoke-test.js` | Ejecuta `lessons.js` + `app.js` dentro de un DOM/`localStorage`/`AudioContext` simulados y recorre el juego de punta a punta: inicio y perfiles, las 10 microlecciones, Arcade/Práctica/Repaso, pausa, respuestas escritas y de opción, abrir la lección desde una corrección, exportación, normalización de importaciones maliciosas (`sanitizeImportedStore`), diagnóstico de errores, reaparición espaciada (`queueRetry`/`chooseOp`) y generación de problemas para las 10 operaciones × 3 dificultades. |

### Servidor de desarrollo

`tests\dev-server.js` levanta un HTTP estático en `127.0.0.1:8765` con `Cache-Control: no-store` (sirve el repo entero desde la raíz, con protección contra path traversal). Útil para probar lo que no se puede abriendo el archivo directamente; igualmente el juego debe funcionar también con `file://`.

> Nota de entorno: el shell por defecto es PowerShell. Las rutas en Windows usan `\`. No existe `npm test` — usar siempre `node tests\run-all.js`.

## Estructura del repositorio

```
/
├─ index.html                    # Portal y catálogo
├─ games/
│  └─ mate-arcade/
│     ├─ index.html              # Entrada distribuible del juego
│     ├─ styles.css
│     ├─ js/
│     │  ├─ lessons.js           # Contenido pedagógico
│     │  └─ app.js               # Lógica, progreso y accesibilidad
│     └─ guia-original.html      # Respaldo histórico (no modificar)
├─ tests/
│  ├─ run-all.js                 # Corre todo
│  ├─ portal-test.js
│  ├─ mate-arcade-quality-test.js
│  └─ smoke-test.js
├─ AGENTS.md
└─ README.md
```

## Reglas de arquitectura

- Un juego no puede depender del código interno de otro.
- Las claves de `localStorage` deben estar prefijadas por juego (evitar colisiones).
- Las dependencias de red no pueden ser obligatorias — todo funciona offline.
- Los juegos funcionan tanto al abrir directamente el HTML como desde servidor local.
- Para agregar un juego: crear `games/<slug>/`, agregar entrada al arreglo `GAMES` en `index.html` raíz, y añadir pruebas en `tests/`.

## Principios pedagógicos (respetar siempre)

- Cada error ofrece una explicación breve, concreta y accionable.
- La práctica inicial no castiga el error.
- La dificultad cambia el razonamiento requerido, no solo la velocidad.
- Las consignas usan español rioplatense claro y apropiado para chicos.
- Los distractores representan errores plausibles.
- La teoría nunca se bloquea detrás de puntajes o logros.
- El progreso ayuda a elegir qué reforzar, no etiqueta al alumno.

## Principios de diseño (respetar siempre)

- Mobile first, botones táctiles grandes, navegación completa con teclado.
- Respetar `prefers-reduced-motion`, permitir zoom, ofrecer alternativas de contraste.
- Los cambios importantes se anuncian con regiones `aria-live`.
- Evitar páginas largas: dividir en pasos, pestañas o pantallas.
- Las pantallas iniciales muestran solo decisiones esenciales.

## Mate Arcade — notas específicas

- Entrada: `games/mate-arcade/index.html`.
- Progreso guardado bajo la clave `mateArcadeDataV2`.
- Modo Práctica: sin tiempo ni vidas.
- Modo Repaso: prioriza temas débiles, ajusta dificultad con evidencia y reintroduce errores de forma espaciada.
- Desde una corrección se puede abrir directamente la lección correspondiente.
- `guia-original.html` es un respaldo histórico — no modificar ni eliminar.

## Control de versiones (Git)

- **Preguntar siempre antes de hacer `commit` y antes de hacer `push`.** No commitear ni pushear sin confirmación explícita.
- Los mensajes de commit son **breves y explicativos**: una línea que describa el qué y el porqué del cambio.
- **No incluir referencias a que el cambio fue hecho con IA** (sin firmas, sin "Co-Authored-By", sin menciones a asistentes).
- Escribir los mensajes en español, en el mismo estilo del historial del repo.

## Checklist de validación antes de commitear

- [ ] `node tests\run-all.js` pasa sin errores.
- [ ] El catálogo y todas sus rutas funcionan.
- [ ] El juego modificado funciona de forma independiente.
- [ ] Funciona con teclado, en vista móvil y sin conexión.
- [ ] El botón de regreso vuelve al portal.
- [ ] En Mate Arcade: modos, perfiles, progreso, pausa, respuestas y material de estudio.
