const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_jwt_anahtari';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Yetkisiz. Token yok.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Geçersiz token.' });
  }
}; 