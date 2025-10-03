'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */ 
      await queryInterface.addColumn('Users', 'mute', {
        type: Sequelize.BOOLEAN,
        defaultValue: false, 
      });
  },

  async down (queryInterface, Sequelize) { 
    await queryInterface.removeColumn('Users', 'mute');
  }
};
