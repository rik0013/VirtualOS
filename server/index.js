import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { MongoClient } from 'mongodb';

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key) process.env[key] = value;
  }
}

const PORT = Number(process.env.PORT || 3001);
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/virtualos';
const MONGODB_DB = process.env.MONGODB_DB || 'virtualos';

const mongoClient = new MongoClient(MONGODB_URI);
let usersCollection = null;
let bootstrapPromise = null;

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  });
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
  });
  res.end(text);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function makeDefaultFS(username) {
  return {
    home: {
      [username]: {
        desktop: {
          'readme.txt': 'Welcome to VirtualOS!\n\nThis file lives on your desktop.\nDouble-click to open, drag to reposition.\nRight-click the desktop for options.',
          projects: {},
        },
        documents: { 'notes.txt': 'Your notes go here.' },
        pictures: {},
        downloads: {},
      },
    },
    etc: { hosts: '127.0.0.1 localhost\n::1 localhost' },
    tmp: {},
    trash: {},
  };
}

function makeDefaultPrefs() {
  return { theme: 'dark', wallpaper: 'mesh', iconSize: 'medium' };
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || '').split(':');
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

async function ensureUsersCollection() {
  if (usersCollection) return usersCollection;
  await mongoClient.connect();
  const db = mongoClient.db(MONGODB_DB);
  usersCollection = db.collection('users');
  await usersCollection.createIndex({ username: 1 }, { unique: true });
  return usersCollection;
}

async function bootstrapDefaultUser() {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const users = await ensureUsersCollection();
    const count = await users.countDocuments();
    if (count === 0) {
      await users.insertOne({
        username: 'user',
        passwordHash: hashPassword('user'),
        fs: makeDefaultFS('user'),
        prefs: makeDefaultPrefs(),
        desktopLayout: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  })();
  return bootstrapPromise;
}

async function findUser(username) {
  const users = await ensureUsersCollection();
  return users.findOne({ username });
}

async function loginUser(payload, res) {
  const username = String(payload.username || '').trim();
  const password = String(payload.password || '');
  if (!username || !password) {
    sendJson(res, 400, { error: 'username and password are required' });
    return;
  }

  const user = await findUser(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    sendJson(res, 401, { error: 'Invalid username or password' });
    return;
  }

  sendJson(res, 200, { user: sanitizeUser(user) });
}

async function registerUser(payload, res) {
  const username = String(payload.username || '').trim();
  const password = String(payload.password || '');
  if (!username || !password) {
    sendJson(res, 400, { error: 'username and password are required' });
    return;
  }

  const users = await ensureUsersCollection();
  const existing = await users.findOne({ username });
  if (existing) {
    sendJson(res, 409, { error: 'Username already taken' });
    return;
  }

  const doc = {
    username,
    passwordHash: hashPassword(password),
    fs: makeDefaultFS(username),
    prefs: makeDefaultPrefs(),
    desktopLayout: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await users.insertOne(doc);
  sendJson(res, 201, { user: sanitizeUser(doc) });
}

async function getUserRoute(username, res) {
  if (!username) {
    sendJson(res, 400, { error: 'username is required' });
    return;
  }

  const user = await findUser(username);
  if (!user) {
    sendJson(res, 404, { error: 'User not found' });
    return;
  }

  sendJson(res, 200, { user: sanitizeUser(user) });
}

async function updateUserRoute(username, payload, res) {
  const currentUsername = String(username || '').trim();
  if (!currentUsername) {
    sendJson(res, 400, { error: 'username is required' });
    return;
  }

  const users = await ensureUsersCollection();
  const currentUser = await users.findOne({ username: currentUsername });
  if (!currentUser) {
    sendJson(res, 404, { error: 'User not found' });
    return;
  }

  const requestedUsername = typeof payload.username === 'string' ? payload.username.trim() : '';
  const requestedPassword = typeof payload.password === 'string' ? payload.password : '';
  const currentPassword = typeof payload.currentPassword === 'string' ? payload.currentPassword : '';
  const updates = {};

  if (requestedUsername && requestedUsername !== currentUsername) {
    const usernameTaken = await users.findOne({ username: requestedUsername });
    if (usernameTaken) {
      sendJson(res, 409, { error: 'Username already taken' });
      return;
    }
    if (!currentPassword || !verifyPassword(currentPassword, currentUser.passwordHash)) {
      sendJson(res, 401, { error: 'Current password is incorrect' });
      return;
    }
    updates.username = requestedUsername;
  }

  if (requestedPassword) {
    if (!currentPassword || !verifyPassword(currentPassword, currentUser.passwordHash)) {
      sendJson(res, 401, { error: 'Current password is incorrect' });
      return;
    }
    updates.passwordHash = hashPassword(requestedPassword);
  }

  if (payload.fs !== undefined) updates.fs = payload.fs;
  if (payload.prefs !== undefined) updates.prefs = payload.prefs;
  if (payload.desktopLayout !== undefined) updates.desktopLayout = payload.desktopLayout;

  if (Object.keys(updates).length === 0) {
    sendJson(res, 200, { user: sanitizeUser(currentUser) });
    return;
  }

  updates.updatedAt = new Date();

  const result = await users.findOneAndUpdate(
    { username: currentUsername },
    { $set: updates },
    { returnDocument: 'after' }
  );

  const updatedUser = result?.value;
  if (!updatedUser) {
    sendJson(res, 404, { error: 'User not found' });
    return;
  }

  sendJson(res, 200, { user: sanitizeUser(updatedUser) });
}

async function handleGroqChat(req, res) {
  if (!GROQ_API_KEY) {
    sendJson(res, 400, {
      error: 'Missing GROQ_API_KEY. Set it in server/.env before calling the AI endpoint.',
    });
    return;
  }

  let payload;
  try {
    payload = await readBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (messages.length === 0) {
    sendJson(res, 400, { error: 'messages must be a non-empty array' });
    return;
  }

  const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: payload.model || GROQ_MODEL,
      messages,
      temperature: payload.temperature ?? 0.7,
      max_tokens: payload.max_tokens ?? 1024,
    }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    sendJson(res, upstream.status, data);
    return;
  }

  sendJson(res, 200, data);
}

await bootstrapDefaultUser();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    });
    res.end();
    return;
  }

  if (url.pathname === '/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    const payload = await readBody(req).catch((error) => ({ __error: error }));
    if (payload.__error) {
      sendJson(res, 400, { error: payload.__error.message });
      return;
    }
    await loginUser(payload, res);
    return;
  }

  if (url.pathname === '/api/auth/register' && req.method === 'POST') {
    const payload = await readBody(req).catch((error) => ({ __error: error }));
    if (payload.__error) {
      sendJson(res, 400, { error: payload.__error.message });
      return;
    }
    await registerUser(payload, res);
    return;
  }

  if (url.pathname.startsWith('/api/users/')) {
    const username = decodeURIComponent(url.pathname.replace('/api/users/', ''));

    if (req.method === 'GET') {
      await getUserRoute(username, res);
      return;
    }

    if (req.method === 'PUT') {
      const payload = await readBody(req).catch((error) => ({ __error: error }));
      if (payload.__error) {
        sendJson(res, 400, { error: payload.__error.message });
        return;
      }
      await updateUserRoute(username, payload, res);
      return;
    }
  }

  if (url.pathname === '/api/ai/chat' && req.method === 'POST') {
    await handleGroqChat(req, res);
    return;
  }

  sendText(res, 404, 'Not found');
});

server.listen(PORT, () => {
  console.log(`VirtualOS API server listening on http://localhost:${PORT}`);
});
