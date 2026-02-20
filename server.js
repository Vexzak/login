const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const users = new Map();
const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css'};

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/auth/signup') {
    let b = ''; req.on('data', c => b += c); req.on('end', () => {
      const { name, email, password } = JSON.parse(b);
      if (users.has(email)) { res.writeHead(400, {'Content-Type':'application/json'}); return res.end(JSON.stringify({message:'Email already used.'})); }
      users.set(email, { name, email, password });
      res.writeHead(201, {'Content-Type':'application/json'}); res.end(JSON.stringify({message:'ok', user:{name, email}}));
    }); return;
  }
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    let b = ''; req.on('data', c => b += c); req.on('end', () => {
      const { email, password } = JSON.parse(b);
      const user = users.get(email);
      if (!user || user.password !== password) { res.writeHead(401, {'Content-Type':'application/json'}); return res.end(JSON.stringify({message:'Invalid email or password.'})); }
      res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify({message:'ok', user:{name:user.name, email:user.email}}));
    }); return;
  }
  if (req.method === 'POST' && req.url === '/api/auth/logout') {
    res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify({message:'ok'})); return;
  }
  let fp = req.url === '/' ? '/signup.html' : url.parse(req.url).pathname;
  fp = path.join(__dirname, fp);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type': mime[path.extname(fp)] || 'text/plain'}); res.end(data);
  });
}).listen(3000, () => {
  console.log('Server running! Go to: http://localhost:3000/signup.html');
});