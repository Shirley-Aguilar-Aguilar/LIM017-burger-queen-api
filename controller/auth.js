const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');

const {
  schemeTablaUser,
} = require('../models/modelScheme');

module.exports = {
  postAuth: async (req, resp, next) => {
    const emailFromReq = req.body.email;
    const passwordFromReq = req.body.password;

    if (emailFromReq == null || passwordFromReq == null || emailFromReq === '' || passwordFromReq === '') {
      return resp.status(400).json({ message: 'Email and password must not be empty.' });
    }

    const foundedUser = await schemeTablaUser.findOne(
      { where: { email: emailFromReq } },
    );

    if (foundedUser) {
      // comparamos password desde request con password encriptado en la bd
      const validPassword = await bcrypt.compare(passwordFromReq, foundedUser.password);
      if (validPassword) {
        // generar token
        // datos para token
        const payload = {
          email: emailFromReq,
          admin: foundedUser.admin,
        };
        // jwv recibe la data a guardar, palabras clave y el tiempo de duración.
        const token = jwt.sign(payload, config.secret, {
          expiresIn: config.access_token_life_in_seconds,
        });

        return resp.status(200).json({
          accessToken: token,
          name: foundedUser.name,
          email: foundedUser.email,
          admin: foundedUser.admin,
          userRol: foundedUser.userRol,
        });
      }
      return resp.status(404).json({ message: 'Credentials are invalid.' });
    }
    resp.status(404).json({ message: 'User does not exist.' });
    // TODO: autenticar a la usuarix
    next();
  },
};
