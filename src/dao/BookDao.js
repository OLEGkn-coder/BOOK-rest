class BookDao {
  async findAll(filter, options) {
    throw new Error('Метод findAll не реалізовано');
  }

  async findById(id) {
    throw new Error('Метод findById не реалізовано');
  }

  async findByIsbn(isbn) {
    throw new Error('Метод findByIsbn не реалізовано');
  }

  async create(book) {
    throw new Error('Метод create не реалізовано');
  }

  async update(id, fields) {
    throw new Error('Метод update не реалізовано');
  }

  async delete(id) {
    throw new Error('Метод delete не реалізовано');
  }

  async borrowBook(id) {
    throw new Error('Метод borrowBook не реалізовано');
  }

  async returnBook(id) {
    throw new Error('Метод returnBook не реалізовано');
  }

  async addRating(id, score) {
    throw new Error('Метод addRating не реалізовано');
  }

  async findTopRated(limit) {
    throw new Error('Метод findTopRated не реалізовано');
  }

  async findMostBorrowed(limit) {
    throw new Error('Метод findMostBorrowed не реалізовано');
  }

  async getStatsByGenre() {
    throw new Error('Метод getStatsByGenre не реалізовано');
  }
}

module.exports = BookDao;
