import { ObjectId } from 'mongodb';

export class Message {
  constructor(db) {
    this.collection = db.collection('messages');
  }

  async create(messageData) {
    const message = {
      ...messageData,
      timestamp: new Date(),
      _id: new ObjectId()
    };
    
    const result = await this.collection.insertOne(message);
    return { ...message, _id: result.insertedId };
  }

  async getAll(limit = 100, skip = 0) {
    return await this.collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  async getById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async deleteById(id) {
    return await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}
