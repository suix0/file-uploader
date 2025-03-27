const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const validateRegistration = [
  body("username").trim().notEmpty().withMessage("Username can't be empty."),
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
  res.render("index/signIn", { isIndex: true });
};

exports.getRegisterPage = (req, res) => {
  res.render("index/register", { isIndex: true });
};

exports.postRegistration = [
  validateRegistration,
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      res.render("index/register", {
        isIndex: true,
        error: errors.array(),
        username: req.body.username,
      });
    }
  },
];
