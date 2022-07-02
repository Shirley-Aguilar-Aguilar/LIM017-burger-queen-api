/* eslint-disable max-len */
const Sequelize = require('sequelize');
// database, username,password
// la conexión permite crear tablas

const postgreConnection = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_USER_PASSWORD, {
  host: process.env.DB_HOSTNAME, // lugar donde esta la base de datos
  port: 5432,
  dialect: 'postgres',
  logging: false,

});

module.exports = {
  postgreConnection,
};
