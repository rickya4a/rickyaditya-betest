const users = require("../controllers/user.controller.js");
const {
  checkDuplicateAccountNumberOrEmail,
  verifyToken
} = require("../middlewares/auth.js")
const { cacheData } = require('../middlewares/cache.js')

module.exports = app => {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );

    next();
  });

  var router = require("express").Router();

  router.post("/signup", [checkDuplicateAccountNumberOrEmail], users.create);
  router.post("/generate-token", users.generateToken);
  router.get("/", [verifyToken, cacheData], users.findAll);
  router.put("/:accountNumber", [verifyToken], users.update);
  router.delete("/:accountNumber", [verifyToken], users.delete);
  // router.get("/", users.findAll);
  // router.get("/published", users.findAllPublished);
  // router.get("/:id", users.findOne);
  // router.put("/:id", users.update);
  // router.delete("/:id", users.delete);
  // router.delete("/", users.deleteAll);

  app.use("/api/users", router);
};
