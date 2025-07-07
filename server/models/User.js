import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';

class User {
  constructor(data) {
    this.email = data.email;
    this.name = data.name;
    this.preferences = data.preferences || {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'dark'
    };
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async create(userData) {
    const db = await getDatabase();
    const user = new User(userData);
    const result = await db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async findByEmail(email) {
    const db = await getDatabase();
    return await db.collection('users').findOne({ email });
  }

  static async findById(id) {
    const db = await getDatabase();
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updateData) {
    const db = await getDatabase();
    updateData.updatedAt = new Date();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result;
  }

  static async deleteById(id) {
    const db = await getDatabase();
    return await db.collection('users').deleteOne({ _id: new ObjectId(id) });
  }
}

export default User;