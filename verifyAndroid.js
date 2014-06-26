'use strict';

var logger = require("../../com/log").get();
var crypto = require("crypto");

var algorithm = 'RSA-SHA1',
    publicKeyString = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqD/o7Ghvs1wXUKT1RG+ye43nG3zSfAKEdRFIbCRris6LlCLZrH3gP6RWPccKBPLo0fpwguhS5MnsaeZHoNNUSW0OO/7PiHsQqOZrGKn7ZW+9cOTiJTCCtd+7DDW9K+Dp83ahLSyBkhulKehf6MO/qaVhR8MDuBKodgvp17VBgzEr3aOsJ68t/gZfU9gT85JS3tFq9uBaIvIPry7H5h8I6VJvY0U1faOAyIhEyOASVqM+JbfN+LNQ7lmrE/y0v05AdHH3InU9M9JSItuKZLCN5H7/JSDrxGA+PnjziSaIpLXCfoZBnZWqBpw1oNgUTVjGuhRILuPkQtic9i0J7+tLuwIDAQAB',
    base64EncodedPublicKey = '';

var generateFormattedPublickey = function(publicKeyStr) {
    var KEY_PREFIX, KEY_SUFFIX, chunkSize, chunks, str;
    KEY_PREFIX = "-----BEGIN PUBLIC KEY-----\n";
    KEY_SUFFIX = '\n-----END PUBLIC KEY-----';
    str = publicKeyStr;
    chunks = [];
    chunkSize = 64;
    while (str) {
        if (str.length < chunkSize) {
            chunks.push(str);
            break;
        } else {
            chunks.push(str.substr(0, chunkSize));
            str = str.substr(chunkSize);
        }
    }
    str = chunks.join("\n");
    str = KEY_PREFIX + str + KEY_SUFFIX;
    return str;
};

var verifiy = exports.verify = function(signedData, signature) {
    try{
        var verifier;
        verifier = crypto.createVerify(algorithm);
        verifier.update(signedData);
        return verifier.verify(base64EncodedPublicKey, signature, 'base64');
    } catch(e) {
        logger.error(e);
        return false;
    }
};

base64EncodedPublicKey = generateFormattedPublickey(publicKeyString);

/*
var res = verifiy( "{\"orderId\":\"12999763169054705758.1333471383971425\",\"packageName\":\"com.ydonline.tplay.ETM\",\"productId\":\"test.item.001\",\"purchaseTime\":1383308177668,\"purchaseState\":0,\"purchaseToken\":\"fkmatqpddgtniouizqvqheoo.AO-J1OxyLuPhMG2cxQBqfaP29zkLdM-BngF6BI_EmnufXr7Hb3gcNowtNR_GqfZ-FrJinktnR9ch9OoFW1RuHYyR0wyjOeMA4cmUte5AzBtgK1z5N_d7c45yo1mStbd77WxTz4ep6ZM6\"}",
        "PkFITYKohg40/MDn0rx/InHY5gnArt0CMzBQUjaEzZ+A30zp0W8+WFbDY1bs5HGcX+/ERovmDSqCAIAEf25ZLr3o/sVOqscxePS2wSZwPtxNIeUwag8F/ZB0ZYCD64dm9e/KHuVlGfgsVxmxeONIHRRUXaaqSsMWYpEYYJqub0L3+Pu/l7bdK0M9Paa3Pf1Cm5JPYfuDMOoUjVtQD/BHeYzBIG44q32fnbWOnlIrD8WfyCegcwnDaDIugMs2qXuB0Pq2ZIzrz1/pzDDpB//zrcE6sGDuVBpEB3Q81xYVLyi/mSJTRuHC0eSI8kVCwAbOmKqOrSLm22QohkfXEdFoeg==" );

logger.info(res);

*/


