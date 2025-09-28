'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paymob extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Paymob.init({
    title: DataTypes.STRING,
    type: DataTypes.STRING,
    callback: DataTypes.STRING,
    api_key: DataTypes.STRING,
    iframe_id: DataTypes.STRING,
    integration_id: DataTypes.STRING,
    Hmac: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Paymob',
  });
  return Paymob;
};