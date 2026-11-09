# Books REST API

REST API для бібліотеки книг. Node.js, Express, MongoDB. Доступ до бази даних через DAO.

## Запуск

Потрібні Node.js 20.19 або новіший і запущена MongoDB.

```bash
npm install
cp .env.example .env
npm run seed
 
```

Сервер: http://localhost:3000/api/books

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

```json
{
  "id": "6af1bc21d45a62e9d806f212",
  "title": "Eloquent JavaScript",
  "author": "Marijn Haverbeke",
  "genre": "програмування",
  "year": 2018,
  "price": 1100,
  "isbn": "9781593279509",
  "description": "Вступ до програмування на JavaScript.",
  "totalCopies": 3,
  "availableCopies": 3,
  "borrowedCopies": 0,
  "timesBorrowed": 1,
  "rating": 5,
  "ratingCount": 1,
  "createdAt": "2026-11-09T12:27:13.663Z",
  "updatedAt": "2026-11-09T12:27:13.665Z"
}
```

Обов'язкові поля: `title`, `author`, `genre`, `year`, `price`, `totalCopies`.
Необов'язкові: `isbn`, `description`. Решту полів заповнює сервер.

## CRUD

| Метод | URL | Опис |
|---|---|---|
| GET | /api/books | список книг |
| GET | /api/books/:id | книга за ID |
| POST | /api/books | додати книгу |
| PUT | /api/books/:id | оновити книгу повністю |
| PATCH | /api/books/:id | оновити окремі поля |
| DELETE | /api/books/:id | видалити книгу |

Параметри для `GET /api/books`:

- `genre` фільтр за жанром
- `search` пошук у назві, авторі та описі
- `minYear`, `maxYear` діапазон років
- `available=true` тільки книги, які зараз можна взяти
- `sort` поле сортування: `title`, `author`, `year`, `price`, `timesBorrowed`, `createdAt`; `-year` означає за спаданням
- `page`, `limit` пагінація

## Бізнес-логіка

| Метод | URL | Опис |
|---|---|---|
| POST | /api/books/:id/borrow | видати примірник читачеві |
| POST | /api/books/:id/return | повернути примірник |
| POST | /api/books/:id/rate | оцінити книгу, тіло `{ "score": 1..5 }` |
| GET | /api/books/top-rated | книги з найвищим рейтингом |
| GET | /api/books/popular | книги, які брали найчастіше |
| GET | /api/books/stats | статистика бібліотеки за жанрами |

Правила:

- не можна видати книгу, якщо всі примірники вже видано (409);
- не можна повернути книгу, якщо її не видавали (409);
- не можна видалити книгу, поки не повернуто всі примірники (409);
- не можна зробити кількість примірників меншою, ніж видано зараз (409);
- ISBN має бути унікальним (409).

## Помилки

```json
{
  "message": "Помилка валідації",
  "errors": [
    { "field": "year", "message": "Ціле число від 1450 до 2026" }
  ]
}
```

- 400 некоректні дані або параметри
- 404 книгу або маршрут не знайдено
- 409 дія суперечить правилам бібліотеки

## Postman

Імпортуйте файл `postman/Books-REST-API.postman_collection.json`.
Запустіть сервер і виконуйте запити по черзі або всю колекцію через Run collection.
Запит "Додати книгу" зберігає ID нової книги, і наступні запити використовують його.
