import express from 'express';
import User from '../models/user';

const router = express.Router();

// Вход пользователя
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password }).exec();
  if (!user) {
    return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
  }

  res.json({ message: 'Вход выполнен успешно', user });
});

export default router;
