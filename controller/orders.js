/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-syntax */
const {
  schemeTablaOrder, schemeTablaProduct, schemeTablaOrdersProduct,
  schemeTablaOrderStatus,
} = require('../models/modelScheme');

module.exports = {
  getOrders: (req, resp, next) => {
    const pageAsParm = req.params._page;
    const limitAsParm = req.params._limit;

    schemeTablaOrder.findAll({
      limit: limitAsParm,
      offset: pageAsParm * limitAsParm,
      include: [{
        model: schemeTablaOrderStatus,
      }],
    })
      .then((data) => { resp.status(200).json({ orders: data }); })
      .catch((error) => { resp.status(500).json({ message: error.message }); });
  },

  getOrdersById: async (req, resp, next) => {
    const orderIdasParm = req.params.orderId;

    const foundedOrder = await schemeTablaOrder.findByPk(orderIdasParm, {
      include: [{
        model: schemeTablaOrderStatus,
      }],
    });
    if (foundedOrder) {
      return resp.status(200).json({ foundedOrder });
    }
    resp.status(404).json({ message: 'Product not found.' });
  },

  getAllOrdersProductsPage: (req, resp, next) => {
    const pageAsParm = req.params._page;
    const limitAsParm = req.params._limit;

    schemeTablaOrder.findAll({
      limit: limitAsParm,
      offset: pageAsParm * limitAsParm,
      include: [{
        model: schemeTablaOrdersProduct,
        include: [schemeTablaProduct],
      }],
    })
      .then((order) => resp.send(order));
  },

  getAllOrdersProducts: (req, resp, next) => {
    schemeTablaOrder.findAll({
      include: [{
        model: schemeTablaOrdersProduct,
        include: [schemeTablaProduct],
      }],
    })
      .then((order) => resp.send(order));
  },

  getAllOrdersProductsById: (req, resp, next) => {
    const pageAsParm = req.params._idOrden;
    schemeTablaOrder.findByPk(pageAsParm, {
      include: [{
        model: schemeTablaOrdersProduct, include: [schemeTablaProduct],
      }],
    }).then((order) => {
      if (order) {
        resp.status(200).json({
          id: order.id,
          client: order.client,
          products: order.ordersproducts,
          status: order.status,
          dateEntry: order.dateEntry,
        });
      }
      resp.status(404);
    });
  },

  postOrders: async (req, resp, next) => {
    const userIdFromReq = req.body.userId;
    const clientFromReq = req.body.client;
    const statusFromReq = req.body.status;
    const listOfProducts = req.body.products;

    if (statusFromReq === null || statusFromReq === '') {
      return resp.status(400).json({ message: 'Status from request must not be empty.' });
    }

    const foundedOrderStatus = await schemeTablaOrderStatus.findByPk(statusFromReq);
    if (!foundedOrderStatus) {
      return resp.status(400).json({ message: 'Order status value is invalid. No order status was found.' });
    }

    // para crear un orderProducts primero necesitamos una orden!! entonces la creamos
    schemeTablaOrder.create({
      userId: userIdFromReq,
      client: clientFromReq,
      status: statusFromReq,
      orderstatusId: statusFromReq,
    }).then((createdOrder) => {
      for (const item of listOfProducts) {
        // aqui para insertar un orderProducts necesitamos una orderId, un productId y una cantidad.
        schemeTablaOrdersProduct.create({
          orderId: createdOrder.id,
          productId: item.productid,
          quantity: item.qty,
        });
      }
      schemeTablaOrder.findByPk(createdOrder.id, {
      }).then((order) => {
        resp.status(200).json({ order });
      });
    }, (error) => {
      resp.status(404).json({ error });
    });
  },

  putOrdersById: async (req, resp, next) => {
    const orderIdAsParam = req.params.orderId;
    const foundedOrder = await schemeTablaOrder.findByPk(orderIdAsParam);
    // actualizar los campos email password y roles
    const newClient = req.body.client;
    const newStatus = req.body.status;
    const newProducts = req.body.products;
    const newdateProcessed = req.body.dateProcessed;
    const newDateEntry = req.body.dateEntry;

    if (foundedOrder) {
      try {
        foundedOrder.client = newClient;
        foundedOrder.status = newStatus;
        foundedOrder.products = newProducts;
        foundedOrder.dateProcessed = newdateProcessed;
        foundedOrder.dateEntry = newDateEntry;
        await foundedOrder.save();
        return resp.status(200).json({ message: 'Order updated successfully.' });
      } catch (error) {
        return resp.status(404).json({ error: error.message });
      }
    } else {
      return resp.status(404).json({ message: 'Order not found.' });
    }
  },

  deleteOrdersById: async (req, resp, next) => {
    const orderIdAsParm = req.params.orderId;
    const foundedOrder = await schemeTablaOrder.findByPk(orderIdAsParm);
    if (foundedOrder) {
      try {
        await schemeTablaOrdersProduct.destroy({ where: { orderId: orderIdAsParm } });
        await schemeTablaOrder.destroy({ where: { id: orderIdAsParm } });
        return resp.status(200).json({ message: 'Order was deleted' });
      } catch (error) {
        resp.status(404).json({ error: 'Order was not deleted' });
      }
    }
    return resp.status(404).json({ message: 'Order not found.' });
  },
};
