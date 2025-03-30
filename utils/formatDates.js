const { format } = require("date-fns");

const formatDate = (folder) => {
  const dateCreated = folder[0].dateCreated;
  const updatedAt = folder[0].updatedAt;

  folder[0].dateCreated = format(new Date(dateCreated), "M/d/yyyy, h:mm aaa");
  folder[0].updatedAt = format(new Date(updatedAt), "M/d/yyyy, h:mm aaa");

  return folder;
};

module.exports = formatDate;
