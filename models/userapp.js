'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserApp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserApp.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    longtuide: DataTypes.STRING,
    latuide: DataTypes.STRING,
    phone: DataTypes.STRING,
    country: DataTypes.STRING,
    map: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'UserApp',
  });
  return UserApp;
};