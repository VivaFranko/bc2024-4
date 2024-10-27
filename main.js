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
        try {
            await fs.access(filePath);
            sendResponse(res, 200, 'text/plain', 'Image already exists in cache');
          } catch (error) {
            // Якщо файл не існує, отримуємо зображення з http.cat
            try {
              const response = await superagent.get(`https://http.cat/${code}`);
              const imageBuffer = response.body; // Отримуємо зображення
              await fs.writeFile(filePath, imageBuffer); // Зберігаємо зображення у кеш
              sendResponse(res, 201, 'text/plain', 'Image saved successfully');
            } catch (error) {
              sendResponse(res, 404, 'text/plain', '404 Not Found');
            }
          }
          break;
    case 'DELETE':
        try {
            await fs.unlink(filePath); // Видаляємо файл з кешу
            sendResponse(res, 200, 'text/plain', 'Image deleted successfully');
          } catch (error) {
            sendResponse(res, 404, 'text/plain', '404 File not found');
          }
          break;
        default:
          sendResponse(res, 405, 'text/plain', '405 Method Not Allowed');
          break;
  }
});
server.listen(port, host, () => {
});