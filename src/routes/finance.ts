import express from 'express';
import Company from '../models/company';

const router = express.Router();

// Получение информации о финансах
router.get('/', async (req, res) => {
  const companies = await Company.find().exec();
  res.json(companies);
});

export default router;
