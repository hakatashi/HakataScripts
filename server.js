const http = require('http');
const serveStatic = require('serve-static');

const serve = serveStatic('.', {
  setHeaders: (res, path) => {
    res.setHeader('Content-Security-Policy', "default-src 'self' https://cdn.jsdelivr.net/");
  },
});

const server = http.createServer((req, res) => {
  serve(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
});

// Listen
server.listen(3000);
