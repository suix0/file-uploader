const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma");
const path = require("node:path");
const app = express();
const indexRouter = require("./routes/indexRouter");
const homeRouter = require("./routes/homeRouter");
const cors = require("cors");

require("dotenv").config();

app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

/* Middleware for Session Authentication */
// Define session
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: false,
    }),
  })
);
app.use(passport.session());

require("./config/passport");

/* Define the routers */
app.use("/", indexRouter);
app.use("/home", homeRouter);

app.use((err, req, res, next) => {
  console.log(req.get("referrer"));
  res.status(err.statusCode || 400).render("errors/errorPage", {
    status: 400,
    error: err.message,
  });
});
app.listen(5000);
