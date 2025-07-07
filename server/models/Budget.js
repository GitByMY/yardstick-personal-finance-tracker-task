import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';

class Budget {
  constructor(data) {
    this.category = data.category;
    this.budgetAmount = data.budgetAmount;
    this.spentAmount = data.spentAmount || 0;
    this.month = data.month;
    this.year = data.year;
    this.userId = data.userId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(budgetData) {
    const db = await getDatabase();
    const budget = new Budget(budgetData);
    const result = await db.collection('budgets').insertOne(budget);
    return { ...budget, _id: result.insertedId };
  }

  static async findByUserId(userId, month, year) {
    const db = await getDatabase();
    const query = { userId };
    
    if (month !== undefined && year !== undefined) {
      query.month = month;
      query.year = year;
    }

    return await db.collection('budgets')
      .find(query)
      .sort({ category: 1 })
      .toArray();
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.collection('budgets').findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updateData) {
    const db = await getDatabase();
    updateData.updatedAt = new Date();
    const result = await db.collection('budgets').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result;
  }

  static async updateSpentAmount(userId, category, month, year, amount) {
    const db = await getDatabase();
    const result = await db.collection('budgets').updateOne(
      { userId, category, month, year },
      { 
        $inc: { spentAmount: amount },
        $set: { updatedAt: new Date() }
      }
    );
    return result;
  }

  static async deleteById(id) {
    const db = await getDatabase();
    return await db.collection('budgets').deleteOne({ _id: new ObjectId(id) });
  }

  static async getBudgetVsActual(userId, year) {
    const db = await getDatabase();
    const pipeline = [
      {
        $match: { userId, year }
      },
      {
        $group: {
          _id: "$month",
          totalBudget: { $sum: "$budgetAmount" },
          totalSpent: { $sum: "$spentAmount" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ];

    return await db.collection('budgets').aggregate(pipeline).toArray();
  }
}

export default Budget;