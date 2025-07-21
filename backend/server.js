require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Middleware
app.use(express.json());
app.use(cors());

// Test endpoint
app.get('/', (req, res) => {
  res.send('API çalışıyor!');
});

// Auth route
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));

// Socket.io bağlantısı
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  socket.on('sendMessage', ({ toUserId, message }) => {
    io.to(toUserId).emit('newMessage', message);
  });
});

// MongoDB bağlantısı
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/askingwho';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB bağlantısı başarılı');
  server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
})
.catch((err) => {
  console.error('MongoDB bağlantı hatası:', err);
});

module.exports = { app, server }; 
 