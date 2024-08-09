const express = require('express');
const router = express.Router();
const WebSocket = require('ws');
const {
  FIXED_STREAM_KEY,
  handleWebSocketConnection,
  startHlsStream
} = require('../controllers/streamController');

// Route to handle HLS requests with the fixed stream key
router.get('/hls', (req, res) => {
  startHlsStream(res);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  handleWebSocketConnection(ws);
});

// Handle WebSocket upgrade requests
router.use((req, res, next) => {
  req.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
  next();
});

module.exports = router;
