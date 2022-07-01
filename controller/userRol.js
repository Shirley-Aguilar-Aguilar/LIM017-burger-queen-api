const {
  schemeTablaUserRoles,
} = require('../models/modelScheme');

module.exports = {
  getListOfUserRoles: async (req, resp) => {
    schemeTablaUserRoles.findAll()
      .then((data) => {
        const newFormat = data.map((userRol) => {
          const objectData = {
            id: userRol.dataValues.id,
            name: userRol.dataValues.name,
          };
          return objectData;
        });
        resp.status(200).json(newFormat);
      })
      .catch((error) => { resp.status(500).json({ error: error.message }); });
  },
};
