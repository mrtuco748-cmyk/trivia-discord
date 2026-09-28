// Servidor local de la trivia: pantalla + control remoto por celular.
// Uso: npm start -> http://localhost:3000
//   OBS (fuente de navegador): http://localhost:3000/overlay.html?obs=1
//   Celular (misma WiFi):      http://TU-IP:3000/control.html
// Sin dependencias: solo Node.js estándar (EventSource + POST).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 3000;
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.txt': 'text/plain',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4', '.webm': 'video/webm'
};

const clients = new Set();
function broadcast(obj) {
  const msg = `data: ${JSON.stringify(obj)}\n\n`;
  for (const res of clients) { try { res.write(msg); } catch { clients.delete(res); } }
}

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Canal de eventos para el overlay (OBS)
  if (url === '/api/stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache',
      'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*'
    });
    res.write(': conectado\n\n');
    clients.add(res);
    const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch {} }, 25000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  // Comandos del control remoto (celular)
  if (url === '/api/cmd' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 4096) req.destroy(); });
    req.on('end', () => {
      try {
        const m = JSON.parse(body || '{}');
        if (typeof m.cmd === 'string') broadcast({ cmd: m.cmd, arg: m.arg });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch {
        res.writeHead(400); res.end('{}');
      }
    });
    return;
  }

  // Archivos estáticos
  let p = url === '/' ? '/index.html' : decodeURIComponent(url);
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('No encontrado'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Trivia en http://localhost:${PORT} — control: /control.html`));
