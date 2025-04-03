const appendExtension = (file, mimeType, cb) => {
  switch (mimeType) {
    case "application/pdf":
      file = file + ".pdf";
      cb(null, file);
      break;
    case "application/msword":
      file = file + ".docs";
      cb(null, file);
      break;
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      file = file + ".docx";
      cb(null, file);
      break;
    case "application/vnd.oasis.opendocument.text":
      file = file + ".odt";
      cb(null, file);
      break;
    case "image/jpeg":
      file = file + ".jpeg";
      cb(null, file);
      break;
    case "image/png":
      file = file + ".png";
      cb(null, file);
      break;
    case "text/plain":
      file = file + ".txt";
      cb(null, file);
      break;
    default:
      return cb(
        new Error("Invalid file type. Only PDFs, Docs, and Images are allowed")
      );
  }
};

module.exports = appendExtension;
