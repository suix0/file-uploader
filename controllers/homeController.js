const { PrismaClient } = require("../generated/prisma");
const asyncHandler = require("express-async-handler");

exports.getHomePage = (req, res) => {
  res.render("home/homePage", { user: req.user.username });
};
