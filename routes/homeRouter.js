const { Router } = require("express");
const homeController = require("../controllers/homeController");
const isAuth = require("./authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    if (req.body.fileName) {
      let fileName = req.body.fileName;
      const mimeType = file.mimetype;
      switch (mimeType) {
        case "application/pdf":
          fileName = fileName + ".pdf";
          break;
        case "application/msword":
          fileName = fileName + ".docs";
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          fileName = fileName + ".docx";
          break;
        case "application/vnd.oasis.opendocument.text":
          fileName = fileName + ".odt";
          break;
        case "image/jpeg":
          fileName = fileName + ".jpeg";
          break;
        case "image/png":
          fileName = fileName + ".png";
          break;
        case "text/plain":
          fileName = fileName + ".txt";
          break;
        default:
          cb(new Error("File name not allowed."));
      }
      cb(null, fileName);
    } else {
      cb(null, file.originalname);
    }
  },
});
const upload = multer({ storage: storage });
const homeRouter = Router();

homeRouter.get("/", isAuth, homeController.getHomePage);
homeRouter.get("/folder/:folderId", homeController.getFolder);
homeRouter.get("/folders", homeController.getFolders);
homeRouter.get("/files", homeController.getFiles);
homeRouter.get("/files/:fileId", homeController.getFile);

homeRouter.post("/file/upload", upload.single("file"), homeController.postFile);
homeRouter.post("/folder/upload", homeController.postFolder);
homeRouter.post("/folder/rename/:folderId", homeController.postFolderRename);
homeRouter.post("/folder/delete/:folderId", homeController.postFolderDelete);

module.exports = homeRouter;
