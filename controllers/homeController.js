const { PrismaClient } = require("../generated/prisma");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

const folderValidate = [
  body("folderName")
    .trim()
    .notEmpty()
    .withMessage("Folder name can't be empty."),
];

exports.getHomePage = (req, res) => {
  res.render("home/homePage", { user: req.user.username });
};

exports.postFolder = [
  folderValidate,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("home/homePage", {
        user: req.user.username,
        error: errors.array(),
        openFolderForm: true,
      });
      return;
    }
    await prisma.folder.create({
      data: {
        folderName: req.body.folderName,
        userId: req.user.id,
      },
    });
    res.redirect("/home");
  },
];
