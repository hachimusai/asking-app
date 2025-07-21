const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function isStrongPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, birthdate, gender } = req.body;
    if (!firstName || !lastName || !username || !email || !password || !birthdate || gender === undefined) {
      return res.status(400).json({ message: 'Tüm alanlar zorunlu.' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Şifre en az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter içermelidir.' });
    }
    const existingUser = await User.findOne({ $or: [ { email }, { username } ] });
    if (existingUser) {
      return res.status(409).json({ message: 'Bu e-posta veya kullanıcı adı zaten kayıtlı.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, username, email, password: hashedPassword, birthdate, gender });
    await user.save();
    return res.status(201).json({ message: 'Kayıt başarılı.' });
  } catch (err) {
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Tüm alanlar zorunlu.' });
    }
    const user = await User.findOne({ $or: [ { email: emailOrUsername }, { username: emailOrUsername } ] });
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı/e-posta veya şifre.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı/e-posta veya şifre.' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, username: user.username });
  } catch (err) {
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
}; 