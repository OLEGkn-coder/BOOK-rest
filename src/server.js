const config = require("./config");
const db = require("./db");
const MongoBookDao = require("./dao/MongoBookDao");
const BookService = require("./services/BookService");
const createApp = require("./app");

async function start() {
  const database = await db.connect();
  const bookDao = new MongoBookDao(database);
  await bookDao.init();

  const app = createApp(new BookService(bookDao));
  app.listen(config.port, () => {
    console.log(`http://localhost:${config.port}/api/books`);
  });
}

start().catch((err) => {
  console.error("Не вдалося запустити сервер:", err.message);
  process.exit(1);
});
