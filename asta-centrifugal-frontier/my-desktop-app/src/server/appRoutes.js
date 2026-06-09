import { processIncomingPayload } from './dataController.js';

export function initializeRoutes(app) {
  app.post('/api/data-stream', async (req, res) => {
    try {
      const result = await processIncomingPayload(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}