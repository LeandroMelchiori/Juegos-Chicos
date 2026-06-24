# Mate Arcade

Juego educativo de matemática, autocontenido y pensado para abrirse directamente en un navegador.

## Abrir el juego

Abrí `mate-arcade.html`. No requiere instalación, servidor ni conexión a Internet.

## Modos

- **Arcade:** tiempo, vidas, puntaje y combos.
- **Práctica:** sesiones configurables, sin tiempo ni vidas.
- **Repaso:** selecciona con más frecuencia los temas débiles y ajusta su dificultad según el progreso.

La pantalla principal mantiene solo las decisiones esenciales. Operaciones, niveles y preferencias viven en **Personalizar**.

## Funciones educativas

- Suma, resta, multiplicación, división, potencias, raíces, múltiplos, divisores, MCD y MCM.
- Respuestas por opciones, escritas, verdadero/falso, números faltantes, situaciones redactadas y preguntas sobre procedimientos.
- Pistas, soluciones explicadas y avisos sobre errores frecuentes.
- Diez microlecciones con objetivos, conocimientos previos, modelos visuales, pasos, cálculo mental y resúmenes.
- Mini evaluaciones guardadas por perfil y una ruta de estudio sugerida.
- Acceso directo desde cada error del juego a la lección correspondiente.
- Guía de estudio completa, glosario e impresión desde el juego.
- Navegación de una lección por vez con pestañas Entender, Resolver y Practicar.
- Herramientas separadas con tabla pitagórica interactiva del 1 al 10.
- Perfiles, estadísticas por tema, logros y progreso exportable.

## Privacidad

Todo el progreso permanece en el navegador mediante `localStorage`. El juego no envía información a servidores.

## Pruebas

Con Node.js instalado:

```powershell
node tests\smoke-test.js
```

Para servirlo localmente durante el desarrollo:

```powershell
node tests\dev-server.js
```

Luego abrí `http://127.0.0.1:8765`.

Las reglas técnicas y pedagógicas del proyecto están en `AGENTS.md`.
