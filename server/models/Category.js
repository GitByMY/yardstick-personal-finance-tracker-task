import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';

class Category {
  constructor(data) {
    this.name = data.name;
    this.icon = data.icon || 'DollarSign';
    this.color = data.color || '#45B7D1';
    this.userId = data.userId;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(categoryData) {
    const db = await getDatabase();
    const category = new Category(categoryData);
    const result = await db.collection('categories').insertOne(category);
    return { ...category, _id: result.insertedId };
  }

  static async findByUserId(userId) {
    const db = await getDatabase();
    return await db.collection('categories')
      .find({ userId })
      .sort({ name: 1 })
      .toArray();
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.collection('categories').findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updateData) {
    const db = await getDatabase();
    updateData.updatedAt = new Date();
    const result = await db.collection('categories').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result;
  }

  static async deleteById(id) {
    const db = await getDatabase();
    return await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
  }

  static async getDefaultCategories() {
    return [
      { name: 'Food & Dining', icon: 'Utensils', color: '#FF6B6B' },
      { name: 'Transportation', icon: 'Car', color: '#4ECDC4' },
      { name: 'Shopping', icon: 'ShoppingCart', color: '#45B7D1' },
      { name: 'Bills & Utilities', icon: 'Zap', color: '#96CEB4' },
      { name: 'Entertainment', icon: 'GamepadIcon', color: '#FFEAA7' },
      { name: 'Travel', icon: 'Plane', color: '#DDA0DD' },
      { name: 'Housing', icon: 'Home', color: '#98D8C8' },
      { name: 'Healthcare', icon: 'Heart', color: '#FF7675' },
      { name: 'Education', icon: 'BookOpen', color: '#74B9FF' },
      { name: 'Personal Care', icon: 'User', color: '#FD79A8' }
    ];
  }

  static async initializeDefaultCategories(userId) {
    const defaultCategories = await this.getDefaultCategories();
    const db = await getDatabase();
    
    const categoriesWithUserId = defaultCategories.map(cat => ({
      ...cat,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    try {
      const result = await db.collection('categories').insertMany(categoriesWithUserId);
      return result;
    } catch (error) {
      // Handle duplicate key error (categories already exist)
      if (error.code === 11000) {
        console.log('Default categories already exist for user');
        return null;
      }
      throw error;
    }
  }
}

export default Category;