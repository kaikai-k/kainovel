const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8787;
const ROOT = __dirname;
const SETTINGS_FILE = path.join(ROOT, 'shared-settings.json');

const MIME = {
  '.html':'text/html; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.svg':'image/svg+xml'
};

function serveFile(res, filePath){
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data)=>{
    if(err){
      res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
      res.end('Not found');
      return;
    }
    res.writeHead(200, {'Content-Type':MIME[ext]||'application/octet-stream'});
    res.end(data);
  });
}

const server = http.createServer((req,res)=>{
  if(req.url === '/api/settings' && req.method === 'GET'){
    if(!fs.existsSync(SETTINGS_FILE)){
      res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
      res.end('{}');
      return;
    }
    return serveFile(res, SETTINGS_FILE);
  }

  if(req.url === '/api/settings' && req.method === 'POST'){
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', ()=>{
      try{
        JSON.parse(body || '{}');
        fs.writeFileSync(SETTINGS_FILE, body || '{}', 'utf8');
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
        res.end('{"ok":true}');
      }catch(err){
        res.writeHead(400, {'Content-Type':'application/json; charset=utf-8'});
        res.end('{"ok":false,"error":"invalid json"}');
      }
    });
    return;
  }

  const requested = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(ROOT, requested.replace(/^\/+/, ''));
  if(!filePath.startsWith(ROOT)){
    res.writeHead(403, {'Content-Type':'text/plain; charset=utf-8'});
    res.end('Forbidden');
    return;
  }
  serveFile(res, filePath);
});

server.listen(PORT, ()=>{
  console.log(`Server running at http://localhost:${PORT}`);
});
