const { PrismaClient } = require("../generated/prisma");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const formatDate = require("../utils/formatDates");

const prisma = new PrismaClient();

const folderValidate = [
  body("folderName")
    .trim()
    .notEmpty()
    .withMessage("Folder name can't be empty."),
];

const folderRenameValidate = [
  body("updatedFolderName")
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
  let folder = await prisma.folder.findMany({
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

  folder = formatDate(folder);

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

exports.postFolderRename = [
  folderRenameValidate,
  async (req, res) => {
    const folderId = Number(req.params.folderId);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let folder = await prisma.folder.findMany({
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
      folder = formatDate(folder);
      res.render("home/folderInformation", {
        folder: folder,
        error: errors.array(),
        openFolderForm: true,
      });
      return;
    }
    const updatedFolder = await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        folderName: req.body.updatedFolderName,
      },
    });

    if (!updatedFolder) {
      throw new Error("Folder does not exist!");
    }

    res.redirect("/home");
  },
];

exports.postFolderDelete = asyncHandler(async (req, res) => {
  const folderId = Number(req.params.folderId);
  const deletedFolder = await prisma.folder.delete({
    where: {
      id: folderId,
    },
  });

  if (!deletedFolder) {
    throw new Error("Folder does not exist!");
  }

  res.redirect("/home");
});
