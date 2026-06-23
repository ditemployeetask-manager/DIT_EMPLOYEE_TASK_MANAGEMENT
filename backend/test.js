const bcrypt = require("bcrypt");

bcrypt.hash("employee123", 10).then(console.log);
