const { PrismaClient } = require("../generated/prisma");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const formatDate = require("../utils/formatDates");
const byteSize = require("byte-size");
const path = require("node:path");
const custom404 = require("../errors/custom404");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs/promises");

require("dotenv").config({ path: __dirname });

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
  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
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
  const files = await prisma.file.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      folder: {
        select: {
          folderName: true,
        },
      },
    },
  });
  res.render("home/homePage", {
    user: req.user.username,
    folders: folders.length > 0 ? folders : "",
    files: files.length > 0 ? files : "",
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

  if (folder.length < 1) {
    throw new Error("Folder not found");
  }

  folder[0] = formatDate(folder[0]);

  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
    },
  });

  const files = folder[0].File.map((file) => file);
  res.render("home/folderInformation", {
    folder: folder,
    folders: folders,
    files: files,
  });
});

exports.getFolders = asyncHandler(async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
    },
  });
  res.render("home/homePage", {
    folders: folders.length > 0 ? folders : "",
    foldersOnly: true,
  });
});

exports.getFiles = asyncHandler(async (req, res) => {
  let files = await prisma.file.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      folder: {
        select: {
          folderName: true,
        },
      },
      user: {
        select: {
          username: true,
        },
      },
    },
  });
  const folders = await prisma.folder.findMany({
    where: {
      userId: req.user.id,
    },
  });
  files = files.map((file) => formatDate(file));
  res.render("home/files", { files: files, folders: folders });
});

exports.getFile = asyncHandler(async (req, res) => {
  const fileId = Number(req.params.fileId);
  let file = await prisma.file.findMany({
    where: {
      id: fileId,
      userId: req.user.id,
    },
    include: {
      folder: {
        select: {
          folderName: true,
        },
      },
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  if (file.length < 1) {
    throw new custom404("File does not exist");
  }

  file[0] = formatDate(file[0]);

  res.render("home/fileInformation", {
    file: file[0],
    returnPath: req.get("referrer"),
    filePath: file[0].filePath,
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
    res.redirect(req.get("referrer"));
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
          userId: req.user.id,
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

      folder[0] = formatDate(folder[0]);

      const folders = await prisma.folder.findMany({
        where: {
          userId: req.user.id,
        },
      });
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

    if (updatedFolder.length < 1) {
      throw new Error("Folder does not exist!");
    }

    res.redirect(req.get("referrer"));
  },
];

exports.postFolderDelete = asyncHandler(async (req, res) => {
  const folderId = Number(req.params.folderId);
  const deletedFolder = await prisma.folder.delete({
    where: {
      id: folderId,
      userId: req.user.id,
    },
  });

  if (!deletedFolder) {
    throw new Error("Folder does not exist!");
  }

  res.redirect("/home/folders");
});

exports.postFile = asyncHandler(async (req, res) => {
  const fileSize = byteSize(req.file.size);

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  try {
    // Read file
    const fileBuffer = await fs.readFile(req.file.path);

    // Upload file to supabase storage
    const { data, error } = await supabase.storage
      .from("user-files")
      .upload(`${req.file.filename}`, fileBuffer, {
        upsert: true,
        contentType: req.file.mimetype,
      });
    if (error) {
      console.error(error);
    }
  } catch (err) {
    console.error(err);
  }

  // Get the URL of the uploaded file
  const fileUrl = supabase.storage
    .from("user-files")
    .getPublicUrl(`${req.file.filename}`);

  // Store the file in the database
  let file = await prisma.file.create({
    data: {
      filePath: fileUrl.data.publicUrl,
      fileName: req.file.filename,
      folderId: Number(req.body.folder),
      size: `${fileSize.value}${fileSize.unit}`,
      userId: req.user.id,
    },
  });
  if (!file) {
    throw new Error("There seems to be an error uploading file.");
  }

  // Delete the file
  try {
    await fs.unlink(`uploads/${req.file.filename}`);
  } catch (err) {
    console.error(err);
  }

  res.redirect(req.get("referrer"));
});

exports.logOut = asyncHandler((req, res) => {
  req.logOut((err) => {
    if (err) {
      throw new Error("You are not logged in.");
    }
  });
  res.redirect("/");
});
