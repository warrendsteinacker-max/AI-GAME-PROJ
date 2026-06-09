import express from 'express';
import https from 'https';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { app } from 'electron';

const PORT = 3000;
const HOST = '0.0.0.0';

// In-memory database
let db = {
  inventory: [],
  purchases: [],
  scans: []
};

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  const pick = (test) => {
    for (const n in ifaces)
      for (const net of ifaces[n])
        if (net.family === 'IPv4' && !net.internal && test(net.address, n)) return net.address;
    return null;
  };
  return (
    pick((a, n) => a.startsWith('192.168.') && !a.startsWith('192.168.137.') && !/tailscale/i.test(n)) ||
    pick((a, n) => a.startsWith('10.') && !/tailscale/i.test(n)) ||
    pick((a, n) => !/tailscale/i.test(n)) ||
    'localhost'
  );
}

function printDB() {
  console.log(`  [DB] inventory:${db.inventory.length} purchases:${db.purchases.length} scans:${db.scans.length}`);
}

export function startInventoryServer() {
  const expressApp = express();

  // Resolve cert path — works both in dev and in packaged app
  const certsDir = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'src', 'server', 'certs')
    : path.join(process.cwd(), 'src', 'server', 'certs');

  const certPath = path.join(certsDir, 'cert.pem');
  const keyPath  = path.join(certsDir, 'key.pem');

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('[INVENTORY] SSL certs not found at:', certsDir);
    console.error('[INVENTORY] Run: npm run gen-certs   (see package.json scripts)');
    return null;
  }

  expressApp.use(express.json());
  expressApp.use(express.text());

  // CORS
  expressApp.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // Serve the frontend HTML (phones connect to this)
  const frontendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'src', 'server', 'frontend', 'index.html')
    : path.join(process.cwd(), 'src', 'server', 'frontend', 'index.html');

  expressApp.get('/', (req, res) => {
    if (fs.existsSync(frontendPath)) {
      res.sendFile(frontendPath);
    } else {
      res.send('<h1>Inventory Server Running</h1><p>Place index.html in src/server/frontend/</p>');
    }
  });

  const localIP = getLocalIP();

  expressApp.get('/api/ping', (req, res) => {
    res.json({ status: 'online', ip: localIP, port: PORT });
  });

  // INVENTORY
  expressApp.get('/api/inventory', (req, res) => res.json(db.inventory));
  expressApp.post('/api/inventory', (req, res) => {
    const { barcode, name } = req.body || {};
    if (!barcode || !name) return res.status(400).json({ error: 'barcode and name required' });
    const existing = db.inventory.find(i => i.barcode === barcode);
    if (existing) { existing.name = name; existing.updatedAt = new Date().toISOString(); printDB(); return res.json({ action: 'updated', item: existing }); }
    const item = { id: `inv_${Date.now()}`, barcode, name, createdAt: new Date().toISOString() };
    db.inventory.unshift(item); printDB();
    res.status(201).json({ action: 'created', item });
  });
  expressApp.delete('/api/inventory/:id', (req, res) => {
    const before = db.inventory.length;
    db.inventory = db.inventory.filter(i => i.id !== req.params.id);
    if (db.inventory.length === before) return res.status(404).json({ error: 'not found' });
    printDB(); res.json({ status: 'deleted' });
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
    printDB(); res.status(201).json({ action: 'logged', entry });
  });
  expressApp.delete('/api/purchases/:id', (req, res) => {
    const before = db.purchases.length;
    db.purchases = db.purchases.filter(i => i.id !== req.params.id);
    if (db.purchases.length === before) return res.status(404).json({ error: 'not found' });
    printDB(); res.json({ status: 'deleted' });
  });

  // SCANS
  expressApp.get('/api/scans', (req, res) => res.json(db.scans));
  expressApp.post('/api/scans', (req, res) => {
    const { barcode, camera, device } = req.body || {};
    if (!barcode) return res.status(400).json({ error: 'barcode required' });
    const scan = { id: `scan_${Date.now()}`, barcode, camera: camera || 'unknown', device: device || 'unknown', scannedAt: new Date().toISOString() };
    db.scans.unshift(scan); printDB();
    res.status(201).json(scan);
  });

  // 404
  expressApp.use((req, res) => res.status(404).json({ error: `no route: ${req.method} ${req.url}` }));

  const server = https.createServer(
    { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) },
    expressApp
  ).listen(PORT, HOST, () => {
    console.log(`[INVENTORY] HTTPS server live at https://${localIP}:${PORT}`);
    console.log(`[INVENTORY] Phone URL: https://${localIP}:${PORT}`);
  });

  return server;
}