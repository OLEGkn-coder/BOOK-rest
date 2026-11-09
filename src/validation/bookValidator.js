const AppError = require('../AppError');

const currentYear = new Date().getFullYear();

const rules = {
  title: { required: true, check: (v) => isText(v, 200), message: 'Рядок до 200 символів' },
  author: { required: true, check: (v) => isText(v, 100), message: 'Рядок до 100 символів' },
  genre: { required: true, check: (v) => isText(v, 50), message: 'Рядок до 50 символів' },
  year: { required: true, check: (v) => isInteger(v, 1450, currentYear), message: `Ціле число від 1450 до ${currentYear}` },
  price: { required: true, check: (v) => typeof v === 'number' && v >= 0, message: 'Число не менше 0' },
  totalCopies: { required: true, check: (v) => isInteger(v, 1, 1000), message: 'Ціле число від 1 до 1000' },
  isbn: { required: false, check: isIsbn, message: 'ISBN має містити 10 або 13 цифр' },
  description: { required: false, check: (v) => isText(v, 2000), message: 'Рядок до 2000 символів' },
};

const sortFields = ['title', 'author', 'year', 'price', 'timesBorrowed', 'createdAt'];

function validateBook(data, partial = false) {
  checkIsObject(data);
  const errors = [];
  const book = {};

  for (const field of Object.keys(data)) {
    if (!rules[field]) {
      errors.push({ field, message: 'Недопустиме поле' });
    }
  }

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    if (partial && value === undefined) {
      continue;
    }

    if (value === undefined || value === null || value === '') {
      if (rule.required) {
        errors.push({ field, message: "Обов'язкове поле" });
      }
      continue;
    }

    if (!rule.check(value)) {
      errors.push({ field, message: rule.message });
      continue;
    }

    book[field] = typeof value === 'string' ? value.trim() : value;
  }

  if (errors.length > 0) {
    throw new AppError(400, 'Помилка валідації', errors);
  }

  if (partial && Object.keys(book).length === 0) {
    throw new AppError(400, 'Немає полів для оновлення');
  }

  if (book.genre) book.genre = book.genre.toLowerCase();
  if (book.isbn) book.isbn = book.isbn.replace(/-/g, '');

  return book;
}

function validateRating(data) {
  checkIsObject(data);
  if (!isInteger(data.score, 1, 5)) {
    throw new AppError(400, 'Помилка валідації', [{ field: 'score', message: 'Ціле число від 1 до 5' }]);
  }
  return data.score;
}

function parseListQuery(query) {
  const sort = getString(query.sort) || 'title';
  const sortField = sort.replace('-', '');

  if (!sortFields.includes(sortField)) {
    throw new AppError(400, `Сортувати можна за полями: ${sortFields.join(', ')}`);
  }

  return {
    filter: {
      genre: getString(query.genre)?.toLowerCase(),
      search: getString(query.search),
      minYear: parseNumber(query.minYear, 'minYear'),
      maxYear: parseNumber(query.maxYear, 'maxYear'),
      available: parseBoolean(query.available),
    },
    sortField,
    sortOrder: sort.startsWith('-') ? -1 : 1,
    page: parseNumber(query.page, 'page') || 1,
    limit: parseLimit(query.limit),
  };
}

function parseLimit(value) {
  const limit = parseNumber(value, 'limit') || 10;
  return Math.min(limit, 100);
}

function parseNumber(value, name) {
  if (value === undefined || value === '') {
    return undefined;
  }
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new AppError(400, `Параметр ${name} має бути цілим невід'ємним числом`);
  }
  return number;
}

function parseBoolean(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function getString(value) {
  return value ? String(value).trim() : undefined;
}

function checkIsObject(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AppError(400, "Тіло запиту має бути JSON-об'єктом");
  }
}

function isText(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isInteger(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function isIsbn(value) {
  return typeof value === 'string' && /^(\d{9}[\dX]|\d{13})$/.test(value.replace(/-/g, ''));
}

module.exports = { validateBook, validateRating, parseListQuery, parseLimit };
