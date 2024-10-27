const http = require('http');
const {Command} = require('commander');
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
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello world\n');
});
server.listen(port, host, () => {
});
