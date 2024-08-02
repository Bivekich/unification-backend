import express from 'express';
import Company from '../models/company';
import User from '../models/user';

const router = express.Router();

// Добавить юридическое лицо
router.post('/company', async (req, res) => {
  const { name, banks } = req.body;

  try {
    const existingCompany = await Company.findOne({ name }).exec();
    if (existingCompany) {
      return res.status(400).json({ message: 'Юридическое лицо уже существует' });
    }

    const company = new Company({ name, banks });
    await company.save();
    res.json({ message: 'Юридическое лицо добавлено успешно', company });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка добавления юридического лица', error });
  }
});

// Добавить банк к юридическому лицу
router.post('/company/bank', async (req, res) => {
  const { companyName, bankName, balance } = req.body;

  try {
    const company = await Company.findOne({ name: companyName }).exec();
    if (!company) {
      return res.status(404).json({ message: 'Юридическое лицо не найдено' });
    }

    // Проверка на существование банка
    const bankExists = company.banks.some(bank => bank.name === bankName);
    if (bankExists) {
      return res.status(400).json({ message: 'Банк уже существует для данного юридического лица' });
    }

    // Добавление нового банка
    company.banks.push({ name: bankName, balance });
    await company.save();
    res.json({ message: 'Банк добавлен успешно', company });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка добавления банка', error });
  }
});

// Обновить баланс банка для юридического лица
router.put('/company/bank', async (req, res) => {
  const { companyName, bankName, newBalance } = req.body;

  try {
    const company = await Company.findOne({ name: companyName }).exec();
    if (!company) {
      return res.status(404).json({ message: 'Юридическое лицо не найдено' });
    }

    const bank = company.banks.find(bank => bank.name === bankName);
    if (!bank) {
      return res.status(404).json({ message: 'Банк не найден' });
    }

    bank.balance = newBalance;
    await company.save();
    res.json({ message: 'Баланс банка обновлен успешно', company });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления баланса', error });
  }
});

// Добавить пользователя
router.post('/user', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username }).exec();
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const user = new User({ username, password, role });
    await user.save();
    res.json({ message: 'Пользователь добавлен успешно', user });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка добавления пользователя', error });
  }
});

export default router;
