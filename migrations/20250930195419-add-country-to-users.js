'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'country', {
      type: Sequelize.STRING,
      allowNull: true, 
      after: 'phone'   
    });
    await queryInterface.addColumn('Users', 'map', {
      type: Sequelize.STRING,
      allowNull: true, 
      after: 'country'  
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'country');
    await queryInterface.removeColumn('Users', 'map');
  }
};