import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';

class Transaction {
  constructor(data) {
    this.amount = data.amount;
    this.description = data.description;
    this.category = data.category;
    this.date = new Date(data.date);
    this.userId = data.userId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(transactionData) {
    const db = await getDatabase();
    const transaction = new Transaction(transactionData);
    const result = await db.collection('transactions').insertOne(transaction);
    return { ...transaction, _id: result.insertedId };
  }

  static async findByUserId(userId, options = {}) {
    const db = await getDatabase();
    const { limit = 50, skip = 0, sortBy = 'date', sortOrder = -1 } = options;
    
    const query = { userId };
    
    // Add date range filter if provided
    if (options.startDate || options.endDate) {
      query.date = {};
      if (options.startDate) query.date.$gte = new Date(options.startDate);
      if (options.endDate) query.date.$lte = new Date(options.endDate);
    }

    // Add category filter if provided
    if (options.category) {
      query.category = options.category;
    }

    const transactions = await db.collection('transactions')
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(skip)
      .toArray();

    return transactions;
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.collection('transactions').findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updateData) {
    const db = await getDatabase();
    updateData.updatedAt = new Date();
    const result = await db.collection('transactions').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result;
  }

  static async deleteById(id) {
    const db = await getDatabase();
    return await db.collection('transactions').deleteOne({ _id: new ObjectId(id) });
  }

  static async getMonthlyTotals(userId, year) {
    const db = await getDatabase();
    const pipeline = [
      {
        $match: {
          userId,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ];

    return await db.collection('transactions').aggregate(pipeline).toArray();
  }

  static async getCategoryTotals(userId, startDate, endDate) {
    const db = await getDatabase();
    const pipeline = [
      {
        $match: {
          userId,
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      },
      {
        $sort: { "total": -1 }
      }
    ];

    return await db.collection('transactions').aggregate(pipeline).toArray();
  }
}

export default Transaction;