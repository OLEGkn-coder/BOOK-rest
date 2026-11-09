const express = require('express');
const createBookController = require('./controllers/bookController');
const createBookRouter = require('./routes/bookRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp(bookService) {
  const app = express();

  app.set('json spaces', 2);
  app.use(express.json());

  app.use('/api/books', createBookRouter(createBookController(bookService)));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
