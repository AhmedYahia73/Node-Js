'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING, 
    image: DataTypes.STRING, 
    longtuide: DataTypes.STRING,
    latuide: DataTypes.STRING,
    vip: DataTypes.BOOLEAN,
    color: DataTypes.STRING,
    gender: DataTypes.STRING,
    birth_date: DataTypes.DATE,
    vip_from: DataTypes.DATE,
    vip_to: DataTypes.DATE,
    bio: DataTypes.STRING,
    phone: DataTypes.STRING, 
    country: DataTypes.STRING,
    map: DataTypes.STRING,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};