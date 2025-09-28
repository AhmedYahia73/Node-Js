'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Chat.init({
    sender_id: DataTypes.STRING,
    receiver_id: DataTypes.STRING,
    message: DataTypes.STRING,
    deleted: DataTypes.BOOLEAN,
    is_read: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};