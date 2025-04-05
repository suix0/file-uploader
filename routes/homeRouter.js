const { Router } = require("express");
const homeController = require("../controllers/homeController");
const isAuth = require("./authMiddleware");
const homeRouter = Router();
const multer = require("multer");
const appendExtension = require("../utils/fileExtension");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    if (req.body.fileName) {
      appendExtension(req.body.fileName, file.mimetype, cb);
    } else {
      appendExtension(file.originalname, file.mimetype, cb);
    }
  },
});
const upload = multer({ storage: storage });

homeRouter.get("/", isAuth, homeController.getHomePage);
homeRouter.get("/folder/:folderId", isAuth, homeController.getFolder);
homeRouter.get("/folders", isAuth, homeController.getFolders);
homeRouter.get("/files", isAuth, homeController.getFiles);
homeRouter.get("/files/:fileId", isAuth, homeController.getFile);
homeRouter.get("/logout", homeController.logOut);

homeRouter.post("/file/upload", upload.single("file"), homeController.postFile);
homeRouter.post("/folder/upload", homeController.postFolder);
homeRouter.post("/folder/rename/:folderId", homeController.postFolderRename);
homeRouter.post("/folder/delete/:folderId", homeController.postFolderDelete);

module.exports = homeRouter;
