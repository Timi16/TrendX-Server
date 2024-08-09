const express = require('express');
const http = require('http');
const path = require('path');
const streamRoutes = require('./routes/streamRoutes');

const app = express();
const server = http.createServer(app);

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Use routes for HLS streaming and WebSocket connections
app.use('/stream', streamRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
