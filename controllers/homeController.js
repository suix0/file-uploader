const { PrismaClient } = require("../generated/prisma");
const asyncHandler = require("express-async-handler");

exports.getHome = (req, res) => {
  res.send(`Hello, ${req.user.username}`);
};
