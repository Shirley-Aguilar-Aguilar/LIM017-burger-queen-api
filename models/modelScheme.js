const { DataTypes } = require('sequelize');
const {
  postgreConnection,
} = require('../database/database');

const connection = postgreConnection;

// creando la tablita User con campos: id , email, password
const schemeTablaUser = connection.define('user', {
  id: {
    type: DataTypes.INTEGER, // tipo de dato
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
    unique: {
      args: true,
      msg: 'Email address already in use!',
    },
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roles: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // valor por defecto
  },

}, { timestamps: false });

// creando la tablita Product con campos: id, name, price, image, type, dataEntry
const schemeTablaProduct = connection.define('product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateEntry: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, { timestamps: false });

// creando tabla de orders
const schemeTablaOrder = connection.define('order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateEntry: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, { timestamps: false });

const schemeTablaOrdersProduct = connection.define('ordersproduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, { timestamps: false });

// el usuario puede tener muchas ordenes
schemeTablaUser.hasOne(schemeTablaOrder, {
  foreingKey: 'userId',
  sourceKey: 'id',
});

// la tabla order pertenece a usuario
schemeTablaOrder.belongsTo(schemeTablaUser, {
  foreingKey: 'userId',
  targetId: 'id',
});

const schemeTablaUserRoles = connection.define('userrol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateCreated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, { timestamps: false });

const schemeTablaOrderStatus = connection.define('orderstatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  statusCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateCreated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, { timestamps: false });

// insert data por defecto
/* connection.sync({ force: true }).then(() => {
  schemeTablaUser.create({
    email: 'admin@gmail.com',
    password: '$2b$10$bhOcgMtXGtqiwdMOh1EZHuydzdr0tcwT/bgjVONRzrzmPZ5MRMdKC',
    // eslint-disable-next-line object-curly-newline
    roles: true });
  schemeTablaUser.create({
    email: 'noadmin@gmail.com',
    password: '$2b$10$bhOcgMtXGtqiwdMOh1EZHuydzdr0tcwT/bgjVONRzrzmPZ5MRMdKC',
    // eslint-disable-next-line object-curly-newline
    roles: false });
  schemeTablaProduct.create({
    name: 'Café americano',
    price: 5.00,
    image: 'https://firebasestorage.googleapis.com/v0/b/burguer-queen-88bf7.appspot.com/o/cafe.jpg?alt=media&token=a262a460-ab7f-47b7-8fc3-9c2205ecce42',
    type: 'DESAYUNO',
  });
  schemeTablaProduct.create({
    name: 'Café con leche',
    price: 7.00,
    image: 'https://firebasestorage.googleapis.com/v0/b/burguer-queen-88bf7.appspot.com/o/cafe-leche.jpg?alt=media&token=c28f114c-27ec-470f-8a7b-e8c3852e1fef',
    type: 'DESAYUNO',
  });
  schemeTablaProduct.create({
    name: 'Jugo de plátano',
    price: 7.00,
    image: 'https://firebasestorage.googleapis.com/v0/b/burguer-queen-88bf7.appspot.com/o/banana-milk.jpg?alt=media&token=8a462da9-3c3e-4de9-adbe-7fd6f414f09d',
    type: 'DESAYUNO',
  });
  schemeTablaProduct.create({
    name: 'Hamburguesa doble',
    price: 15.00,
    image: 'https://firebasestorage.googleapis.com/v0/b/burguer-queen-88bf7.appspot.com/o/double-cheeseburger.jpg?alt=media&token=210896ec-c83c-49c9-9956-49db381820a9',
    type: 'ALMUERZO',
  });
  schemeTablaProduct.create({
    name: 'Papas fritas',
    price: 5.00,
    image: 'https://firebasestorage.googleapis.com/v0/b/burguer-queen-88bf7.appspot.com/o/french-fries.jpg?alt=media&token=82027f1a-a335-42ab-af4d-24ad8ece0a69',
    type: 'ALMUERZO',
  });
  schemeTablaProduct.create({
    name: 'Aros de cebolla',
    price: 5.00,
    image: 'https://firebasestorage.googleapis.com/v0/b/burguer-queen-88bf7.appspot.com/o/aros-cebolla.jpg?alt=media&token=05c93784-ed94-4c95-b5f4-7eb44808c974',
    type: 'ALMUERZO',
  });
  schemeTablaProduct.create({
    name: 'Bebida/gaseosa 500ml',
    price: 7.00,
    image: 'https://firebasestorage.googleapis.com/v0/b/burguer-queen-88bf7.appspot.com/o/gaseosa500.webp?alt=media&token=8e07691d-255d-4109-bed5-4880d086b351',
    type: 'ALMUERZO',
  });
}); */

schemeTablaOrdersProduct.belongsTo(schemeTablaProduct, { foreingKey: 'productId' });
schemeTablaProduct.hasMany(schemeTablaOrdersProduct, { foreingKey: 'productId' });

schemeTablaOrdersProduct.belongsTo(schemeTablaOrder, { foreingKey: 'orderId' });
schemeTablaOrder.hasMany(schemeTablaOrdersProduct, { foreingKey: 'orderId' });

schemeTablaUser.belongsTo(schemeTablaUserRoles, { foreingKey: 'userrolId' });
schemeTablaUserRoles.hasMany(schemeTablaUser, { foreingKey: 'userrolId' });

module.exports = {
  schemeTablaUser,
  schemeTablaProduct,
  schemeTablaOrder,
  schemeTablaOrdersProduct,
  schemeTablaUserRoles,
  schemeTablaOrderStatus,
};
// Task.belongsTo(User, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' })
