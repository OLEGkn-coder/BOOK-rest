const AppError = require('../AppError');

function notFound(req, res) {
  res.status(404).json({ message: 'Маршрут не знайдено' });
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Некоректний JSON у тілі запиту' });
  }

  console.error(err);
  res.status(500).json({ message: 'Внутрішня помилка сервера' });
}

module.exports = { notFound, errorHandler };
