# Books REST API

REST API для бібліотеки книг. Node.js, Express, MongoDB. Доступ до бази даних через DAO.

## Структура

```
src/
  server.js                    запуск сервера
  app.js                       налаштування Express
  config.js                    налаштування з .env
  db.js                        підключення до MongoDB
  AppError.js                  помилка з HTTP-статусом
  routes/bookRoutes.js         маршрути
  controllers/bookController.js
  services/BookService.js      бізнес-логіка
  validation/bookValidator.js  перевірка даних
  dao/BookDao.js               інтерфейс DAO
  dao/MongoBookDao.js          реалізація DAO для MongoDB
  middleware/errorHandler.js   обробка помилок
scripts/seed.js                тестові дані
postman/                       колекція для Postman
```

Запит проходить шлях: маршрут, контролер, сервіс, DAO, MongoDB.
Сервіс працює з базою тільки через методи DAO і не залежить від MongoDB напряму.

## Книга

Обов'язкові поля: `title`, `author`, `genre`, `year`, `price`, `totalCopies`.
Необов'язкові: `isbn`, `description`. Решту полів заповнює сервер.

## CRUD

| Метод  | URL            | Опис                   |
| ------ | -------------- | ---------------------- |
| GET    | /api/books     | список книг            |
| GET    | /api/books/:id | книга за ID            |
| POST   | /api/books     | додати книгу           |
| PUT    | /api/books/:id | оновити книгу повністю |
| PATCH  | /api/books/:id | оновити окремі поля    |
| DELETE | /api/books/:id | видалити книгу         |
