# Trivia Discord + OBS

Overlay de trivia para mostrar sobre tu cámara en Discord (vía OBS Cámara virtual).

- `overlay.html` → overlay principal (úsalo en OBS como fuente de navegador, o abre `/overlay` en Vercel)
- `index.html` → pantalla simple para compartir ventana
- `preguntas.json` → edita tus preguntas aquí
- `media/` → pon tus audios/videos aquí (ver `media/LEEME.txt`)
- `server.js` → servidor local opcional (`npm start`)

Despliegue en Vercel: importa el repo, deja `Root Directory` en `./` (raíz),
Framework Preset en `Other`, y despliega. Rutas: `/` y `/overlay`.
