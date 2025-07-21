const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');
const globalCache = new NodeCache({ stdTTL: 60 });

router.post('/register', authController.register);
router.post('/login', authController.login);


router.get('/users/search', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'Kullanıcı adı zorunlu.' });
  const user = await User.findOne({ username: username.trim() }).select('username');
  if (!user) return res.json({ user: null });
  return res.json({ user });
});
router.get('/users/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const userDoc = await User.findById(decoded.userId).lean();
    if (!userDoc) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    return res.json({
      user: {
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        username: userDoc.username,
        bio: userDoc.bio || '',
        hobbies: userDoc.hobbies || [],
        profilePhoto: userDoc.profilePhoto || '',
        height: userDoc.height || '',
        weight: userDoc.weight || '',
        privacy: userDoc.privacy || { 
          questionCount: 'everyone',
          likeCount: 'everyone', 
          followerCount: 'everyone',
          followingCount: 'everyone',
          mostAsked: 'everyone',
          mostLiked: 'everyone',
          mostFollowers: 'everyone',
          height: 'everyone',
          weight: 'everyone'
        },
        stats: userDoc.stats || { followers: 0, following: 0, questions: 0, likes: 0 },
      }
    });
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz token.' });
  }
});

router.get('/users/:username', async (req, res) => {
  const { username } = req.params;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!username) return res.status(400).json({ message: 'Kullanıcı adı zorunlu.' });
  try {
    const userDoc = await User.findOne({ username }).lean();
    if (!userDoc) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    let isFollowing = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
        const currentUser = await User.findById(decoded.userId);
        if (currentUser && currentUser.following.includes(userDoc._id)) {
          isFollowing = true;
        }
      } catch (err) {
      }
    }
    
    const mostAskedAgg = await Question.aggregate([
      { $match: { to: userDoc._id } },
      { $group: { _id: '$from', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, count: 1, user: { username: 1, firstName: 1, lastName: 1, profilePhoto: 1 } } }
    ]);
    const mostLikedAgg = await Question.aggregate([
      { $match: { to: userDoc._id, answer: { $ne: '' } } },
      { $unwind: '$likes' },
      { $group: { _id: '$likes', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: 0, count: 1, user: { username: 1, firstName: 1, lastName: 1, profilePhoto: 1 } } }
    ]);
    const mostCommentedAgg = await Question.aggregate([
      { $match: { to: userDoc._id, answer: { $ne: '' } } },
      { $unwind: '$comments' },
      { $group: { _id: '$comments.user._id', count: { $sum: 1 }, user: { $first: '$comments.user' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, count: 1, user: 1 } }
    ]);
    const mostFollowersAgg = await User.aggregate([
      { $project: { username: 1, firstName: 1, lastName: 1, profilePhoto: 1, followersCount: { $size: '$followers' } } },
      { $sort: { followersCount: -1 } },
      { $limit: 5 }
    ]);
    
    return res.json({
      user: {
        _id: userDoc._id,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        username: userDoc.username,
        bio: userDoc.bio || '',
        hobbies: userDoc.hobbies || [],
        profilePhoto: userDoc.profilePhoto || '',
        height: userDoc.height || '',
        weight: userDoc.weight || '',
        privacy: userDoc.privacy || { 
          questionCount: 'everyone',
          likeCount: 'everyone', 
          followerCount: 'everyone',
          followingCount: 'everyone',
          mostAsked: 'everyone',
          mostLiked: 'everyone',
          mostFollowers: 'everyone',
          height: 'everyone',
          weight: 'everyone'
        },
        stats: userDoc.stats || { followers: 0, following: 0, questions: 0, likes: 0 },
        isFollowing,
        mostAsked: mostAskedAgg.map(x => ({ ...x.user, count: x.count })),
        mostLiked: mostLikedAgg.map(x => ({ ...x.user, count: x.count })),
        mostCommented: mostCommentedAgg.filter(x => x.user && x.user.username).map(x => ({ ...x.user, count: x.count })),
        mostFollowers: mostFollowersAgg,
        answeredQuestions: [],
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
});
router.patch('/users/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const updateFields = {};
    const allowedFields = ['firstName', 'lastName', 'username', 'bio', 'hobbies', 'profilePhoto', 'height', 'weight', 'privacy'];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateFields[key] = req.body[key];
      }
    }
    if (typeof updateFields.hobbies === 'string') {
      updateFields.hobbies = updateFields.hobbies.split(',').map(h => h.trim()).filter(Boolean);
    }
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateFields },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    return res.json({ user });
  } catch (err) {
    console.error('Profil güncelleme hatası:', err);
    return res.status(500).json({ message: 'Profil güncellenirken hata oluştu.' });
  }
});
router.post('/questions/send', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const { toUsername, text, isAnonymous } = req.body;
    if (!toUsername || !text) return res.status(400).json({ message: 'Hedef kullanıcı ve soru metni zorunlu.' });
        const toUser = await User.findOne({ username: toUsername });
    if (!toUser) return res.status(404).json({ message: 'Hedef kullanıcı bulunamadı.' });
        if (toUser._id.toString() === decoded.userId) {
      return res.status(400).json({ message: 'Kendine soru gönderemezsin.' });
    }
    
    const newQuestion = new Question({
      from: decoded.userId,
      to: toUser._id,
      text: text.trim(),
      isAnonymous: isAnonymous || false,
      answer: '',
      likes: [],
      reposts: [],
      comments: []
    });
    
    await newQuestion.save();
    
    await User.findByIdAndUpdate(toUser._id, {
      $inc: { 'stats.questions': 1 }
    });
    
    const sender = await User.findById(decoded.userId);
    const notification = new Notification({
      recipient: toUser._id,
      sender: decoded.userId,
      type: 'question',
      question: newQuestion._id,
      text: isAnonymous ? 'Anonim bir kullanıcı sana soru sordu.' : `${sender.firstName} ${sender.lastName} sana soru sordu.`
    });
    await notification.save();
    
    return res.status(201).json({ message: 'Soru başarıyla gönderildi.' });
  } catch (err) {
    console.error('Soru gönderme hatası:', err);
    return res.status(500).json({ message: 'Soru gönderilirken hata oluştu.' });
  }
});

router.get('/questions/unanswered', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const questions = await Question.find({
      to: decoded.userId,
      answer: ''
    })
    .populate('from', 'username firstName lastName profilePhoto')
    .populate('comments.user', 'username firstName lastName profilePhoto')
    .lean();
    return res.json({ questions });
  } catch (err) {
    return res.status(401).json({ message: 'Geçersiz token.' });
  }
});

router.get('/questions/answered/:username', async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    
    const skip = (page - 1) * limit;
    const questions = await Question.find({
      to: user._id,
      answer: { $ne: '' }
    })
    .populate('from', 'username firstName lastName profilePhoto')
    .populate('comments.user', 'username firstName lastName profilePhoto')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
    
    const total = await Question.countDocuments({
      to: user._id,
      answer: { $ne: '' }
    });
    
    return res.json({ 
      questions,
      total,
      hasMore: skip + questions.length < total
    });
  } catch (err) {
    console.error('Sorular getirme hatası:', err);
    return res.status(500).json({ message: 'Sorular getirilirken hata oluştu.' });
  }
});

router.patch('/questions/:questionId/answer', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const { questionId } = req.params;
    const { answer } = req.body;
    
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: 'Yanıt metni zorunlu.' });
    }
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Soru bulunamadı.' });
    }
    
    if (question.to.toString() !== decoded.userId) {
      return res.status(403).json({ message: 'Bu soruyu yanıtlama yetkiniz yok.' });
    }
    
    const wasAnswered = !!question.answer && question.answer.trim().length > 0;
    question.answer = answer.trim();
    if (!wasAnswered) {
      question.answeredAt = new Date();
    }
    await question.save();

    if (!wasAnswered) {
      const mentionRegex = /@([a-zA-Z0-9_]+)/g;
      const mentions = [];
      let match;
      while ((match = mentionRegex.exec(question.text)) !== null) {
        mentions.push(match[1]);
      }
      for (const username of mentions) {
        const mentionedUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
        if (mentionedUser && mentionedUser._id.toString() !== decoded.userId) {
          const notification = new Notification({
            recipient: mentionedUser._id,
            sender: decoded.userId,
            type: 'mention',
            question: question._id,
            text: `Senden bahsedilen bir soru yanıtlandı.`
          });
          await notification.save();
        }
      }
    }

    const mentionRegex2 = /@([a-zA-Z0-9_]+)/g;
    const mentions2 = [];
    let match2;
    while ((match2 = mentionRegex2.exec(answer)) !== null) {
      mentions2.push(match2[1]);
    }
    for (const username of mentions2) {
      const mentionedUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
      if (mentionedUser && mentionedUser._id.toString() !== decoded.userId) {
        const notification = new Notification({
          recipient: mentionedUser._id,
          sender: decoded.userId,
          type: 'mention',
          question: question._id,
          text: `Bir yanıtta senden bahsedildi.`
        });
        await notification.save();
      }
    }

    return res.json({ message: 'Soru başarıyla yanıtlandı.' });
  } catch (err) {
    console.error('Soru yanıtlama hatası:', err);
    return res.status(500).json({ message: 'Soru yanıtlanırken hata oluştu.' });
  }
});

router.post('/questions/:id/like', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const userId = decoded.userId;
    const { id } = req.params;
    const question = await Question.findByIdAndUpdate(id, {
      $addToSet: { likes: userId }
    }, { new: true });
    if (!question) return res.status(404).json({ message: 'Soru bulunamadı.' });
    return res.json({ message: 'Beğenildi.', likes: question.likes.length });
  } catch (err) {
    return res.status(500).json({ message: 'Beğenilirken hata oluştu.' });
  }
});

router.post('/questions/:id/unlike', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const userId = decoded.userId;
    const { id } = req.params;
    const question = await Question.findByIdAndUpdate(id, {
      $pull: { likes: userId }
    }, { new: true });
    if (!question) return res.status(404).json({ message: 'Soru bulunamadı.' });
    return res.json({ message: 'Beğeni kaldırıldı.', likes: question.likes.length });
  } catch (err) {
    return res.status(500).json({ message: 'Beğeni kaldırılırken hata oluştu.' });
  }
});

router.post('/questions/:id/comment', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const userId = decoded.userId;
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Yorum metni zorunlu.' });
    }
    
    const user = await User.findById(userId).select('firstName lastName username');
    const comment = {
      user: user._id,
      text: text.trim(),
      createdAt: new Date()
    };
    
    const question = await Question.findByIdAndUpdate(id, {
      $push: { comments: comment }
    }, { new: true });
    
    if (!question) return res.status(404).json({ message: 'Soru bulunamadı.' });

    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    for (const username of mentions) {
      const mentionedUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
      if (mentionedUser && mentionedUser._id.toString() !== user._id.toString()) {
        const notification = new Notification({
          recipient: mentionedUser._id,
          sender: user._id,
          type: 'mention',
          text: `${user.username} seni bir yorumda etiketledi.`,
          question: question._id
        });
        await notification.save();
      }
    }

    const populatedQuestion = await Question.findById(question._id)
      .populate('comments.user', 'username firstName lastName profilePhoto');
    const lastComment = populatedQuestion.comments[populatedQuestion.comments.length - 1];

    return res.json({ message: 'Yorum eklendi.', comment: lastComment });
  } catch (err) {
    return res.status(500).json({ message: 'Yorum eklenirken hata oluştu.' });
  }
});

router.post('/users/:username/follow', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const followerId = decoded.userId;
    const { username } = req.params;
    const userToFollow = await User.findOne({ username });
    if (!userToFollow) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    if (userToFollow._id.toString() === followerId) return res.status(400).json({ message: 'Kendini takip edemezsin.' });
    
    const follower = await User.findById(followerId);
    if (follower.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'Zaten takip ediyorsun.' });
    }
    
    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: userToFollow._id },
      $inc: { 'stats.following': 1 }
    });
    await User.findByIdAndUpdate(userToFollow._id, {
      $addToSet: { followers: followerId },
      $inc: { 'stats.followers': 1 }
    });
    
    const notification = new Notification({
      recipient: userToFollow._id,
      sender: followerId,
      type: 'follow',
      text: `${follower.firstName} ${follower.lastName} seni takip etmeye başladı.`
    });
    await notification.save();
    
    return res.json({ message: 'Takip edildi.' });
  } catch (err) {
    return res.status(500).json({ message: 'Takip edilirken hata oluştu.' });
  }
});
router.post('/users/:username/unfollow', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const followerId = decoded.userId;
    const { username } = req.params;
    const userToUnfollow = await User.findOne({ username });
    if (!userToUnfollow) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    if (userToUnfollow._id.toString() === followerId) return res.status(400).json({ message: 'Kendini takipten çıkaramazsın.' });
    await User.findByIdAndUpdate(followerId, {
      $pull: { following: userToUnfollow._id },
      $inc: { 'stats.following': -1 }
    });
    await User.findByIdAndUpdate(userToUnfollow._id, {
      $pull: { followers: followerId },
      $inc: { 'stats.followers': -1 }
    });
    return res.json({ message: 'Takipten çıkıldı.' });
  } catch (err) {
    return res.status(500).json({ message: 'Takipten çıkılırken hata oluştu.' });
  }
});
router.get('/notifications', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const notifications = await Notification.find({ recipient: decoded.userId })
      .populate('sender', 'firstName lastName username profilePhoto')
      .populate('question', 'text')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    
    return res.json({ notifications });
  } catch (err) {
    return res.status(500).json({ message: 'Bildirimler getirilirken hata oluştu.' });
  }
});

router.patch('/notifications/:id/read', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const { id } = req.params;
    
    await Notification.findOneAndUpdate(
      { _id: id, recipient: decoded.userId },
      { isRead: true }
    );
    
    return res.json({ message: 'Bildirim okundu olarak işaretlendi.' });
  } catch (err) {
    return res.status(500).json({ message: 'Bildirim güncellenirken hata oluştu.' });
  }
});

router.patch('/notifications/clear', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    await Notification.updateMany(
      { recipient: decoded.userId, isRead: false },
      { $set: { isRead: true } }
    );
    return res.json({ message: 'Tüm bildirimler okundu olarak işaretlendi.' });
  } catch (err) {
    return res.status(500).json({ message: 'Bildirimler temizlenirken hata oluştu.' });
  }
});

router.delete('/notifications/clear', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    await Notification.deleteMany({ recipient: decoded.userId });
    return res.json({ message: 'Tüm bildirimler silindi.' });
  } catch (err) {
    return res.status(500).json({ message: 'Bildirimler silinirken hata oluştu.' });
  }
});

router.delete('/questions/:id', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token yok.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_jwt_anahtari');
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: 'Soru bulunamadı.' });

    if (question.to.toString() !== decoded.userId) {
      return res.status(403).json({ message: 'Bu soruyu silme yetkiniz yok.' });
    }

    await Question.findByIdAndDelete(id);
    await Notification.deleteMany({ question: id });

    return res.json({ message: 'Soru silindi.' });
  } catch (err) {
    return res.status(500).json({ message: 'Soru silinirken hata oluştu.' });
  }
});

router.get('/global/leaderboard', async (req, res) => {
  const cached = globalCache.get('leaderboard');
  if (cached) return res.json(cached);
  try {
    const mostFollowers = await User.aggregate([
      { $project: { username: 1, firstName: 1, lastName: 1, profilePhoto: 1, followersCount: { $size: '$followers' } } },
      { $sort: { followersCount: -1 } },
      { $limit: 5 }
    ]);
    const mostAnswered = await User.aggregate([
      { $project: { username: 1, firstName: 1, lastName: 1, profilePhoto: 1, answeredCount: { $ifNull: ['$stats.questions', 0] } } },
      { $sort: { answeredCount: -1 } },
      { $limit: 5 }
    ]);
    const mostLiked = await User.aggregate([
      { $project: { username: 1, firstName: 1, lastName: 1, profilePhoto: 1, likeCount: { $ifNull: ['$stats.likes', 0] } } },
      { $sort: { likeCount: -1 } },
      { $limit: 5 }
    ]);

    const mostAsked = await User.aggregate([
      { $project: { username: 1, firstName: 1, lastName: 1, profilePhoto: 1, questionCount: { $ifNull: ['$stats.questions', 0] } } },
      { $sort: { questionCount: -1 } },
      { $limit: 5 }
    ]);
    const data = { mostFollowers, mostAnswered, mostLiked, mostAsked };
    globalCache.set('leaderboard', data);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Leaderboard alınırken hata oluştu.' });
  }
});

router.get('/global/feed', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const cacheKey = `feed_${page}_${limit}`;
  const cached = globalCache.get(cacheKey);
  if (cached) return res.json(cached);
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const questions = await Question.find({ answer: { $ne: '' } })
      .populate('from', 'username firstName lastName profilePhoto')
      .populate('to', 'username firstName lastName profilePhoto')
      .populate('comments.user', 'username firstName lastName profilePhoto')
      .sort({ answeredAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    const total = await Question.countDocuments({ answer: { $ne: '' } });
    const data = { questions, total, hasMore: skip + questions.length < total };
    globalCache.set(cacheKey, data);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Feed alınırken hata oluştu.' });
  }
});

module.exports = router; 