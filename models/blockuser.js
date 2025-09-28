'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BlockUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BlockUser.init({
    user_id: DataTypes.STRING,
    friend_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BlockUser',
  });
  return BlockUser;
};