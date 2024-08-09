const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');

// Hard-coded stream key
const FIXED_STREAM_KEY='abc123fixedstreamkey'


// In-memory store for WebSocket clients
const clients = new Set();

// Broadcast stream data to all connected WebSocket clients
const broadcastStream = (data) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Handle WebSocket connections
const handleWebSocketConnection = (ws) => {
  clients.add(ws);

  ws.on('message', (message) => {
    if (typeof message === 'string') {
      console.log(`Received message: ${message}`);
    } else {
      broadcastStream(message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket connection closed');
  });
};

// Start HLS stream with the fixed stream key
const startHlsStream = (res) => {
  const ffmpegStream = new PassThrough();

  ffmpeg()
    .input('pipe:0') // Input from WebSocket
    .inputFormat('mp4')
    .output(ffmpegStream)
    .videoCodec('libx264')
    .audioCodec('aac')
    .format('hls')
    .outputOptions([
      '-hls_time 10', // Segment length in seconds
      '-hls_list_size 0', // Unlimited number of segments
      '-hls_flags delete_segments', // Automatically manage segment lifecycle
      '-hls_segment_type mpegts' // Segment format
    ])
    .on('end', () => {
      console.log('HLS stream ended');
    })
    .on('error', (err) => {
      console.error('FFmpeg error:', err);
    })
    .run();

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  ffmpegStream.pipe(res);
};

module.exports = {
  FIXED_STREAM_KEY,
  handleWebSocketConnection,
  startHlsStream
};
