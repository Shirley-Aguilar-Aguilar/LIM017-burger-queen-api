const bcrypt = require('bcrypt');

const {
  schemeTablaUser,
  schemeTablaUserRoles,
} = require('../models/modelScheme');

module.exports = {
  getUsers: (req, resp) => {
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
            admin: user.dataValues.admin,
            userRol: user.dataValues.userrolid,

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
        name: foundedUser.name,
        email: foundedUser.email,
        password: foundedUser.password,
        admin: foundedUser.admin,
        userRol: foundedUser.dataValues.userrolid,
      });
    }
    return resp.status(404).json({ error: 'User not found.' });
  },

  postUsers: async (req, resp) => {
    const nameUserFromReq = req.body.name;
    const emailFromReq = req.body.email;
    const passwordFromReq = req.body.password;
    const rolesFromReq = req.body.admin;
    const userRolIdFromReq = req.body.userRolId;

    if (nameUserFromReq == null || nameUserFromReq == null || nameUserFromReq === '' || nameUserFromReq === '') {
      return resp.status(400).json({ message: 'Name must not be empty.' });
    }

    if (emailFromReq == null || passwordFromReq == null || emailFromReq === '' || passwordFromReq === '') {
      return resp.status(400).json({ message: 'Email and password must not be empty.' });
    }

    if (rolesFromReq == null || rolesFromReq === '') {
      return resp.status(400).json({ message: 'Admin must not be empty.' });
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
      name: nameUserFromReq,
      email: emailFromReq,
      password: encryptedPassword,
      admin: rolesFromReq,
      userrolId: userRolIdFromReq,
    }).then((data) => {
      resp.status(200).json({
        id: data.dataValues.id,
        name: nameUserFromReq,
        email: data.dataValues.email,
        admin: data.dataValues.admin,
        userRol: foundedUserRol.dataValues.name,
      });
    })
      .catch((error) => { resp.status(403).json({ error: error.message }); });
  },

  putUsers: async (req, resp) => {
    const userIdAsParm = req.params.uid; // id
    const foundedUser = await schemeTablaUser.findByPk(userIdAsParm);
    // actualizar los campos email password y roles
    const newEmail = req.body.email;
    const newPassword = req.body.password;
    const newAdmi = req.body.admin;
    const newRol = req.body.userRol;
    if (newEmail == null || newPassword == null || newEmail === '' || newPassword === '') {
      return resp.status(400).json({ message: 'Email and password must not be empty.' });
    }
    if (foundedUser) {
      try {
        foundedUser.email = newEmail;
        foundedUser.password = newPassword;
        foundedUser.admin = newAdmi;
        foundedUser.userRol = newRol;

        await foundedUser.save();
        return resp.status(200).json({
          id: foundedUser.dataValues.id,
          email: newEmail,
          password: newPassword,
          admin: newAdmi,
          userRolesId: newRol,
        });
      } catch (error) {
        return resp.status(500).json({ error: error.message });
      }
    } else {
      return resp.status(404).json({ error: 'User not found.' });
    }
  },
  deleteUsers: async (req, resp) => {
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
