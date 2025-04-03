const { format } = require("date-fns");

const formatDate = (file) => {
  const dateCreated = file.dateCreated;
  const updatedAt = file.updatedAt;

  file.dateCreated = format(new Date(dateCreated), "M/d/yyyy, h:mm aaa");
  file.updatedAt = format(new Date(updatedAt), "M/d/yyyy, h:mm aaa");

  return file;
};

module.exports = formatDate;
