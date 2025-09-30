'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserApps', 'country', {
      type: Sequelize.STRING,
      allowNull: true, 
      after: 'phone'   
    });
    await queryInterface.addColumn('UserApps', 'map', {
      type: Sequelize.STRING,
      allowNull: true, 
      after: 'country'  
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserApps', 'country');
    await queryInterface.removeColumn('UserApps', 'map');
  }
};
