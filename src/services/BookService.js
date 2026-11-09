const AppError = require('../AppError');
const { validateBook, validateRating, parseListQuery, parseLimit } = require('../validation/bookValidator');

class BookService {
  constructor(bookDao) {
    this.bookDao = bookDao;
  }

  async getAll(query) {
    const { filter, sortField, sortOrder, page, limit } = parseListQuery(query);
    const { books, total } = await this.bookDao.findAll(filter, {
      sortField,
      sortOrder,
      skip: (page - 1) * limit,
      limit,
    });
    return { total, page, limit, books };
  }

  async getById(id) {
    const book = await this.bookDao.findById(id);
    if (!book) {
      throw new AppError(404, 'Книгу не знайдено');
    }
    return book;
  }

  async create(data) {
    const book = validateBook(data);
    await this.checkIsbnIsFree(book.isbn);

    const now = new Date();
    return this.bookDao.create({
      ...book,
      borrowedCopies: 0,
      timesBorrowed: 0,
      ratingSum: 0,
      ratingCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  async replace(id, data) {
    const fields = validateBook(data);
    return this.update(id, { isbn: null, description: null, ...fields });
  }

  async patch(id, data) {
    const fields = validateBook(data, true);
    return this.update(id, fields);
  }

  async update(id, fields) {
    const book = await this.getById(id);

    if (fields.totalCopies !== undefined && fields.totalCopies < book.borrowedCopies) {
      throw new AppError(409, `Кількість примірників не може бути меншою, ніж видано (${book.borrowedCopies})`);
    }

    await this.checkIsbnIsFree(fields.isbn, id);
    return this.bookDao.update(id, { ...fields, updatedAt: new Date() });
  }

  async delete(id) {
    const book = await this.getById(id);
    if (book.borrowedCopies > 0) {
      throw new AppError(409, 'Не можна видалити книгу, поки не повернуто всі примірники');
    }
    await this.bookDao.delete(id);
  }

  async borrow(id) {
    const book = await this.bookDao.borrowBook(id);
    if (book) {
      return book;
    }
    await this.getById(id);
    throw new AppError(409, 'Усі примірники цієї книги вже видано');
  }

  async returnBook(id) {
    const book = await this.bookDao.returnBook(id);
    if (book) {
      return book;
    }
    await this.getById(id);
    throw new AppError(409, 'Немає виданих примірників цієї книги');
  }

  async rate(id, data) {
    const score = validateRating(data);
    const book = await this.bookDao.addRating(id, score);
    if (!book) {
      throw new AppError(404, 'Книгу не знайдено');
    }
    return book;
  }

  async getTopRated(query) {
    return this.bookDao.findTopRated(parseLimit(query.limit));
  }

  async getPopular(query) {
    return this.bookDao.findMostBorrowed(parseLimit(query.limit));
  }

  async getStats() {
    const genres = await this.bookDao.getStatsByGenre();
    const totals = { books: 0, totalCopies: 0, availableCopies: 0, borrowedCopies: 0, timesBorrowed: 0 };

    for (const genre of genres) {
      totals.books += genre.books;
      totals.totalCopies += genre.totalCopies;
      totals.borrowedCopies += genre.borrowedCopies;
      totals.timesBorrowed += genre.timesBorrowed;
      genre.averagePrice = Math.round(genre.averagePrice * 100) / 100;
    }
    totals.availableCopies = totals.totalCopies - totals.borrowedCopies;

    return { totals, genres };
  }

  async checkIsbnIsFree(isbn, bookId) {
    if (!isbn) {
      return;
    }
    const existing = await this.bookDao.findByIsbn(isbn);
    if (existing && existing.id !== bookId) {
      throw new AppError(409, 'Книга з таким ISBN вже існує');
    }
  }
}

module.exports = BookService;
