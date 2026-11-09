const { ObjectId } = require('mongodb');
const BookDao = require('./BookDao');

class MongoBookDao extends BookDao {
  constructor(db) {
    super();
    this.books = db.collection('books');
  }

  async init() {
    await this.books.createIndex({ isbn: 1 }, { unique: true, sparse: true });
  }

  async findAll(filter, { sortField, sortOrder, skip, limit }) {
    const query = buildQuery(filter);
    const docs = await this.books
      .find(query)
      .sort({ [sortField]: sortOrder, _id: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await this.books.countDocuments(query);
    return { books: docs.map(toBook), total };
  }

  async findById(id) {
    const doc = await this.books.findOne(byId(id));
    return toBook(doc);
  }

  async findByIsbn(isbn) {
    const doc = await this.books.findOne({ isbn });
    return toBook(doc);
  }

  async create(book) {
    const result = await this.books.insertOne({ ...book });
    return toBook({ _id: result.insertedId, ...book });
  }

  async update(id, fields) {
    const set = {};
    const unset = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value === null) {
        unset[key] = '';
      } else {
        set[key] = value;
      }
    }

    const update = { $set: set };
    if (Object.keys(unset).length > 0) {
      update.$unset = unset;
    }

    const doc = await this.books.findOneAndUpdate(byId(id), update, { returnDocument: 'after' });
    return toBook(doc);
  }

  async delete(id) {
    const result = await this.books.deleteOne(byId(id));
    return result.deletedCount === 1;
  }

  async borrowBook(id) {
    const doc = await this.books.findOneAndUpdate(
      { ...byId(id), $expr: { $lt: ['$borrowedCopies', '$totalCopies'] } },
      { $inc: { borrowedCopies: 1, timesBorrowed: 1 }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return toBook(doc);
  }

  async returnBook(id) {
    const doc = await this.books.findOneAndUpdate(
      { ...byId(id), borrowedCopies: { $gt: 0 } },
      { $inc: { borrowedCopies: -1 }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return toBook(doc);
  }

  async addRating(id, score) {
    const doc = await this.books.findOneAndUpdate(
      byId(id),
      { $inc: { ratingSum: score, ratingCount: 1 }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return toBook(doc);
  }

  async findTopRated(limit) {
    const docs = await this.books
      .aggregate([
        { $match: { ratingCount: { $gt: 0 } } },
        { $addFields: { averageRating: { $divide: ['$ratingSum', '$ratingCount'] } } },
        { $sort: { averageRating: -1, ratingCount: -1, title: 1 } },
        { $limit: limit },
      ])
      .toArray();
    return docs.map(toBook);
  }

  async findMostBorrowed(limit) {
    const docs = await this.books
      .find({ timesBorrowed: { $gt: 0 } })
      .sort({ timesBorrowed: -1, title: 1 })
      .limit(limit)
      .toArray();
    return docs.map(toBook);
  }

  async getStatsByGenre() {
    const groups = await this.books
      .aggregate([
        {
          $group: {
            _id: '$genre',
            books: { $sum: 1 },
            totalCopies: { $sum: '$totalCopies' },
            borrowedCopies: { $sum: '$borrowedCopies' },
            timesBorrowed: { $sum: '$timesBorrowed' },
            averagePrice: { $avg: '$price' },
          },
        },
        { $sort: { books: -1, _id: 1 } },
      ])
      .toArray();
    return groups.map(({ _id, ...stats }) => ({ genre: _id, ...stats }));
  }
}

function byId(id) {
  return { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
}

function buildQuery(filter) {
  const query = {};

  if (filter.genre) {
    query.genre = filter.genre;
  }

  if (filter.search) {
    const regex = { $regex: escapeRegex(filter.search), $options: 'i' };
    query.$or = [{ title: regex }, { author: regex }, { description: regex }];
  }

  if (filter.minYear !== undefined || filter.maxYear !== undefined) {
    query.year = {};
    if (filter.minYear !== undefined) query.year.$gte = filter.minYear;
    if (filter.maxYear !== undefined) query.year.$lte = filter.maxYear;
  }

  if (filter.available === true) {
    query.$expr = { $lt: ['$borrowedCopies', '$totalCopies'] };
  }
  if (filter.available === false) {
    query.$expr = { $gte: ['$borrowedCopies', '$totalCopies'] };
  }

  return query;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toBook(doc) {
  if (!doc) {
    return null;
  }

  return {
    id: doc._id.toString(),
    title: doc.title,
    author: doc.author,
    genre: doc.genre,
    year: doc.year,
    price: doc.price,
    isbn: doc.isbn,
    description: doc.description,
    totalCopies: doc.totalCopies,
    availableCopies: doc.totalCopies - doc.borrowedCopies,
    borrowedCopies: doc.borrowedCopies,
    timesBorrowed: doc.timesBorrowed,
    rating: doc.ratingCount > 0 ? Math.round((doc.ratingSum / doc.ratingCount) * 100) / 100 : null,
    ratingCount: doc.ratingCount,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

module.exports = MongoBookDao;
