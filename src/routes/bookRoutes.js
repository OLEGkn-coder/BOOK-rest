const express = require("express");

function createBookRouter(controller) {
  const router = express.Router();

  router.get("/stats", controller.getStats);
  router.get("/top-rated", controller.getTopRated);
  router.get("/popular", controller.getPopular);
  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.put("/:id", controller.replace);
  router.patch("/:id", controller.patch);
  router.delete("/:id", controller.delete);
  router.post("/:id/borrow", controller.borrow);
  router.post("/:id/return", controller.returnBook);
  router.post("/:id/rate", controller.rate);

  return router;
}

module.exports = createBookRouter;
