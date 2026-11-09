const db = require("../src/db");
const MongoBookDao = require("../src/dao/MongoBookDao");
const BookService = require("../src/services/BookService");

const books = [
  {
    title: "Кобзар",
    author: "Тарас Шевченко",
    genre: "поезія",
    year: 1840,
    price: 350,
    totalCopies: 5,
    description: "Збірка поетичних творів",
    borrows: 4,
    returns: 2,
    ratings: [5, 5, 4, 5],
  },
  {
    title: "Тіні забутих предків",
    author: "Михайло Коцюбинський",
    genre: "повість",
    year: 1911,
    price: 220,
    totalCopies: 3,
    description: "Повість про кохання",
    borrows: 3,
    returns: 2,
    ratings: [5, 4],
  },
  {
    title: "Лісова пісня",
    author: "Леся Українка",
    genre: "драма",
    year: 1911,
    price: 180,
    totalCopies: 4,
    description: "Драма",
    borrows: 2,
    returns: 2,
    ratings: [4, 5, 4],
  },
  {
    title: "Місто",
    author: "Валер'ян Підмогильний",
    genre: "роман",
    year: 1928,
    price: 290,
    totalCopies: 2,
    description: "Роман",
    borrows: 2,
    returns: 1,
    ratings: [5, 4, 5],
  },
  {
    title: "Захар Беркут",
    author: "Іван Франко",
    genre: "повість",
    year: 1883,
    price: 210,
    totalCopies: 3,
    description: "Історична повість",
  },
  {
    title: "Чорна рада",
    author: "Пантелеймон Куліш",
    genre: "роман",
    year: 1857,
    price: 260,
    totalCopies: 2,
    description: "історичний роман.",
  },
  {
    title: "Тигролови",
    author: "Іван Багряний",
    genre: "роман",
    year: 1944,
    price: 310,
    totalCopies: 3,
    description: "Пригодницький роман",
    borrows: 3,
    returns: 1,
    ratings: [5, 5],
  },
  {
    title: "1984",
    author: "Джордж Орвелл",
    genre: "антиутопія",
    year: 1949,
    price: 400,
    totalCopies: 4,
    isbn: "978-0-451-52493-5",
    description: "Роман",
    borrows: 4,
    returns: 3,
    ratings: [5, 5, 5, 4],
  },
  {
    title: "Clean Code",
    author: "Robert Martin",
    genre: "програмування",
    year: 2008,
    price: 1450,
    totalCopies: 2,
    isbn: "978-0-13-235088-4",
    description: "Як писати зрозумілий код.",
    borrows: 2,
    ratings: [4, 5],
  },
  {
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    genre: "програмування",
    year: 2008,
    price: 980,
    totalCopies: 2,
    isbn: "978-0-596-51774-8",
    description: "JavaScript.",
  },
  {
    title: "Eloquent JavaScript",
    author: "Marijn Haverbeke",
    genre: "програмування",
    year: 2018,
    price: 1100,
    totalCopies: 3,
    isbn: "978-1-59327-950-9",
    description: "Вступ до програмування на JavaScript.",
    borrows: 1,
    returns: 1,
    ratings: [5],
  },
  {
    title: "Node.js Design Patterns",
    author: "Mario Casciaro, Luciano Mammino",
    genre: "програмування",
    year: 2020,
    price: 1600,
    totalCopies: 1,
    isbn: "978-1-83921-411-0",
    description: "Шаблони проєктування для Node.js.",
    borrows: 1,
  },
];

async function seed() {
  const database = await db.connect();
  await database.collection("books").deleteMany({});

  const bookDao = new MongoBookDao(database);
  await bookDao.init();
  const bookService = new BookService(bookDao);

  for (const { borrows = 0, returns = 0, ratings = [], ...data } of books) {
    const book = await bookService.create(data);

    for (let i = 0; i < borrows; i++) {
      await bookService.borrow(book.id);
    }
    for (let i = 0; i < returns; i++) {
      await bookService.returnBook(book.id);
    }
    for (const score of ratings) {
      await bookService.rate(book.id, { score });
    }
  }

  console.log(`Додано книг: ${books.length}`);
}

seed()
  .catch((err) => {
    console.error("Помилка заповнення бази:", err.message);
    process.exitCode = 1;
  })
  .finally(() => db.disconnect());
