const http = require('http');
const fs = require('fs').promises; 
const path = require('path');
const program = require('commander');
const superagent = require('superagent');

program
  .requiredOption('-h, --host <host>', 'Server host address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <cachePath>', 'Cache directory path')
  .parse(process.argv);
const { host, port, cache } = program.opts();

const sendResponse = (res, statusCode, contentType, message) => {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(message);
};

const ensureCacheDirectory = async () => {
  try {
    await fs.access(cache);
  } catch {
    await fs.mkdir(cache, { recursive: true });
  }
};

const server = http.createServer(async (req, res) => {
  const code = req.url.slice(1); 
  const filePath = path.join(cache, `${code}.jpg`);

  try {
    if (req.method == 'GET') {
      const image = await fs.readFile(filePath);
      sendResponse(res, 200, 'image/jpeg', image);
    } else if (req.method == 'PUT') {
      try {
        await fs.access(filePath); 
        sendResponse(res, 200, 'text/plain', 'Image already exists in cache');
      } catch {
        const { body: imageBuffer } = await superagent.get(`https://http.cat/${code}`);
        await fs.writeFile(filePath, imageBuffer);
        sendResponse(res, 201, 'text/plain', 'Image saved successfully');
      }
    } else if (req.method == 'DELETE') {
      await fs.unlink(filePath);
      sendResponse(res, 200, 'text/plain', 'Image deleted successfully');
    } else {
      sendResponse(res, 405, 'text/plain', '405 Method Not Allowed');
    }
  } catch (error) {
    console.error('Error:', error.message);
    sendResponse(res, 404, 'text/plain', '404 Not Found');
  }
});

ensureCacheDirectory().then(() => {
  server.listen(port, host, () => {
    console.log(`http://${host}:${port}`);
  });
});
