const { Router } = require("express");
const homeController = require("../controllers/homeController");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
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

homeRouter.post("/file/upload", upload.single("file"), (req, res) => {
  res.redirect("/home");
});

module.exports = homeRouter;
