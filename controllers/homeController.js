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

exports.getHomePage = async (req, res) => {
  const folders = await prisma.folder.findMany();
  res.render("home/homePage", {
    user: req.user.username,
    folders: folders.length > 0 ? folders : "",
  });
};

exports.getFolder = asyncHandler(async (req, res) => {
  const folderId = Number(req.params.folderId);
  const folder = await prisma.folder.findMany({
    where: {
      id: folderId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      File: true,
    },
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  res.render("home/folderInformation", { folder: folder });
});

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
