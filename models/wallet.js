"use strict";
const { Model } = require("sequelize");
const { rupiahFormat } = require("../helpers/currencyFormat");
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Wallet.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
    get rupiahFormat() {
      return rupiahFormat(this.balance);
    }
  }
  Wallet.init(
    {
      balance: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Wallet",
    },
  );
  return Wallet;
};
