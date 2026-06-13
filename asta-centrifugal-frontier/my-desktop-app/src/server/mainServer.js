import express from 'express';
import cors from 'cors';
import { initializeRoutes } from './appRoutes.js';
//////
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/status', (req, res) => { 
  res.status(200).json({ success: true, message: 'Server functional.' }); 
});

initializeRoutes(app);

export function startLocalServer() {
  return app.listen(PORT, '0.0.0.0', () => { 
    console.log('Backend core active on port ' + PORT); 
  });
}