const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("../generated/prisma");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

const validateRegistration = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username can't be empty.")
    .custom(async (value) => {
      const isExist = await prisma.user.findMany({
        where: {
          username: value,
        },
      });
      console.log(isExist);
      console.log(value);
      return isExist.username === value;
    })
    .withMessage(`Username is already taken.`),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password can't be empty.")
    .isLength({ min: 8 })
    .withMessage("Password must have at least 8 characters"),
  body("confirmPassword")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords did not match. Please try again."),
];

exports.getIndexPage = (req, res) => {
  if (req.user) {
    res.redirect("/home");
    return;
  } else {
    res.render("index/signIn", { isIndex: true });
  }
};

exports.getRegisterPage = (req, res) => {
  res.render("index/register", { isIndex: true });
};

exports.postRegistration = [
  validateRegistration,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("index/register", {
        isIndex: true,
        error: errors.array(),
      });
      return;
    }
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await prisma.user.create({
        data: {
          username: req.body.username,
          password: hashedPassword,
        },
      });
      res.render("index/signIn", {
        message: "Account created successfully.",
      });
    } catch (err) {
      console.error(err);
    }
  },
];
