const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
function getUserIdFromToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    return decoded.userId;
  } catch {
    return null;
  }
}


router.get('/conversations', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: 'Token yok veya geçersiz.' });
  try {
    const conversations = await Conversation.find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'username firstName lastName profilePhoto')
      .lean();
    return res.json({ conversations });
  } catch (err) {
    return res.status(500).json({ message: 'Konuşmalar alınırken hata oluştu.' });
  }
});


router.get('/conversations/:conversationId/messages', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: 'Token yok veya geçersiz.' });
  const { conversationId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: 'Bu konuşmaya erişim yetkiniz yok.' });
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'username firstName lastName profilePhoto')
      .populate('receiver', 'username firstName lastName profilePhoto')
      .lean();
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ message: 'Mesajlar alınırken hata oluştu.' });
  }
});

router.post('/conversations/start', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: 'Token yok veya geçersiz.' });
  const { otherUserId } = req.body;
  if (!otherUserId) return res.status(400).json({ message: 'Diğer kullanıcı zorunlu.' });
  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId], $size: 2 }
    });
    if (!conversation) {
      conversation = new Conversation({ participants: [userId, otherUserId] });
      await conversation.save();
    }
    return res.json({ conversation });
  } catch (err) {
    return res.status(500).json({ message: 'Konuşma başlatılırken hata oluştu.' });
  }
});

router.post('/messages/send', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: 'Token yok veya geçersiz.' });
  const { conversationId, receiverId, text } = req.body;
  if (!conversationId || !receiverId || !text) return res.status(400).json({ message: 'Eksik bilgi.' });
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ message: 'Bu konuşmaya erişim yetkiniz yok.' });
    }
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      receiver: receiverId,
      text: text.trim()
    });
    await message.save();
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username firstName lastName profilePhoto')
      .populate('receiver', 'username firstName lastName profilePhoto')
      .lean();
    return res.status(201).json({ message: 'Mesaj gönderildi.', data: populatedMessage });
  } catch (err) {
    return res.status(500).json({ message: 'Mesaj gönderilirken hata oluştu.' });
  }
});














router.patch('/messages/:messageId/read', async (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ message: 'Token yok veya geçersiz.' });
  const { messageId } = req.params;
  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Mesaj bulunamadı.' });
    if (message.receiver.toString() !== userId) return res.status(403).json({ message: 'Bu mesajı okundu yapma yetkiniz yok.' });
    message.isRead = true;
    await message.save();
    return res.json({ message: 'Mesaj okundu olarak işaretlendi.' });
  } catch (err) {
    return res.status(500).json({ message: 'Mesaj güncellenirken hata oluştu.' });
  }
});

module.exports = router; 