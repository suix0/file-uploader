const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const authenticateUser = async (username, password, done) => {};

const strategy = new LocalStrategy(authenticateUser);

passport.use(strategy);
