const { Router } = require("express");
const homeController = require("../controllers/homeController");
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

homeRouter.get("/", homeController.getHomePage);
homeRouter.get("/folder/:folderId", homeController.getFolder);

homeRouter.post("/file/upload", upload.single("file"), (req, res) => {
  res.redirect("/home");
});
homeRouter.post("/folder/upload", homeController.postFolder);

module.exports = homeRouter;
