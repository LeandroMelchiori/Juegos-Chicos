# Mate Arcade — guía de desarrollo

## Objetivo

Mate Arcade es un juego educativo de matemática para chicos. Debe combinar práctica, explicación y motivación sin convertir el error en castigo.

## Principios pedagógicos

- Cada error debe ofrecer una explicación breve, concreta y accionable.
- El modo Práctica no usa presión de tiempo ni vidas.
- El modo Repaso prioriza los temas con menor dominio del perfil activo.
- El modo Repaso ajusta la dificultad con evidencia histórica y no debe subirla con pocos intentos.
- La dificultad debe cambiar los números y el razonamiento requerido, no solo la velocidad.
- Las consignas deben usar español rioplatense claro y apropiado para niños.
- Evitar distractores absurdos: las respuestas incorrectas deben representar errores plausibles.
- Nunca bloquear el acceso a la teoría detrás de puntajes o logros.
- Cada lección debe combinar lenguaje, representación visual, procedimiento, práctica y síntesis.
- Las mini evaluaciones de estudio deben orientar y registrar progreso sin quitar vidas ni imponer tiempo.
- Desde una corrección debe poder abrirse directamente la lección del concepto involucrado.

## Principios de diseño

- Mobile first, botones táctiles grandes y navegación completa con teclado.
- La pantalla principal debe mostrar solo decisiones esenciales; la configuración avanzada vive en una pantalla separada.
- Las lecciones se presentan de una en una y por capas para evitar desplazamiento excesivo.
- Respetar `prefers-reduced-motion`, permitir alto contraste y no impedir el zoom.
- Los cambios importantes deben anunciarse mediante regiones `aria-live`.
- El juego debe seguir funcionando al abrir el HTML directamente y sin servidor.
- No introducir dependencias obligatorias de red.
- Perfiles, estadísticas y logros deben ser comprensibles para chicos y adultos acompañantes.

## Arquitectura

- El producto distribuible vive en `mate-arcade.html` y debe continuar siendo autocontenido.
- `mate-arcade-guia.html` se conserva como respaldo histórico/imprimible, pero el juego no debe depender de él.
- El progreso se guarda en `localStorage` con tolerancia a entornos donde no esté disponible.
- Los datos persistidos deben versionarse y cargarse con valores por defecto para mantener compatibilidad.

## Validación mínima

- Comprobar sintaxis JavaScript.
- Comprobar que no haya IDs duplicados.
- Probar los tres modos: Arcade, Práctica y Repaso.
- Probar respuestas por opciones y escritas.
- Probar creación y cambio de perfil.
- Probar renombrado, eliminación, exportación e importación de perfiles.
- Probar pausa automática y manual.
- Probar impresión de la guía y funcionamiento sin conexión.
