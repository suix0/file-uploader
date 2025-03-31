const { Router } = require("express");
const homeController = require("../controllers/homeController");
const isAuth = require("./authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    console.log(file);
    if (req.body.fileName) {
      cb(null, req.body.fileName);
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

homeRouter.post("/file/upload", upload.single("file"), (req, res) => {
  res.redirect("/home");
});
homeRouter.post("/folder/upload", homeController.postFolder);
homeRouter.post("/folder/rename/:folderId", homeController.postFolderRename);
homeRouter.post("/folder/delete/:folderId", homeController.postFolderDelete);

module.exports = homeRouter;
