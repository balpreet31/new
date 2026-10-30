import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createConnection } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = path.join(root, '.data', 'mongo');
const runtimePath = path.join(root, '.runtime');
const port = 27018;
const executable = process.env.MONGOD_PATH || 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';
if (!existsSync(executable)) throw new Error('MongoDB binary unavailable. Set MONGOD_PATH to the installed mongod executable.');

const occupied = await new Promise(resolve => {
  const socket = createConnection({ host: '127.0.0.1', port });
  socket.setTimeout(1000);
  socket.once('connect', () => { socket.destroy(); resolve(true); });
  socket.once('error', () => { socket.destroy(); resolve(false); });
  socket.once('timeout', () => { socket.destroy(); resolve(false); });
});
if (occupied) {
  console.log(`Port ${port} is already in use. No process was started or changed. Configure MONGODB_URI for your existing database.`);
  process.exit(0);
}
await mkdir(dbPath, { recursive: true });
await mkdir(runtimePath, { recursive: true });
const child = spawn(executable, ['--bind_ip', '127.0.0.1', '--port', String(port), '--dbpath', dbPath,
  '--logpath', path.join(runtimePath, 'mongo.log'), '--logappend'], { cwd: root, windowsHide: true, stdio: 'ignore' });
child.once('error', () => {
  console.error('Could not start the local MongoDB process.');
  process.exitCode = 1;
});
child.once('spawn', async () => {
  await writeFile(path.join(runtimePath, 'mongo-owned.json'), JSON.stringify({ pid: child.pid, executable, port, dbPath }, null, 2));
  console.log(`Owned MongoDB process ${child.pid} started on 127.0.0.1:${port}. Logs: .runtime/mongo.log`);
});
child.once('exit', code => {
  console.log(`Owned MongoDB process exited with code ${code}.`);
  process.exitCode = code || 0;
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { child.kill('SIGTERM'); });
