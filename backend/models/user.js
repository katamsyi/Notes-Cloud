const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Definisi model User sesuai tabel `users` di database
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Sequelize akan otomatis membuat kolom createdAt dan updatedAt
    tableName: "users", // Nama tabel di database
  }
);

module.exports = User;
