const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Note = sequelize.define(
  "Note",
  {
    id_Catatan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    judul_Catatan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi_Catatan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "notes",
  }
);

module.exports = Note;
