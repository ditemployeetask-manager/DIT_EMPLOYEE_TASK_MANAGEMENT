const generateAdminId = (lastId) => {
  if (!lastId) {
    return "DIT-EMP-0001";
  }

  const number = parseInt(lastId.split("-")[2]);

  const nextNumber = String(number + 1).padStart(4, "0");

  return `DIT-EMP-${nextNumber}`;
};

module.exports = generateAdminId;
