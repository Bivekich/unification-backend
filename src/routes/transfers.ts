import express from "express";
import moment from "moment";
import Company from "../models/company";
import Transaction from "../models/transaction";
import Cash from "../models/cash";
import Balance from "../models/balance";

const router = express.Router();

// Internal Transfers (between different companies)
router.post("/internal", async (req, res) => {
  const { fromCompany, fromBankName, toCompany, toBankName, amount, author } =
    req.body;

  try {
    const transferAmount = Number(amount);
    if (isNaN(transferAmount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const fromCompanyDoc = await Company.findOne({ name: fromCompany }).exec();
    const toCompanyDoc = await Company.findOne({ name: toCompany }).exec();

    if (!fromCompanyDoc || !toCompanyDoc) {
      return res
        .status(404)
        .json({ message: "One or both companies not found" });
    }

    const fromBank = fromCompanyDoc.banks.find(
      (bank) => bank.name === fromBankName
    );
    const toBank = toCompanyDoc.banks.find((bank) => bank.name === toBankName);

    if (!fromBank || !toBank) {
      return res.status(404).json({ message: "One or both banks not found" });
    }

    fromBank.balance = Number(fromBank.balance);
    toBank.balance = Number(toBank.balance);

    if (fromBank.balance < transferAmount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    fromBank.balance -= transferAmount;
    toBank.balance += transferAmount;

    await fromCompanyDoc.save();
    await toCompanyDoc.save();

    await Transaction.create({
      fromCompany: fromCompanyDoc.name,
      toCompany: toCompanyDoc.name,
      fromBank: fromBank.name,
      toBank: toBank.name,
      amount: transferAmount,
      type: "internal",
      author,
    });

    res.json({ message: "Internal transfer successful" });
  } catch (error) {
    console.error("Error processing internal transfer:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cash Withdrawals (from a specific bank to cash account)
router.post("/cash", async (req, res) => {
  const { fromCompany, fromBankName, amount, description, author } = req.body;

  try {
    const company = await Company.findOne({ name: fromCompany }).exec();
    const balance = await Balance.findOne({}).exec();

    if (!company || !balance) {
      return res
        .status(404)
        .json({ message: "Company or cash account not found" });
    }

    const fromBank = company.banks.find((bank) => bank.name === fromBankName);
    if (!fromBank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    const withdrawalAmount = Number(amount);
    if (isNaN(withdrawalAmount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    fromBank.balance = Number(fromBank.balance);
    const currentCashBalance = balance.balance;

    if (fromBank.balance < withdrawalAmount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    fromBank.balance -= withdrawalAmount;
    balance.balance += withdrawalAmount;

    await company.save();
    await balance.save();

    await Cash.create({
      amount: withdrawalAmount,
      type: "income",
      description,
      date: new Date(),
    });

    await Transaction.create({
      fromCompany: company.name,
      toCompany: "Касса",
      fromBank: fromBank.name,
      toBank: "Касса",
      amount: withdrawalAmount,
      type: "cash",
      author,
    });

    res.json({ message: "Cash withdrawal successful" });
  } catch (error) {
    console.error("Error processing cash withdrawal:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Custom Transfers (between any two banks)
router.post("/custom", async (req, res) => {
  const {
    fromCompany,
    fromBankName,
    toCompany,
    toBankName,
    amount,
    description,
    author,
  } = req.body;

  try {
    const transferAmount = Number(amount);
    if (isNaN(transferAmount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const fromCompanyDoc = await Company.findOne({ name: fromCompany }).exec();
    if (!fromCompanyDoc) {
      return res.status(404).json({ message: "Source company not found" });
    }

    const fromBank = fromCompanyDoc.banks.find(
      (bank) => bank.name === fromBankName
    );
    if (!fromBank) {
      return res.status(404).json({ message: "Source bank not found" });
    }

    fromBank.balance = Number(fromBank.balance);

    if (fromBank.balance < transferAmount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    fromBank.balance -= transferAmount;
    await fromCompanyDoc.save();

    await Transaction.create({
      fromCompany: fromCompanyDoc.name,
      toCompany,
      fromBank: fromBank.name,
      toBank: toBankName,
      amount: transferAmount,
      type: "custom",
      description,
      author,
    });

    res.json({ message: "Custom transfer successful" });
  } catch (error) {
    console.error("Error processing custom transfer:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/replenish", async (req, res) => {
  const {
    fromCompany,
    fromBankName,
    toCompany,
    toBankName,
    amount,
    description,
    author,
  } = req.body;

  try {
    const replenishAmount = Number(amount);
    if (isNaN(replenishAmount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const toCompanyDoc = await Company.findOne({ name: toCompany }).exec();
    if (!toCompanyDoc) {
      return res.status(400).json({ message: "Target company not found" });
    }

    const toBank = toCompanyDoc.banks.find((bank) => bank.name === toBankName);
    if (!toBank) {
      return res.status(400).json({ message: "Target bank not found" });
    }

    toBank.balance = Number(toBank.balance) + replenishAmount;

    await toCompanyDoc.save();

    await Transaction.create({
      fromCompany,
      toCompany: toCompanyDoc.name,
      fromBank: fromBankName,
      toBank: toBankName,
      amount: replenishAmount,
      type: "replenish",
      description,
      date: new Date(),
      author,
    });

    res.json({ message: "Company replenishment successful" });
  } catch (error) {
    console.error("Error processing company replenishment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Recent Transfers (last 30 days)
router.get("/recent", async (req, res) => {
  try {
    const thirtyDaysAgo = moment().subtract(30, "days").toDate();

    const recentTransfers = await Transaction.find({
      date: { $gte: thirtyDaysAgo },
    });

    res.json(recentTransfers);
  } catch (error) {
    console.error("Error fetching recent transfers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
