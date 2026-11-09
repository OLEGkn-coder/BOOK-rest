function createBookController(bookService) {
  return {
    async getAll(req, res) {
      res.json(await bookService.getAll(req.query));
    },

    async getById(req, res) {
      res.json(await bookService.getById(req.params.id));
    },

    async create(req, res) {
      res.status(201).json(await bookService.create(req.body));
    },

    async replace(req, res) {
      res.json(await bookService.replace(req.params.id, req.body));
    },

    async patch(req, res) {
      res.json(await bookService.patch(req.params.id, req.body));
    },

    async delete(req, res) {
      await bookService.delete(req.params.id);
      res.status(204).end();
    },

    async borrow(req, res) {
      res.json(await bookService.borrow(req.params.id));
    },

    async returnBook(req, res) {
      res.json(await bookService.returnBook(req.params.id));
    },

    async rate(req, res) {
      res.json(await bookService.rate(req.params.id, req.body));
    },

    async getTopRated(req, res) {
      res.json(await bookService.getTopRated(req.query));
    },

    async getPopular(req, res) {
      res.json(await bookService.getPopular(req.query));
    },

    async getStats(req, res) {
      res.json(await bookService.getStats());
    },
  };
}

module.exports = createBookController;
