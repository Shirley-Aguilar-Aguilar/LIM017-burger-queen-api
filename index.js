const config = require('./config');
const app = require('./server');

const { port } = config;

// TODO: Conexión a la Base de Datos (MongoDB o MySQL)
const {
  postgreConnection,
} = require('./database/database');

const connection = postgreConnection;

try {
  connection.authenticate();
  console.log('Connection has been established successfully.');
  connection.sync({ alter: true }); // sincronizacion con base de datos
  // force(elimina anteriores) alter: añade cambios
} catch (error) {
  console.error('Unable to connect to the database..Ending backend:', error);
}

const main = async () => {
  await app.listen(port);
  console.info(`App listening on port ${port}`);
};

main();
