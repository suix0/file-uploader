const { Router } = require("express");
const indexController = require("../controllers/indexController");
const passport = require("passport");

const indexRouter = Router();

indexRouter.get("/", indexController.getIndexPage);
indexRouter.post(
  "/login",
  passport.authenticate("local", {
    sucessRedirect: "/",
    failureRedirect: "/login",
  })
);

indexRouter.get("/register", indexController.getRegisterPage);
indexRouter.post("/register", indexController.postRegistration);
module.exports = indexRouter;
