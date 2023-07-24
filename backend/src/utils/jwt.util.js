const { randomUUID, createHmac } = require('crypto');
const { secret, header, iss, aud } = require('../config/jwt.config.js');

class JWTError extends Error {
    static INVALID = "ERR01";
    static ILLEGAL = "ERR02";
    static EXPIRED = "ERR03";
    static HEADER_REQUIRED = "ERR04";

    static #codes = [
        JWTError.INVALID,
        JWTError.ILLEGAL,
        JWTError.EXPIRED,
        JWTError.HEADER_REQUIRED
    ];
    
    constructor(code, message) {
        if(!JWTError.#codes.includes(code))
            throw new TypeError("Unknown JWTError Code");
        super(message);
        this.name = this.constructor.name;
        this.code = code;
    }
}

const _1_MINUTE = 1;
const _10_MINUTES =_1_MINUTE * 10;
const _30_MINUTES =_10_MINUTES * 3;
const _1_HOUR =_30_MINUTES * 2;
const _6_HOURS =_1_HOUR * 6;
const _12_HOURS =_6_HOURS * 2;
const _1_DAY = _12_HOURS * 2;

const JWTExpiration = { _1_MINUTE, _10_MINUTES, _30_MINUTES, _1_HOUR, _6_HOURS, _12_HOURS, _1_DAY }

function isJSON(src) {
    if(!Array.isArray(src))
        return typeof(src) === 'object';
    return false;
}

const HMACSHA256 = (data) => {
    const hmac = createHmac('sha256', secret);
    return hmac.update(data).digest('base64url');
}

/**
 * 
 * @param {*} payload 
 * @param {Object} config - JWT config { expirationTime - The expiration time in minutes }
 * @returns 
 */
const generateJWT = function (payload, config) {
    /*
        jit (***unique*** jwt id)
        iss (issuer)
        aud (audience)
        iat (issued at time)
        exp (expiration time)

        TODO
        - validate claims according to IANA JSON Web Token Registry
    */
    if(!isJSON(payload))
        throw new TypeError("The 'payload' must be JSON object");
    var exp;
    if(config?.expirationTime) {
        if(!((Number.isFinite(config?.expirationTime) && config?.expirationTime >= 1)))
            throw new TypeError("The 'expirationTime' config field must be finite and bigger than or equal to 1 minute");
        exp = config.expirationTime * 60;
    }
    const iat = Math.floor(Date.now() / 1000);
    payload = {
        jit: randomUUID(), 
        iss: iss,
        aud: aud,
        ...payload,
        iat
    };
    if(exp!=undefined)
        payload.exp = iat + exp;
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const data = encodedHeader + "." + encodedPayload;
    return data + "." + HMACSHA256(data, secret);
}

const inspectJWT = function(jwt) {
    try {
        const [encodedHeader, encodedPayload, signature] = jwt.split('.');
        const header = JSON.parse(Buffer.from(encodedHeader,'base64url').toString('ascii'));
        const payload = JSON.parse(Buffer.from(encodedPayload,'base64url').toString('ascii'));
        return { encoded: { header: encodedHeader, payload: encodedPayload, signature }, header, payload };
    } catch(err) {
        throw new TypeError("Invalid Token");
    }
}

const checkJWT = function({ encoded, header, payload }) {
    if( 
        !encoded || 
        !header || 
        !payload  
    )
        throw new JWTError(JWTError.INVALID,"Invalid access token");
    if(payload.iss !== iss || payload.aud !== aud)
        throw new JWTError(JWTError.ILLEGAL,"Illegal access token");
    if(payload.exp && payload.exp * 1000 < Date.now())
        throw new JWTError(JWTError.EXPIRED,"Expired access token");
    else {
        const signature = HMACSHA256(encoded.header + "." + encoded.payload, secret);
        if(signature !== encoded.signature)
            throw new JWTError(JWTError.INVALID,"Invalid access token");
    }
    return true;
}

module.exports = {
    HMACSHA256,
    generateJWT,
    inspectJWT,
    checkJWT,
    JWTError,
    JWTExpiration
};