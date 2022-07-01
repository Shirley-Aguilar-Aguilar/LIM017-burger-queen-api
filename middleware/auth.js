const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return next(403);
    }

    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
  });
};

module.exports.isAuthenticated = (req) => {
  // console.log('checking req access-token:: ', req.headers['access-token']);
  const token = req.headers['access-token'];
  let flagTokenValid = false;

  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        // console.log('token no valido!!!!!');
      } else {
        req.decoded = decoded;
        // console.log('token SI valido!!!!! decoded ', decoded);
        flagTokenValid = true;
      }
    });
  } else {
    // console.log("token NO ENVIADO en el request");
  }
  return flagTokenValid;
};

module.exports.isAdmin = (req) => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  let flagIsAdmin = false;
  // console.log('checking isAdmin req:: ', req);
  jwt.verify(req.headers['access-token'], config.secret, (err, decoded) => {
    if (err) {
      // console.log('token no valido!!!!!');
    } else {
      req.decoded = decoded;
      // console.log('token SI valido!!!!! decoded ', decoded);
      // console.log('token SI valido!!!!! decoded email ', decoded.email);

      flagIsAdmin = decoded.admin;
    }
  });
  // console.log('retornando flagIsAdmin ', flagIsAdmin);
  return flagIsAdmin;
};

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
