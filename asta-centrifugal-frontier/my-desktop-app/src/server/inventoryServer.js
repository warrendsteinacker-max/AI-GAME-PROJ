import express from 'express';
import https from 'https';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const HOST = '0.0.0.0';

let db = { inventory: [], purchases: [], scans: [] };

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  const pick = (test) => {
    for (const n in ifaces)
      for (const net of ifaces[n])
        if (net.family === 'IPv4' && !net.internal && test(net.address, n))
          return net.address;
    return null;
  };
  return (
    pick((a, n) => a.startsWith('192.168.') && !a.startsWith('192.168.137.') && !/tailscale/i.test(n)) ||
    pick((a, n) => a.startsWith('10.')       && !/tailscale/i.test(n)) ||
    pick((a, n) =>                              !/tailscale/i.test(n)) ||
    'localhost'
  );
}

function printDB() {
  console.log(`  [DB] inventory:${db.inventory.length} purchases:${db.purchases.length} scans:${db.scans.length}`);
}

export function startInventoryServer(resourcesPath) {
  const expressApp = express();

  // Cert path works in both dev and packaged
  const certsDir = resourcesPath
    ? path.join(resourcesPath, 'app.asar.unpacked', 'src', 'server', 'certs')
    : path.join(__dirname, 'certs');

  const certPath = path.join(certsDir, 'cert.pem');
  const keyPath  = path.join(certsDir, 'key.pem');

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('[INVENTORY] SSL certs not found at:', certsDir);
    console.error('[INVENTORY] Run: openssl req -x509 -newkey rsa:2048 -keyout src/server/certs/key.pem -out src/server/certs/cert.pem -days 365 -nodes -subj "/CN=YOUR_WIFI_IP"');
    return null;
  }

  expressApp.use(express.json());
  expressApp.use(express.text());

  // CORS — allow all origins (phones on hotspot)
  expressApp.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // Request logger
  expressApp.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });

  // Serve frontend HTML to phones
  expressApp.get('/', (req, res) => {
    const frontendPath = resourcesPath
      ? path.join(resourcesPath, 'app.asar.unpacked', 'src', 'server', 'frontend', 'index.html')
      : path.join(__dirname, 'frontend', 'index.html');

    if (fs.existsSync(frontendPath)) {
      res.sendFile(frontendPath);
    } else {
      res.status(404).send('<h2>Frontend not found. Place index.html in src/server/frontend/</h2>');
    }
  });

  expressApp.get('/favicon.ico', (req, res) => res.sendStatus(204));

  // PING
  const localIP = getLocalIP();
  expressApp.get('/api/ping', (req, res) => {
    res.json({ status: 'online', message: 'HTTPS confirmed — camera enabled', ip: localIP, port: PORT });
  });

  // INVENTORY
  expressApp.get('/api/inventory', (req, res) => res.json(db.inventory));

  expressApp.post('/api/inventory', (req, res) => {
    const { barcode, name } = req.body || {};
    if (!barcode || !name) return res.status(400).json({ error: 'barcode and name required' });
    const existing = db.inventory.find(i => i.barcode === barcode);
    if (existing) {
      existing.name = name;
      existing.updatedAt = new Date().toISOString();
      printDB();
      return res.json({ action: 'updated', item: existing });
    }
    const item = { id: `inv_${Date.now()}`, barcode, name, createdAt: new Date().toISOString() };
    db.inventory.unshift(item);
    printDB();
    res.status(201).json({ action: 'created', item });
  });

  expressApp.delete('/api/inventory/:id', (req, res) => {
    const before = db.inventory.length;
    db.inventory = db.inventory.filter(i => i.id !== req.params.id);
    if (db.inventory.length === before) return res.status(404).json({ error: 'not found' });
    printDB();
    res.json({ status: 'deleted' });
  });

  // PURCHASES
  expressApp.get('/api/purchases', (req, res) => res.json(db.purchases));

  expressApp.post('/api/purchases', (req, res) => {
    const { barcode, name } = req.body || {};
    if (!barcode || !name) return res.status(400).json({ error: 'barcode and name required' });
    const entry = { id: `pur_${Date.now()}`, barcode, name, loggedAt: new Date().toISOString() };
    db.purchases.unshift(entry);
    if (!db.inventory.find(i => i.barcode === barcode))
      db.inventory.unshift({ id: `inv_${Date.now()}`, barcode, name, createdAt: new Date().toISOString() });
    printDB();
    res.status(201).json({ action: 'logged', entry });
  });

  expressApp.delete('/api/purchases/:id', (req, res) => {
    const before = db.purchases.length;
    db.purchases = db.purchases.filter(i => i.id !== req.params.id);
    if (db.purchases.length === before) return res.status(404).json({ error: 'not found' });
    printDB();
    res.json({ status: 'deleted' });
  });

  // SCANS
  expressApp.get('/api/scans', (req, res) => res.json(db.scans));

  expressApp.post('/api/scans', (req, res) => {
    const { barcode, camera, device } = req.body || {};
    if (!barcode) return res.status(400).json({ error: 'barcode required' });
    const scan = { id: `scan_${Date.now()}`, barcode, camera: camera || 'unknown', device: device || 'unknown', scannedAt: new Date().toISOString() };
    db.scans.unshift(scan);
    printDB();
    res.status(201).json(scan);
  });

  // 404
  expressApp.use((req, res) => {
    res.status(404).json({ error: `no route: ${req.method} ${req.url}` });
  });

  // Start HTTPS
  const server = https.createServer(
    { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) },
    expressApp
  ).listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(50));
    console.log('  HTTPS INVENTORY SERVER LIVE');
    console.log(`  Local  : https://localhost:${PORT}`);
    console.log(`  Phone  : https://${localIP}:${PORT}  ← connect phones here`);
    console.log('='.repeat(50));
    console.log('  First time on phone: tap Advanced → Proceed\n');
  });

  return server;
}