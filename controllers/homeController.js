const { PrismaClient } = require("../generated/prisma");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const formatDate = require("../utils/formatDates");
const byteSize = require("byte-size");

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
    home: true,
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

  const folders = await prisma.folder.findMany();

  if (!folder) {
    throw new Error("Folder not found");
  }

  const files = folder[0].File.map((file) => file);

  res.render("home/folderInformation", {
    folder: folder,
    folders: folders,
    files: files,
  });
});

exports.getFolders = asyncHandler(async (req, res) => {
  const folders = await prisma.folder.findMany();
  res.render("home/homePage", {
    folders: folders.length > 0 ? folders : "",
    foldersOnly: true,
  });
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

      const folders = await prisma.folder.findMany();
      res.render("home/folderInformation", {
        folder: folder,
        folders: folders,
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

exports.postFile = asyncHandler(async (req, res) => {
  const fileSize = byteSize(req.file.size);
  const file = await prisma.file.create({
    data: {
      filePath: req.file.path,
      fileName: req.file.filename,
      folderId: Number(req.body.folder),
      size: `${fileSize.value}${fileSize.unit}`,
      userId: req.user.id,
    },
  });
  if (!file) {
    throw new Error("There seems to be an error uploading file.");
  }
  console.log(req.path);
  res.redirect("/home");
});
