# Juegos Chicos

Colección extensible de juegos educativos para chicos. La raíz del proyecto funciona como portal y cada juego vive en su propia carpeta.

## Abrir la colección

Abrí `index.html`. Desde ahí se accede a todos los juegos disponibles.

No requiere instalación, servidor ni conexión a Internet.

## Estructura

```text
/
├─ index.html                    # Portal y catálogo
├─ games/
│  └─ mate-arcade/
│     ├─ index.html              # Juego
│     ├─ guia-original.html      # Respaldo histórico
│     └─ README.md
├─ tests/
├─ AGENTS.md
└─ README.md
```

## Juegos disponibles

### Mate Arcade

Juego de matemática con:

- Arcade, Práctica y Repaso adaptativo.
- Suma, resta, multiplicación, división, potencias, raíces, múltiplos, divisores, MCD y MCM.
- Microlecciones, mini evaluaciones y acceso a la teoría desde cada error.
- Tabla pitagórica del 1 al 10, cuadrados perfectos y glosario.
- Perfiles, progreso por tema, logros y exportación de datos.

## Agregar un juego

1. Crear una carpeta en `games/nombre-del-juego/`.
2. Colocar su entrada principal en `games/nombre-del-juego/index.html`.
3. Agregar una entrada al arreglo `GAMES` del `index.html` raíz.
4. Añadir sus pruebas en `tests/`.
5. Documentar sus objetivos pedagógicos en su carpeta o en `AGENTS.md`.

## Privacidad

Los juegos guardan el progreso localmente en el navegador. No hay anuncios ni envío de datos a servidores.

## Pruebas

```powershell
node tests\portal-test.js
node tests\smoke-test.js
```

Servidor local opcional:

```powershell
node tests\dev-server.js
```

Después abrí `http://127.0.0.1:8765`.

