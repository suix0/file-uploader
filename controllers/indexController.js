const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.getIndexPage = (req, res) => {
  res.render("index/signIn", { isIndex: true });
};

exports.getRegisterPage = (req, res) => {
  res.render("index/register", { isIndex: true });
};
