const amqp = require('amqplib/callback_api');

const AMQP_URL = "amqp://localhost:5672";

const ON_DEATH = require('death'); //clean buffer

module.exports.publish = function (ex, msgKey, msgPayload) {
    amqp.connect(AMQP_URL, function (err, conn) {
        conn.createChannel(function (err, ch) {
            ch.assertExchange(ex, 'direct', { durable: true });
            ch.publish(ex, msgKey, Buffer.from(msgPayload));
            console.log('[x]', msgKey);
            return '';

        });
        ON_DEATH(function (signal, err) {
            console.log('clean');
            setTimeout(() => { conn.close(); process.exit(0) });
        })
    });
}
//ex คือ สถานที่ qname คือ ชื่อที่จะส่งไป ,msgKey คือ คีย์ที่จะระบุไปให้ใครเลย ,invkFn คือ return ดาต้า
//durable คือ ถ้าเดินสารไม่ได้ให้ทิ้งสารถ้า(true)
//assertExchange คือการสร้างบริษัท
//assertQueue สร้างตู้
//ch.bindQueue(q.queue, ex, msgKey); ระบุที่อยู่ของผู้รับ
//noAck คือการจะบอกว่าส่งสารนั้น ๆ เสร็จแล้วหรือป่าว
module.exports.consume = function (ex, qname, msgKey, invkFn) {
    amqp.connect(AMQP_URL, function (err, conn) {
        console.log('connect success');
        conn.createChannel(function (err, ch) {
            ch.assertExchange(ex, 'direct', { durable: true })
            ch.assertQueue(qname, { exclusive: false }, function (err, q) {
                ch.bindQueue(q.queue, ex, msgKey);
                ch.consume(q.queue, function (msg) {
                    invkFn(msg);
                    ON_DEATH(function (signal, err) {
                        console.log('clean');
                        setTimeout(() => { conn.close(); process.exit(0) });
                    })
                }, { noAck: true })
            })
        })
    })
}