const generateEmployeeId = (lastEmployeeId) => {
  if (!lastEmployeeId) {
    return "DIT-EMP-0001";
  }

  const number = parseInt(lastEmployeeId.split("-")[2]);

  const nextNumber = String(number + 1).padStart(4, "0");

  return `DIT-EMP-${nextNumber}`;
};

module.exports = generateEmployeeId;
