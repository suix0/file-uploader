const express = require("express");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma");
const app = express();

require("dotenv").config();

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
app.use(passport(session));

require("./config/passport");

/* Define the routers */

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(5000);
