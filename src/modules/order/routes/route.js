'use strict';
var controller = require('../controllers/controller'),
    mq = require('../../core/controllers/rabbitmq'),
    policy = require('../policy/policy');
module.exports = function (app) {
    var url = '/api/orders';
    var urlWithParam = '/api/orders/:orderId';
    app.route(url)//.all(policy.isAllowed)
        .get(controller.getList)
        .post(controller.create);

    app.route(urlWithParam)//.all(policy.isAllowed)
        .get(controller.read)
        .put(controller.update)
        .delete(controller.delete);

    app.param('orderId', controller.getByID);
    mq.consume('casan', 'joseboom', 'creditlimit', (msg) => {
        console.log(msg.content.toString());
    })

}