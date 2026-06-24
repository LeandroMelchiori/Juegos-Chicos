# Juegos Chicos — guía de desarrollo

## Objetivo

Juegos Chicos es una colección de experiencias educativas para aprender jugando. Cada juego debe ser comprensible, seguro, motivador y pedagógicamente intencional.

## Arquitectura del repositorio

- `index.html` es exclusivamente el portal y catálogo de la colección.
- Cada juego vive en `games/<slug>/`.
- La entrada de cada juego es `games/<slug>/index.html`.
- Un juego no debe depender del código interno de otro.
- Para sumar un juego se agrega una entrada al arreglo `GAMES` del portal.
- Los juegos deben funcionar al abrir los archivos directamente y también desde un servidor local.
- Las dependencias de red no pueden ser obligatorias.
- Las claves de `localStorage` deben estar identificadas por juego para evitar colisiones.

## Principios pedagógicos

- Cada error debe ofrecer una explicación breve, concreta y accionable.
- La práctica inicial no debe convertir el error en castigo.
- La dificultad debe cambiar el razonamiento requerido, no solamente la velocidad.
- Las consignas deben usar español rioplatense claro y apropiado para chicos.
- Los distractores deben representar errores plausibles.
- La teoría nunca se bloquea detrás de puntajes o logros.
- Las lecciones combinan lenguaje, representación visual, procedimiento, práctica y síntesis.
- El progreso debe ayudar a elegir qué reforzar, no etiquetar al alumno.

## Principios de diseño

- Mobile first, botones táctiles grandes y navegación completa con teclado.
- El portal debe permitir reconocer y abrir cada juego con rapidez.
- Las pantallas iniciales muestran decisiones esenciales; la configuración avanzada vive aparte.
- Evitar páginas excesivamente largas cuando el contenido pueda dividirse en pasos, pestañas o pantallas.
- Respetar `prefers-reduced-motion`, permitir zoom y ofrecer alternativas de contraste.
- Los cambios importantes deben anunciarse mediante regiones `aria-live`.
- Perfiles, estadísticas y logros deben ser comprensibles para chicos y adultos acompañantes.

## Mate Arcade

- El juego distribuible vive en `games/mate-arcade/index.html`.
- `games/mate-arcade/guia-original.html` se conserva como respaldo histórico.
- El progreso usa la clave versionada `mateArcadeDataV2`.
- Práctica no usa tiempo ni vidas.
- Repaso prioriza temas débiles, ajusta dificultad con evidencia y reintroduce errores de forma espaciada.
- Desde una corrección se puede abrir directamente la lección correspondiente.

## Validación mínima

- Comprobar el catálogo y todas sus rutas.
- Comprobar sintaxis JavaScript e IDs duplicados.
- Probar cada juego de forma independiente.
- Probar teclado, vista móvil y funcionamiento offline.
- Probar que el botón de regreso de cada juego vuelva al portal.
- En Mate Arcade: probar modos, perfiles, progreso, pausa, respuestas y material de estudio.

