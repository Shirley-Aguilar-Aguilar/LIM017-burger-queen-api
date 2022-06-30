const {
  postUsers,
} = require('../controller/users');

const {
  getListOfOrderStatuses,
} = require('../controller/orderStatus');

const {
  getListOfUserRoles,
} = require('../controller/userRol');

/** @module admin */
module.exports = (app) => {
  app.post('/admin/create', postUsers);
  app.get('/order/statuses', getListOfOrderStatuses);
  app.get('/user/roles', getListOfUserRoles);
};
