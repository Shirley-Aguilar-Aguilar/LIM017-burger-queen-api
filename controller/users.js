const bcrypt = require('bcrypt');

const {
  schemeTablaUser,
  schemeTablaUserRoles,
} = require('../models/modelScheme');

module.exports = {
  getUsers: (req, resp, next) => {
    // findAll metodo que recorre filas y retorna los arreglos
    schemeTablaUser.findAll({
      include: [{
        model: schemeTablaUserRoles,
      }],
    });
    schemeTablaUser.findAll()
      .then((data) => {
        const newFormat = data.map((user) => {
          const objectData = {
            id: user.dataValues.id,
            email: user.dataValues.email,
            password: user.dataValues.password,
            admin: user.dataValues.roles,
            userRol: user.dataValues.userrol,

          };
          return objectData;
        });
        resp.status(200).json(newFormat);
      })
      .catch((error) => { resp.status(500).json({ error: error.message }); });
  },
  getUserId: async (req, resp) => {
    const userIdAsParm = req.params.uid;

    const foundedUser = await schemeTablaUser.findByPk(userIdAsParm, {
      include: [{
        model: schemeTablaUserRoles,
      }],
    });
    if (foundedUser) {
      return resp.status(200).json({
        id: foundedUser.id,
        email: foundedUser.email,
        password: foundedUser.password,
        roles: foundedUser.roles,
        userRol: foundedUser.dataValues.userrol,
      });
    }
    return resp.status(404).json({ error: 'User not found.' });
  },

  postUsers: async (req, resp, next) => {
    const emailFromReq = req.body.email;
    const passwordFromReq = req.body.password;
    const rolesFromReq = req.body.roles;
    const userRolIdFromReq = req.body.userrolid;
    if (emailFromReq == null || passwordFromReq == null || emailFromReq === '' || passwordFromReq === '') {
      return resp.status(400).json({ message: 'Email and password must not be empty.' });
    }
    if (userRolIdFromReq == null || userRolIdFromReq === '') {
      return resp.status(400).json({ message: 'User rol Id must not be empty.' });
    }

    const foundedUserRol = await schemeTablaUserRoles.findByPk(userRolIdFromReq);
    if (!foundedUserRol) {
      return resp.status(400).json({ message: 'User rol Id is invalid. No user rol was found.' });
    }
    // guardar password encriptado al crear y guardar un nuevo user
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(passwordFromReq, salt);

    schemeTablaUser.create({
      email: emailFromReq,
      password: encryptedPassword,
      roles: rolesFromReq,
      userrolId: userRolIdFromReq,
    }).then((data) => {
      resp.status(200).json({
        id: data.dataValues.id,
        email: data.dataValues.email,
        password: data.dataValues.password,
        roles: data.dataValues.roles,
        userRol: foundedUserRol.dataValues.name,
      });
    })
      .catch((error) => { resp.status(403).json({ error: error.message }); });
  },

  putUsers: async (req, resp, next) => {
    const userIdAsParm = req.params.uid; // id
    const foundedUser = await schemeTablaUser.findByPk(userIdAsParm);
    // actualizar los campos email password y roles
    const newEmail = req.body.email;
    const newPassword = req.body.password;
    const newRoles = req.body.roles;
    if (newEmail == null || newPassword == null || newEmail === '' || newPassword === '') {
      return resp.status(400).json({ message: 'Email and password must not be empty.' });
    }
    if (foundedUser) {
      try {
        foundedUser.email = newEmail;
        foundedUser.password = newPassword;
        foundedUser.roles = newRoles;

        await foundedUser.save();
        return resp.status(200).json({
          id: foundedUser.dataValues.id,
          email: newEmail,
          password: newPassword,
          roles: {
            admin: newRoles,
          },
        });
      } catch (error) {
        return resp.status(500).json({ error: error.message });
      }
    } else {
      return resp.status(404).json({ error: 'User not found.' });
    }
  },
  deleteUsers: async (req, resp, next) => {
    const userIdAsParm = req.params.uid;
    const foundedUser = await schemeTablaUser.findByPk(userIdAsParm);
    if (foundedUser) {
      try {
        // metodo destroy elimina/ en where se especifica el id
        await schemeTablaUser.destroy({ where: { id: userIdAsParm } });
        return resp.status(200).json({ message: 'User was deleted' });
      } catch (error) {
        return resp.status(404).json({ error: 'User was not deleted' });
      }
    }
    return resp.status(404).json({ error: 'User not found.' });
  },
};
