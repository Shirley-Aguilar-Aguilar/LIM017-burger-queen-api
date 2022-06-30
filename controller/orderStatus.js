const {
  schemeTablaOrderStatus,
} = require('../models/modelScheme');

module.exports = {
  getListOfOrderStatuses: async (req, resp, next) => {
    schemeTablaOrderStatus.findAll()
      .then((data) => {
        const newFormat = data.map((orderStatus) => {
          const objectData = {
            id: orderStatus.dataValues.id,
            statusCode: orderStatus.dataValues.statusCode,
            description: orderStatus.dataValues.description,
          };
          return objectData;
        });
        resp.status(200).json(newFormat);
      })
      .catch((error) => { resp.status(500).json({ error: error.message }); });
  },
};
