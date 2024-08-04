import express, { Request, Response } from 'express';
import Cash from '../models/cash';
import Balance from '../models/balance';
import moment from 'moment';

const router = express.Router();

// Функция для обновления баланса
const updateBalance = async (amount: number, type: 'expense' | 'income') => {
  try {
    const balanceDoc = await Balance.findOne().exec();
    if (!balanceDoc) {
      // Если документа с балансом нет, создаём новый
      const newBalance = new Balance({
        balance: type === 'income' ? amount : -amount,
      });
      await newBalance.save();
      return;
    }

    // Обновляем баланс
    balanceDoc.balance += type === 'income' ? amount : -amount;
    await balanceDoc.save();
  } catch (error) {
    console.error('Error updating balance:', error);
    throw error;
  }
};

// Добавить приход или расход
router.post('/add', async (req: Request, res: Response) => {
  const { amount, type, description } = req.body;

  if (!['expense', 'income'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type' });
  }

  try {
    const newCash = new Cash({
      amount: Number(amount), // Убедитесь, что amount число
      type,
      description,
    });

    // Сохраняем операцию
    await newCash.save();

    // Обновляем баланс
    await updateBalance(Number(amount), type);

    res.status(201).json({ message: 'Operation added successfully' });
  } catch (error) {
    console.error('Error adding cash operation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Получить все операции кассы
router.get('/', async (req: Request, res: Response) => {
  try {
    const cashOperations = await Cash.find().sort({ date: -1 });
    res.json(cashOperations);
  } catch (error) {
    console.error('Error fetching cash operations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Получить текущий баланс
router.get('/balance', async (req: Request, res: Response) => {
  try {
    const balanceDoc = await Balance.findOne().exec();
    if (!balanceDoc) {
      return res.json({ balance: 0 });
    }
    res.json({ balance: balanceDoc.balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Получить операции кассы за последние 30 дней
router.get('/last-30-days', async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    const cashOperations = await Cash.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: -1 });
    res.json(cashOperations);
  } catch (error) {
    console.error('Error fetching cash operations for the last 30 days:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
