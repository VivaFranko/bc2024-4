const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');
const superagent = require('superagent');
const program = new Command();
program
  .requiredOption('-h, --host <host>', 'Server host address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <cachePath>', 'Cache directory path');
const args = process.argv.slice(2);
if (!args.includes('-h') && !args.includes('--host'), 
    !args.includes('-p') && !args.includes('--port'), 
    !args.includes('-c') && !args.includes('--cache')) {
  console.log('Please specify parameter');
  process.exit(1); 
}
program.parse(process.argv);
const { host, port, cache } = program.opts();
console.log(`Starting server at http://${host}:${port}`);
const sendResponse = (res, statusCode, contentType, message) => {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(message);
};
const server = http.createServer(async (req, res) => {
  const urlPath = req.url;
  const code = urlPath.slice(1); 
  const filePath = path.join(cache, `${code}.jpg`); 
  switch (req.method) {
    case 'GET':
        try {
            const image = await fs.readFile(filePath);
            sendResponse(res, 200, 'image/jpeg', image);
          } catch (error) {
            sendResponse(res, 404, 'text/plain', '404 Not Found');
          }
      break;
    case 'PUT':
    case 'DELETE':
  }
});
server.listen(port, host, () => {
});