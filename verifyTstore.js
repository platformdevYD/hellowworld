'use strict';

var https = require('https' );

if(https.globalAgent.maxSockets < 512) {
    https.globalAgent.maxSockets = 512;
}

var dateFormat = require('dateformat');
var logger = require("../../com/log").get();

var APP_ID = 'OA00657229';

var verifiy = exports.verify = function(billing_code, callback) {

    var code = JSON.parse(billing_code);
    logger.info(billing_code);
    var txid = code.result.txid;
    var productCode = code.result.product[0].id;

    var data = JSON.stringify({
        txid: code.result.txid,
        appid: APP_ID,
        signdata: code.result.receipt
    });
    logger.info(data);

    var options = {
        host: "iap.tstore.co.kr",
//        host: "iapdev.tstore.co.kr",
        port: 443,
        headers: { 'content-length': Buffer.byteLength(data),
            'content-type': 'application/json'
            },
        path: "/digitalsignconfirm.iap",
        method: "POST"
    };

    var req = https.request(options, function(res) {
        logger.info("statusCode: ", res.statusCode);
        var data = '';
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            var result = JSON.parse(data);
            logger.info(data);
            // check status
            if(result.status !== 0) {
                callback("billing error"+result.detail);
                return;
            }
            // check item count
            if(!result.count || result.count > 1) {
                callback("item count error" + result.count);
                return;
            }

            if( result.count !== result.product.length ) {
                callback("product array error" + result.count);
                return;
            }

            // check product code
            if( APP_ID !== result.product[0].appid ) {
                callback("APP_ID wrong" + result.product[0].appid);
                return;
            }

            if( productCode !== result.product[0].product_id ) {
                callback("product_code error" + result.product[0].product_id);
                return;
            }

            callback(null);
            return;
        });
    });

    req.on('error', function(e) {
        logger.error(e.toString(0));
        callback(e);
    });

    req.write(data);
    req.end();
};