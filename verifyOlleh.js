'use strict';

var http = require('http');
var https = require('https');
var crypto = require('crypto');
var xmlParser = require('xml2js').parseString;

if(https.globalAgent.maxSockets < 512) {
    https.globalAgent.maxSockets = 512;
}

var dateFormat = require('dateformat');
var logger = require("../../com/log").get();

var APP_ID = '8101919E';

var RETRY_CNT = function() { return 5; };

var doEncrypt = function (plain, key) {
    if (!key || !key.length) {
        throw new Error('key가 필요합니다.');
    }
    if (key.length !== 16) {
        throw new Error('key.length는 16 이어야 합니다.');
    }

    var cipher = crypto.createCipheriv('aes-128-ecb', key, "");
    //cipher.setAutoPadding(false);
    var crypted = cipher.update(plain, 'utf8', 'base64');
    crypted += cipher.final('base64');
    //return encodeURIComponent(crypted);
    return crypted;
};

var getSymKeyGen = function(try_cnt, callback) {
    var options = {
        //host: "221.148.247.203",
        host: "inapppurchase.ollehmarket.com",
        //port: 7777,
        port: 443,
        headers: { 'accept': '*/*'
        },
        path: "/INAP_GW/inap_gw/getSymKeyGen"
        //rejectUnauthorized: false
    };

    var req = https.get(options, function(res) {
        logger.info("statusCode: ", res.statusCode);
        var data = '';
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            callback(0, data);
            return;
        });
    });

    req.on('error', function(e) {
        logger.error(e);
        //callback(e);
        if(try_cnt < RETRY_CNT()) {
            getSymKeyGen(++try_cnt, callback);
        } else {
            callback(e);
        }

    });
};

var verifyTrid = function(try_cnt, tr_id, key, seq, callback) {

    var crypto_param = doEncrypt("checkBuyDiItem/tr_id/"+tr_id, key);
    logger.info(crypto_param);
    crypto_param = crypto_param.replace(/\//g, '$');
    logger.info(crypto_param);

    var path = "/INAP_GW/inap_gw/crypto_param/" + crypto_param;
    path += "/seq_key/" + seq;
    logger.info(path);

    var options = {
        //host: "221.148.247.203",
        host: "inapppurchase.ollehmarket.com",
        //port: 8080,
        port: 80,
        headers: { 'accept': '*/*'
        },
        path: path
    };

    var req = http.get(options, function(res) {
        logger.info("statusCode: ", res.statusCode);
        var data = '';
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            callback(0, data);
            return;
        });
    });

    req.on('error', function(e) {
        logger.error(e);
        //callback(e);
        if(try_cnt < RETRY_CNT()) {
            verifyTrid(++try_cnt, tr_id, key, seq, callback);
        } else {
            callback(e);
        }
    });
};

var verifiy = exports.verify = function(tr_id, callback) {

    getSymKeyGen(1, function(err, data) {
        if(err) {
            callback(err);
            return;
        }
        logger.info(data);
        xmlParser(data, function(err, result) {
            if(err) {
                callback(err);
                return;
            }
            logger.info(JSON.stringify(result));
            var key = result.response.value[0].symmetric_key[0];
            var seq = result.response.value[0].seq_key[0];

            verifyTrid(1, tr_id, key, seq, function(err, data) {
                if(err) {
                    callback(err);
                    return;
                }
                xmlParser(data, function(err, result) {
                    if(err) {
                        callback(err);
                        return;
                    }

                    var code = result.response.result[0].code[0];
                    if( code !== "0" ) {
                        logger.error(JSON.stringify(result));
                        callback(result.response.result[0].reason[0]);
                        return;
                    }
                    var app_id = result.response.value[0].app_id[0];
                    if( APP_ID !== app_id) {
                        logger.error("app_id dismatch!!");
                        callback("app_id dismatch!!");
                        return;
                    }

                    callback(0, JSON.stringify(result));
                });
            });
        });
    });
};

//console.log(crypto.getCiphers());

//verifiy('{"tr_id":"201212141358491903304", "app_id":"51200017580044", "di_id":"0"}');
//checkBuyDiItem/tr_id/201211201639029603301

//var str = doEncrypt("checkBuyDiItem/tr_id/201211201639029603301", "HF2K40EP917JPFCM");
//console.log(str);
//str = str.replace(/\//g, '$');
//console.log(str);

//verifiy("201211201639029603301 ", function(err, receipt) {
//    console.log(err);
//    console.log(receipt);
//});
