const sequelize = require("../config/database");
const Note = require("./note");
const User = require("./user");

const db = {
  sequelize,
  User,
  Note,
};

module.exports = db;
