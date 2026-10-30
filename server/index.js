import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { createMongoLeadRepository, Lead } from './repository.js';

const port = Number(process.env.API_PORT || process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid server port.');
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/probay';
if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) throw new Error('Production requires an explicit MONGODB_URI.');
const webhookUrl = process.env.LEAD_WEBHOOK_URL || '';
if (webhookUrl) {
  const parsed = new URL(webhookUrl);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Webhook must be an HTTPS URL without embedded credentials.');
}
const configuredOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
const allowOrigins = process.env.NODE_ENV === 'production' ? configuredOrigins : [...new Set([...configuredOrigins, 'http://127.0.0.1:5173', 'http://localhost:5173'])];
const repository = createMongoLeadRepository({ webhookEnabled: Boolean(webhookUrl) });
const app = createApp({ repository, allowOrigins, webhookUrl });
const server = app.listen(port, host, () => console.log(`Probay API: http://${host}:${port}`));

let stopping = false;
async function connectDatabase() {
  if (stopping) return;
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10, autoIndex: true });
    await Lead.init();
    console.log('Lead database ready.');
  } catch {
    console.warn('Lead database unavailable; enquiry requests return 503 until it is connected.');
    if (!stopping) setTimeout(connectDatabase, 10000).unref();
  }
}
void connectDatabase();
async function stop() {
  stopping = true;
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
